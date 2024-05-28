import { defineHook } from '@directus/extensions-sdk';

import {ItemsServiceCreator} from './helper/ItemsServiceCreator.js';
import {CollectionsServiceCreator} from './helper/CollectionsServiceCreator.js';
import {Translator} from './Translator';
import {TranslatorSettings} from './TranslatorSettings';
import {DirectusCollectionTranslator} from './DirectusCollectionTranslator.js';
import getSettingsSchema from "./schema/schema";
import yaml from "js-yaml"
import packageJson from "../package.json"
const PLUGIN_NAME = packageJson.name;

const settingsSchemaYAML = getSettingsSchema();
const settingsSchema = yaml.load(settingsSchemaYAML);

const DEV_MODE = false

async function getAndInitItemsServiceCreatorAndTranslatorSettingsAndTranslatorAndSchema(services, database, getSchema, logger) {
	let schema = await getSchema();
	let itemsServiceCreator = new ItemsServiceCreator(services, database, schema);
	let translatorSettings = new TranslatorSettings(services, database, schema);
	await translatorSettings.init();
	let translator = new Translator(translatorSettings, logger);
	await translator.init();
	return {
		itemsServiceCreator: itemsServiceCreator,
		translatorSettings: translatorSettings,
		translator: translator,
		schema: schema
	}
}

async function getCurrentItemForTranslation(itemsService, meta, translations_field) {
	//console.log("getCurrentItemForTranslation");
	let currentItem = {}; //For create we don't have a current item
	let primaryKeys = meta?.keys || [];
	for (let primaryKey of primaryKeys) { //For update we have a current item
		currentItem = await itemsService.readOne(primaryKey, {fields: [translations_field+".*"]});
		break; //we only need get the first primary key
	}
	return currentItem;
}

async function handleCreateOrUpdate(tablename, payload, meta, context, getSchema, services, logger) {
	if(tablename === TranslatorSettings.TABLENAME){
		// Don't translate settings
		return payload;
	}

	//console.log("handleCreateOrUpdate");
	//console.log("Table: "+tablename);
	//console.log("Payload: ");
	//console.log(JSON.stringify(payload, null, 2));
	let database = context.database; //Have to get database here! https://github.com/directus/directus/discussions/13744
	let schemaToGetTranslationFields = await getSchema();

	let field_special_translation = "translations";
	let table_schema = schemaToGetTranslationFields.collections[tablename];
	//  {
	//    "collection": "singletonExample",
	//     ...
	//    "fields": {
	// 	    ...
	//      "translations": {
	//        "field": "translations",
	//        "defaultValue": null,
	//        "nullable": true,
	//        "generated": false,
	//        "type": "alias",
	//        "dbType": null,
	//        "precision": null,
	//        "scale": null,
	//        "special": [
	//          "translations"
	//        ],
	//      }
	//    }
	//  }
	let schema_fields = table_schema.fields;
	// search for all fields which are from type "special" and have "translations" in special array
	let translations_fields = Object.keys(schema_fields).filter(field => schema_fields[field].special?.includes(field_special_translation));

	let payloadContainsTranslations = false;
	for(let translations_field of translations_fields){
		if(payload[translations_field] !== undefined){
			payloadContainsTranslations = true;
			break;
		}
	}
	//console.log("Payload contains translations: "+payloadContainsTranslations);
	if (payloadContainsTranslations) {
		let {
			itemsServiceCreator,
			translatorSettings,
			translator,
			schema
		} = await getAndInitItemsServiceCreatorAndTranslatorSettingsAndTranslatorAndSchema(services, database, getSchema, logger);

		let autoTranslate = await translatorSettings.isAutoTranslationEnabled();
		if (autoTranslate || DEV_MODE) {
			//console.log("Auto-Translation enabled for "+tablename+" table (DEV_MODE: "+DEV_MODE+")");
			let itemsService = await itemsServiceCreator.getItemsService(tablename);
			//console.log("Table schema: ");
			//console.log(JSON.stringify(table_schema, null, 2));
			//console.log("Translations fields: ");
			//console.log(translations_fields);

			let modifiedPayload = payload;
			console.log("["+PLUGIN_NAME+"] - "+"Start translation for "+tablename+" table");
			for(let translations_field of translations_fields){
				let currentItem = await getCurrentItemForTranslation(itemsService, meta, translations_field);
				modifiedPayload = await DirectusCollectionTranslator.modifyPayloadForTranslation(currentItem, modifiedPayload, translator, translatorSettings, itemsServiceCreator, schema, tablename, translations_field);
			}
			console.log("["+PLUGIN_NAME+"] - "+"End translation for "+tablename+" table");

			return modifiedPayload;
		}
	}
	return payload;
}

function registerCollectionAutoTranslation(filter, getSchema, services, logger) {
	let events = ["create", "update"];
	for (let event of events) {
		filter(
			"items." + event,
			async (payload, meta, context) => {
				let tablename = meta?.collection;
				//console.log("Auto-Translation for "+event+" event in "+tablename);
				return await handleCreateOrUpdate(tablename, payload, meta, context, getSchema, services, logger);
			}
		);
	}
}

function registerAuthKeyReloader(filter, translator) {
	filter(
		TranslatorSettings.TABLENAME + ".items.update",
		async (payload, meta, context) => {
			if (payload?.auth_key !== undefined) { // Auth Key changed
				try {
					//console.log("registerAuthKeyReloader");
					await translator.reloadAuthKey(payload?.auth_key); //Try to reload auth key
					//console.log("Censoring api key not")
					const censoredPayload = await translator.translatorSettings.saveApiKeySecureIfConfiguredAndReturnPayload(payload)
					const correctObj = await translator.getSettingsAuthKeyCorrectObject(); //

					payload = {...censoredPayload, ...correctObj}; //Set settings to valid
					//console.log("Final payload at: registerAuthKeyReloader");
					//console.log(JSON.stringify(payload, null, 2))

				} catch (err) { //Auth Key not valid
					payload = {...payload, ...translator.getSettingsAuthKeyErrorObject(err)};
				}
			}
			return payload;
		}
	);
}

async function checkSettingsCollection(services, database, schema) {
	let collectionsServiceCreator = new CollectionsServiceCreator(services, database, schema);
	let collectionsService = await collectionsServiceCreator.getCollectionsService();
	try {
		let collections = await collectionsService.readByQuery(); //no query params possible !
		let collectionFound = false;
		for (let collection of collections) {
			if (collection.collection === TranslatorSettings.TABLENAME) {
				collectionFound = true;
				break;
			}
		}
		if (!collectionFound) {
			console.log("Collection "+TranslatorSettings.TABLENAME+" not found");
			let settingsSchemaCollection = settingsSchema.collections[0];
			let settingsSchemaFields = settingsSchema.fields;

			console.log("Creating "+TranslatorSettings.TABLENAME+" collection");
			await collectionsService.createOne({
				...settingsSchemaCollection,
				fields: settingsSchemaFields
			});
			console.log("Created "+TranslatorSettings.TABLENAME+" collection");
		} else {
			//console.log("Settings collection found");
		}

	} catch (err) {
		console.log(err);
	}
}

export default defineHook(({filter, action, init, schedule}, {
	services,
	database,
	getSchema,
	logger
}) => {
	console.log("Init auto backup")

	action(
		"server.start",
		async (meta, context) => {
			try{
				let schema = await getSchema();
				console.log("Loading Plugin")
				await checkSettingsCollection(services, database, schema)

				let translatorSettings = new TranslatorSettings(services, database, schema);
				await translatorSettings.init();
				let translator = new Translator(translatorSettings, logger);
				await translator.init();
				registerAuthKeyReloader(filter, translator);

				registerCollectionAutoTranslation(filter, getSchema, services, logger);
				//registerLanguagesFilter(filter, getSchema, services, logger); //TODO implement auto translate for new languages
			} catch (err) {
				let errMsg = err.toString();
				if(errMsg.includes("no such table: directus_collections")){
					console.log("++++++++++ Auto Translation +++++++++++");
					console.log("++++ Database not initialized yet +++++");
					console.log("++ Restart Server again after setup +++");
					console.log("+++++++++++++++++++++++++++++++++++++++");
				} else {
					console.log("Auto-Translation init error: ");
					console.log(err);
				}
			}
		}
	)
});
