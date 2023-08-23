const ItemsServiceCreator = require("./helper/ItemsServiceCreator");
const fs = require('fs')
const path = require('path')
const ENV_NAME_API_KEY = "AUTO_TRANSLATE_API_KEY";
const ENV_NAME_PATH_TO_SAVE_API_KEY = "AUTO_TRANSLATE_API_KEY_SAVING_PATH";
const API_KEY_PLACEHOLDER = "XXXXXXXXXXXXXXXXXXXXX";

const FIELDNAME_AUTH_KEY = "auth_key";

module.exports = class TranslatorSettings {

    static TABLENAME = "auto_translation_settings";

    constructor(services, database, schema) {
        this.database = database;
        this.itemsServiceCreator = new ItemsServiceCreator(services, database, schema);
        this.apiKey = null; // To hold the API key in memory
    }

    async init(){
        this.translationSettingsService = await this.itemsServiceCreator.getItemsService(TranslatorSettings.TABLENAME);

        // Load the API key from the file if the environment variable is set
        const apiKeyPath = process.env[ENV_NAME_PATH_TO_SAVE_API_KEY];
        if (apiKeyPath) {
            this.apiKey = fs.readFileSync(path.resolve(apiKeyPath), 'utf-8').trim();
        }
    }

    async setSettings(newSettings) {
        const apiKeyPath = process.env[ENV_NAME_PATH_TO_SAVE_API_KEY];

        // If a new API key is provided and the environment variable is set
        if (apiKeyPath && newSettings[FIELDNAME_AUTH_KEY] && newSettings[FIELDNAME_AUTH_KEY] !== this.apiKey) {
            // Save the new API key to the specified file
            fs.writeFileSync(path.resolve(apiKeyPath), newSettings[FIELDNAME_AUTH_KEY], 'utf-8');

            // Update the in-memory apiKey with the new value
            this.apiKey = newSettings[FIELDNAME_AUTH_KEY];

            // Replace the API key with a placeholder before saving to the database
            newSettings[FIELDNAME_AUTH_KEY] = API_KEY_PLACEHOLDER;
        }

        const apiKey = process.env[ENV_NAME_API_KEY];
        if(apiKey){
            newSettings[FIELDNAME_AUTH_KEY] = API_KEY_PLACEHOLDER;
        }

        let settings = await this.getSettings();
        if(!!settings && settings?.id){
            await this.translationSettingsService.updateOne(settings?.id, newSettings);
        }
    }

    async getSettings() {
        const apiKeyPath = process.env[ENV_NAME_PATH_TO_SAVE_API_KEY];
        const apiKey = process.env[ENV_NAME_API_KEY];

        // on creating an item, we cant use knex?
        // KnexTimeoutError: Knex: Timeout acquiring a connection. The pool is probably full.
        let settings = await this.translationSettingsService.readByQuery({});
        if(!!settings && settings.length > 0){
            let settingsToReturn = settings[0];

            if (apiKeyPath && this.apiKey) {
                settingsToReturn[FIELDNAME_AUTH_KEY] = this.apiKey;
            }
            if(apiKey){
                settingsToReturn[FIELDNAME_AUTH_KEY] = apiKey;
            }

            return settingsToReturn;
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
