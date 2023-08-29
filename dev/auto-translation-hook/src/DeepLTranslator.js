const deepl = require("deepl-node");

module.exports = class DeepLTranlator {

    constructor(auth_key) {
        this.translator = new deepl.Translator(auth_key);
    }

    async init(){
        /**
        console.log("Initializing DeepL Translator");
        const sourceLanguages = await this.translator.getSourceLanguages();
        console.log("Source Languages: ");
        for (let i = 0; i < sourceLanguages.length; i++) {
            const lang = sourceLanguages[i];
            console.log(`${lang.name} (${lang.code})`); // Example: 'English (en)'
        }

        console.log("");
        const targetLanguages = await this.translator.getTargetLanguages();
        console.log("Target Languages: ");
        for (let i = 0; i < targetLanguages.length; i++) {
            const lang = targetLanguages[i];
            console.log(`${lang.name} (${lang.code}) supports formality`);
        }
         */
    }

    async translate(text, source_language, destination_language) {
        let translationResponse = null;
        let sourceLanguageCode = this.getDeepLLanguageCode(source_language);
        let destinationLanguageCode = this.getDeepLLanguageCode(destination_language);

        try{
            translationResponse = await this.translateRaw(text, sourceLanguageCode, destinationLanguageCode);
        } catch(error){
            let errorMessage = error.toString();
            if(errorMessage.includes("targetLang") && errorMessage.includes("deprecated")){
                //console.log("Target language is deprecated");
                try{
                    translationResponse = await this.translateRaw(text, sourceLanguageCode, destination_language);
                } catch(error){
                    console.log(error);
                }
            } else {
                console.log(error);
            }
        }

        return translationResponse;
    }

    async translateRaw(text, source_language_code, destination_language_code) {
        //copy text string to another variable
        let textToTranslate = text;

        const dictWithReplacement = {
            // "original": "replacement"
            // replace * with <*>
            "*": "<*>",
        }

        //replace all keys in dictWithReplacement with their values
        for (const [key, value] of Object.entries(dictWithReplacement)) {
            textToTranslate = textToTranslate.replaceAll(key, value);
        }

        console.log("translate:")
        console.log("text: "+text);
        console.log("source_language_code: "+source_language_code)
        console.log("destination_language_code: "+destination_language_code)

        let translationResponse = await this.translator.translateText(textToTranslate, source_language_code, destination_language_code);
        let translation = translationResponse?.text;

        //replace all values in dictWithReplacement with their keys
        for (const [key, value] of Object.entries(dictWithReplacement)) {
            translation = translation.replaceAll(value, key);
        }

        //replace all <*>'s with *'s

        return translation;
    }

    async getExtra(){
        let extraObj = {};
        const sourceLanguages = await this.translator.getSourceLanguages()
        const targetLanguages = await this.translator.getTargetLanguages()
        extraObj.sourceLanguages = sourceLanguages;
        extraObj.targetLanguages = targetLanguages;
        const extra = JSON.stringify(extraObj, null, 2);

        return {
            extra: extra || "",
        }
    }

    async getUsage(){
        const usage = await this.translator.getUsage();
        if (usage.anyLimitReached()) {
            console.log('Translation limit exceeded.');
        }
        const characterUsage = usage?.character; // {"character":{"count":0,"limit":500000}}

        return {
            used: characterUsage?.count || 0,
            limit: characterUsage?.limit || 0,
        }
    }

    /**
     * Private Methods
     */

    getDeepLLanguageCode(directus_language_code) {
        /** directus_language_code
         * e.g. "en-US" -> "en"
         */

        /** Source languages
        Bulgarian (bg)
        Czech (cs)
        Danish (da)
        German (de)
        Greek (el)
        English (en)
        Spanish (es)
        Estonian (et)
        Finnish (fi)
        French (fr)
        Hungarian (hu)
        Indonesian (id)
        Italian (it)
        Japanese (ja)
        Lithuanian (lt)
        Latvian (lv)
        Dutch (nl)
        Polish (pl)
        Portuguese (pt)
        Romanian (ro)
        Russian (ru)
        Slovak (sk)
        Slovenian (sl)
        Swedish (sv)
        Turkish (tr)
        Chinese (zh)
         */

        /** Target languages
         Bulgarian (bg) supports formality
         Czech (cs) supports formality
         Danish (da) supports formality
         German (de) supports formality
         Greek (el) supports formality
         English (British) (en-GB) supports formality
         English (American) (en-US) supports formality
         Spanish (es) supports formality
         Estonian (et) supports formality
         Finnish (fi) supports formality
         French (fr) supports formality
         Hungarian (hu) supports formality
         Indonesian (id) supports formality
         Italian (it) supports formality
         Japanese (ja) supports formality
         Lithuanian (lt) supports formality
         Latvian (lv) supports formality
         Dutch (nl) supports formality
         Polish (pl) supports formality
         Portuguese (Brazilian) (pt-BR) supports formality
         Portuguese (European) (pt-PT) supports formality
         Romanian (ro) supports formality
         Russian (ru) supports formality
         Slovak (sk) supports formality
         Slovenian (sl) supports formality
         Swedish (sv) supports formality
         Turkish (tr) supports formality
         Chinese (simplified) (zh) supports formality
         */

        if(!!directus_language_code){
            let splits = directus_language_code.split("-");
            return splits[0];
        }
        return directus_language_code;
    }
}
