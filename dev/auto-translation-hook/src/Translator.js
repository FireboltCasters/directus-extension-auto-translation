const DeepLTranslator = require('./DeepLTranslator');

module.exports = class Translator {

    constructor(translatorSettings, logger) {
        this.logger = logger;
        this.translatorSettings = translatorSettings;
    }

    async init() {
        try {
            let auth_key = await this.getAuthKey();
            await this.reloadAuthKey(auth_key);
            let correctObj = await this.getSettingsAuthKeyCorrectObject();
            await this.setSettings(correctObj)
        } catch (error) {
            await this.setSettings(this.getSettingsAuthKeyErrorObject(error));
        }
    }

    async translate(text, source_language, destination_language) {
        const translation = await this.translatorImplementation.translate(text, source_language, destination_language);
        await this.reloadUsage(); //update usage stats
        return translation;
    }

    async getSettingsAuthKeyCorrectObject() {
        const usage = await this.getUsage();
        return {valid_auth_key: true, informations: "Auth Key is valid!", ...usage};
    }

    getSettingsAuthKeyErrorObject(error) {
        return {auth_key: null, valid_auth_key: false, informations: "Auth Key not valid!\n" + error.toString()}
    }

    /** Private Methods */

    async reloadAuthKey(auth_key) {
        this.translatorImplementation = new DeepLTranslator(auth_key);
        await this.translatorImplementation.init();
        await this.reloadUsage();
    }

    async reloadUsage() {
        const usage = await this.getUsage();
        const used = usage.used || 0;
        const limit = usage.limit || 0;
        let percentage = 0;
        if (limit > 0) {
            percentage = Math.round((used / limit) * 100);
        }
        await this.setSettings({percentage: percentage, ...usage});
    }

    async getUsage() {
        return await this.translatorImplementation.getUsage();
    }

    async setSettings(newSettings) {
        await this.translatorSettings.setSettings(newSettings);
    }

    async getAuthKey() {
        return await this.translatorSettings.getAuthKey();
    }

}
