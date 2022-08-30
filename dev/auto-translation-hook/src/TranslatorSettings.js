const ItemsServiceCreator = require("./helper/ItemsServiceCreator");

const FIELDNAME_AUTH_KEY = "auth_key";

module.exports = class TranslatorSettings {

    static TABLENAME = "auto_translation_settings";

    constructor(services, database, schema) {
        this.database = database;
        this.itemsServiceCreator = new ItemsServiceCreator(services, database, schema);
    }

    async init(){
        this.translationSettingsService = await this.itemsServiceCreator.getItemsService(TranslatorSettings.TABLENAME);
    }

    async setSettings(newSettings) {
        let settings = await this.getSettings();
        if(!!settings && settings?.id){
            await this.translationSettingsService.updateOne(settings?.id, newSettings);
        }
    }

    async getSettings() {
        // on creating an item, we cant use knex?
        // KnexTimeoutError: Knex: Timeout acquiring a connection. The pool is probably full.
        let settings = await this.translationSettingsService.readByQuery({});
        if(!!settings && settings.length > 0){
            return settings[0];
        }
        return null;
    }

    async isAutoTranslationEnabled() {
        let settings = await this.getSettings();
        return settings?.active;
    }

    async getAuthKey() {
        let settings = await this.getSettings();
        return settings?.[FIELDNAME_AUTH_KEY];
    }

}
