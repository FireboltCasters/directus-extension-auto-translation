const ItemsServiceCreator = require("./helper/ItemsServiceCreator");
const Translator = require("./Translator");
const TranslatorSettings = require("./TranslatorSettings");
const DirectusCollectionTranslator = require("./DirectusCollectionTranslator");

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

async function handleCreateOrUpdate(tablename, payload, meta, context, getSchema, services, logger){
    if (payload?.translations) {
        let database = context.database; //Have to get database here! https://github.com/directus/directus/discussions/13744

        let {
            itemsServiceCreator,
            translatorSettings,
            translator,
            schema
        } = await getAndInitItemsServiceCreatorAndTranslatorSettingsAndTranslatorAndSchema(services, database, getSchema, logger);
        let itemsService = await itemsServiceCreator.getItemsService(tablename);

        let autoTranslate = await translatorSettings.isAutoTranslationEnabled();
        if (autoTranslate) {
            let currentItem = await getCurrentItemForTranslation(itemsService, meta);
            return await DirectusCollectionTranslator.modifyPayloadForTranslation(currentItem, payload, translator, translatorSettings, itemsServiceCreator, schema, tablename);
        }
    }
    return payload;
}

function registerCollectionAutoTranslation(filter, tablename, getSchema, services, logger) {
    let events = ["create", "update"];
    for (let event of events) {
        filter(
            tablename + ".items."+event,
            async (payload, meta, context) => {
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
                    await translator.reloadAuthKey(payload?.auth_key); //Try to reload auth key
                    const correctObj = await translator.getSettingsAuthKeyCorrectObject(); //
                    payload = {...payload, ...correctObj}; //Set settings to valid
                } catch (err) { //Auth Key not valid
                    payload = {...payload, ...translator.getSettingsAuthKeyErrorObject(err)};
                }
            }
            return payload;
        }
    );
}

module.exports = async function ({filter, action, init, schedule}, {
    services,
    exceptions,
    database,
    getSchema,
    logger
}) {
    let schema = await getSchema();
/**
    let translatorSettings = new TranslatorSettings(services, database, schema);
    await translatorSettings.init();
    let translator = new Translator(translatorSettings, logger);
    await translator.init();
    registerAuthKeyReloader(filter, translator);

    registerCollectionAutoTranslation(filter, "wikis", getSchema, services, logger);
 */
};
