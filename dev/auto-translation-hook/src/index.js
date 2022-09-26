const ItemsServiceCreator = require("./helper/ItemsServiceCreator");
const CollectionsServiceCreator = require("./helper/CollectionsServiceCreator");
const Translator = require("./Translator");
const TranslatorSettings = require("./TranslatorSettings");
const DirectusCollectionTranslator = require("./DirectusCollectionTranslator");
const getSettingsSchema = require("./schema/schema.js");
const settingsSchemaYAML = getSettingsSchema();
const yaml = require('js-yaml');
const settingsSchema = yaml.load(settingsSchemaYAML);

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

async function getCurrentItemForTranslation(itemsService, meta) {
    let currentItem = {}; //For create we don't have a current item
    let primaryKeys = meta?.keys || [];
    for (let primaryKey of primaryKeys) { //For update we have a current item
        currentItem = await itemsService.readOne(primaryKey, {fields: ["translations.*"]});
        break; //we only need get the first primary key
    }
    return currentItem;
}

async function handleCreateOrUpdate(tablename, payload, meta, context, getSchema, services, logger) {
    if (payload?.translations) {
        let database = context.database; //Have to get database here! https://github.com/directus/directus/discussions/13744

        let {
            itemsServiceCreator,
            translatorSettings,
            translator,
            schema
        } = await getAndInitItemsServiceCreatorAndTranslatorSettingsAndTranslatorAndSchema(services, database, getSchema, logger);

        let autoTranslate = await translatorSettings.isAutoTranslationEnabled();
        if (autoTranslate) {
            let itemsService = await itemsServiceCreator.getItemsService(tablename);
            let currentItem = await getCurrentItemForTranslation(itemsService, meta);
            return await DirectusCollectionTranslator.modifyPayloadForTranslation(currentItem, payload, translator, translatorSettings, itemsServiceCreator, schema, tablename);
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
                return await handleCreateOrUpdate(tablename, payload, meta, context, getSchema, services, logger);
            }
        );
    }
}

async function checkAllCollectionsForMissingTranslations(payload, meta, context, getSchema, services, logger) {
    let database = context.database; //Have to get database here! https://github.com/directus/directus/discussions/13744

    let {
        itemsServiceCreator,
        translatorSettings,
        translator,
        schema
    } = await getAndInitItemsServiceCreatorAndTranslatorSettingsAndTranslatorAndSchema(services, database, getSchema, logger);
    let autoTranslate = await translatorSettings.isAutoTranslationEnabled();
    if (autoTranslate) {
        //let itemsService = await itemsServiceCreator.getItemsService(tablename);

        let currentItem = await getCurrentItemForTranslation(itemsService, meta);
        return await DirectusCollectionTranslator.modifyPayloadForTranslation(currentItem, payload, translator, translatorSettings, itemsServiceCreator, schema, tablename);
    }
}

function registerLanguagesFilter(filter, getSchema, services, logger) {
    const tableName = "languages";
    filter(
        tableName+".items." + "create",
        async (payload, meta, context) => {
            return await checkAllCollectionsForMissingTranslations(payload, meta, context, getSchema, services, logger);
        }
    );
    filter(
        tableName+".items." + "update",
        async (payload, meta, context) => {
            //return await checkAllCollectionsForMissingTranslations(payload, meta, context, getSchema, services, logger);
        }
    );
}


function registerAuthKeyReloader(filter, translator) {
    filter(
        TranslatorSettings.TABLENAME + ".items.update",
        async (payload, meta, context) => {
            console.log("Reloading auth key");
            if (payload?.auth_key !== undefined) { // Auth Key changed
                console.log("Auth key changed");
                try {
                    await translator.reloadAuthKey(payload?.auth_key); //Try to reload auth key
                    const correctObj = await translator.getSettingsAuthKeyCorrectObject(); //
                    console.log("Auth key correct object", correctObj);
                    payload = {...payload, ...correctObj}; //Set settings to valid
                } catch (err) { //Auth Key not valid
                    console.log("Auth key not valid");
                    console.log(err);
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
            console.log("Creating "+TranslatorSettings.TABLENAME+" collection");
            let settingsSchemaCollection = settingsSchema.collections[0];
            let settingsSchemaFields = settingsSchema.fields;

             await collectionsService.createOne({
                 ...settingsSchemaCollection,
                 fields: settingsSchemaFields
             });
            console.log("Created "+TranslatorSettings.TABLENAME+" collection");
        } else {
            //console.log();
        }

    } catch (err) {
        console.log(err);
    }
}

module.exports = async function ({filter, action, init, schedule}, {
    services,
    exceptions,
    database,
    getSchema,
    logger
}) {
    let schema = await getSchema();
    await checkSettingsCollection(services, database, schema)

     let translatorSettings = new TranslatorSettings(services, database, schema);
     await translatorSettings.init();
     let translator = new Translator(translatorSettings, logger);
     await translator.init();
     registerAuthKeyReloader(filter, translator);

     registerCollectionAutoTranslation(filter, getSchema, services, logger);
     registerLanguagesFilter(filter, getSchema, services, logger);
};
