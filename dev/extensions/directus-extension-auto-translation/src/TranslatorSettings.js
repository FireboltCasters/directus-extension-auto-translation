import {ItemsServiceCreator} from './helper/ItemsServiceCreator.js';
import fs from 'fs';
import path from 'path';

const ENV_NAME_API_KEY = "AUTO_TRANSLATE_API_KEY";
const ENV_NAME_PATH_TO_SAVE_API_KEY = "AUTO_TRANSLATE_API_KEY_SAVING_PATH";
const API_KEY_PLACEHOLDER = "XXXXXXXXXXXXXXXXXXXXX";

const FIELDNAME_AUTH_KEY = "auth_key";

export class TranslatorSettings {

    static TABLENAME = "auto_translation_settings";

    constructor(services, database, schema) {
        this.database = database;
        this.itemsServiceCreator = new ItemsServiceCreator(services, database, schema);
        this.apiKey = null; // To hold the API key in memory
    }

    async init(){
        console.log("INIT TranslatorSettings");
        this.translationSettingsService = await this.itemsServiceCreator.getItemsService(TranslatorSettings.TABLENAME);

        // Load the API key from the file if the environment variable is set
        const apiKeyPath = process.env[ENV_NAME_PATH_TO_SAVE_API_KEY];
        console.log("API PATH: "+apiKeyPath);
        if (apiKeyPath) {
            try{
                this.apiKey = fs.readFileSync(path.resolve(apiKeyPath), 'utf-8').trim();
                console.log("Found API key: "+this.apiKey)
            } catch (err){
                console.log("File not found yet. Will create it later")
            }
        }
    }

    saveApiKeySecureIfConfiguredAndReturnPayload(payload) {
        const apiKeyPath = process.env[ENV_NAME_PATH_TO_SAVE_API_KEY];

        let newApiKey = payload[FIELDNAME_AUTH_KEY];
        console.log("new API key: " + newApiKey);

        if (apiKeyPath && newApiKey) {
            let filePath = path.resolve(apiKeyPath);
            let dirName = path.dirname(filePath);

            // Check if the directory exists; if not, create it
            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(dirName, { recursive: true });
                console.log("Created directory: " + dirName);
            }

            console.log("Saving to file");
            fs.writeFileSync(filePath, newApiKey, 'utf-8');

            // Update the in-memory apiKey with the new value
            this.apiKey = newApiKey;

            // Replace the API key with a placeholder before saving to the database
            payload[FIELDNAME_AUTH_KEY] = API_KEY_PLACEHOLDER;
        }

        return payload;
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
            let settingsToReturn = settings[0];
            return settingsToReturn;
        }
        return null;
    }

    async isAutoTranslationEnabled() {
        let settings = await this.getSettings();
        return settings?.active;
    }

    async getAuthKey() {
        return this.apiKey;
    }

}
