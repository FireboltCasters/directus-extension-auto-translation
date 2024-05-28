export class DirectusCollectionTranslator {
    static FIELD_BE_SOURCE_FOR_TRANSLATION = "be_source_for_translations";
    static FIELD_LET_BE_TRANSLATED = "let_be_translated";

    static FIELD_LANGUAGES_IDS_NEW = "languages_id"
    static FIELD_LANGUAGES_CODE_OLD = "languages_code"
    static FIELD_LANGUAGES_ID_OR_CODE = undefined;

    static COLLECTION_LANGUAGES = "languages";

    /**
     * We only need to translate if there are translations to translate
     * Therefore check if there are new translations to create
     * or if there are translations to update
     */
    static areTranslationsToTranslate(payload: any) {
        if (!!payload && !!payload.translations) {
            let newTranslationsActions = payload?.translations || {};
            let newTranslationsCreateActions = newTranslationsActions?.create || [];
            let newTranslationsUpdateActions = newTranslationsActions?.update || [];
            return newTranslationsCreateActions.length > 0 || newTranslationsUpdateActions.length > 0;
        }
        return false;
    }

    static getSourceTranslationFromTranslations(translations: any, schema: any, collectionName: any) {
        if (!!translations && translations.length > 0) {
            for (let translation of translations) {
                let let_be_source_for_translation = DirectusCollectionTranslator.getValueFromPayloadOrDefaultValue(translation, DirectusCollectionTranslator.FIELD_BE_SOURCE_FOR_TRANSLATION, schema, collectionName);
                if (!!let_be_source_for_translation) {
                    return translation;
                }
            }
        }
    }

    static getSourceTranslationFromListsOfTranslations(listsOfTranslations, schema, collectionName) {
        if (!!listsOfTranslations && listsOfTranslations.length > 0) {
            for (let i = 0; i < listsOfTranslations.length; i++) {
                let translations = listsOfTranslations[i];
                let sourceTranslation = DirectusCollectionTranslator.getSourceTranslationFromTranslations(translations, schema, collectionName);
                if (!!sourceTranslation) {
                    return sourceTranslation;
                }
            }
        }
        return null;
    }

    /**
     * This is due to a change from languages_code to languages_ids newer than directus 9.20.1 (or mayer much newer like 10)
     * therefore we identify which field is used and set it accordingly
     * @param translation
     */
    static setFIELD_LANGUAGES_ID_OR_CODE(translation){
        const translationFieldOld = translation?.[DirectusCollectionTranslator.FIELD_LANGUAGES_CODE_OLD]
        if(!!translationFieldOld){
            DirectusCollectionTranslator.FIELD_LANGUAGES_ID_OR_CODE = DirectusCollectionTranslator.FIELD_LANGUAGES_CODE_OLD
        }
        const translationFieldNew = translation?.[DirectusCollectionTranslator.FIELD_LANGUAGES_IDS_NEW]
        if(!!translationFieldNew){
            DirectusCollectionTranslator.FIELD_LANGUAGES_ID_OR_CODE = DirectusCollectionTranslator.FIELD_LANGUAGES_IDS_NEW
        }
    }

    static parseTranslationListToLanguagesCodeDict(translations) {
        let languagesCodeDict = {};
        for (let translation of translations) {
            DirectusCollectionTranslator.setFIELD_LANGUAGES_ID_OR_CODE(translation);

            languagesCodeDict[translation?.[DirectusCollectionTranslator.FIELD_LANGUAGES_ID_OR_CODE]?.code] = translation;
        }
        return languagesCodeDict;
    }

    static async modifyPayloadForTranslation(currentItem, payload, translator, translatorSettings, itemsServiceCreator, schema, collectionName, translations_field) {
        if (DirectusCollectionTranslator.areTranslationsToTranslate(payload)) {
            let workPayload = JSON.parse(JSON.stringify(payload));

            /**
              workPayload
              {
                "translations": {
                  "create": [],
                  "update": [
                    {
                      "description": "Okay was geht ab?",
                      "languages_id": {
                        "code": "de-DE"
                      },
                      "id": 1
                    }
                  ],
                  "delete": []
                }
              }
             */

            let currentTranslations = currentItem?.[translations_field] || []; //need to know, if we need to update old translations or create them

            /**
             currentTranslations
             [
               {
                 "id": 1,
                 "test_id": 1,
                 "languages_id": "de-DE",
                 "be_source_for_translation": true,
                 "let_be_translated": true,
                 "create_translations_for_all_languages": true,
                 "description": "Okay was geht ab?"
               },
               {
                 "id": 2,
                 "test_id": 1,
                 "languages_id": "ar-SA",
                 "be_source_for_translation": false,
                 "let_be_translated": true,
                 "create_translations_for_all_languages": true,
                 "description": null
               }
             ]
             */

            let existingTranslations = {};
            for (let translation of currentTranslations) {
                existingTranslations[translation?.[DirectusCollectionTranslator.FIELD_LANGUAGES_ID_OR_CODE]] = translation;
            }

            let newTranslationsActions = workPayload?.[translations_field] || {};
            let newTranslationsCreateActions = newTranslationsActions?.create || [];
            let newTranslationsUpdateActions = newTranslationsActions?.update || [];

            let newTranslationsCreateLanguageDict = DirectusCollectionTranslator.parseTranslationListToLanguagesCodeDict(newTranslationsCreateActions);
            let newTranslationsUpdateLanguageDict = DirectusCollectionTranslator.parseTranslationListToLanguagesCodeDict(newTranslationsUpdateActions);

            let sourceTranslationInExistingItem = DirectusCollectionTranslator.getSourceTranslationFromListsOfTranslations([currentTranslations], schema, collectionName);
            let sourceTranslationInPayload = DirectusCollectionTranslator.getSourceTranslationFromListsOfTranslations([newTranslationsCreateActions, newTranslationsUpdateActions], schema, collectionName);

            let sourceTranslation = sourceTranslationInPayload || sourceTranslationInExistingItem
            //TODO Maybe throw an error if multiple source translations are found?

            if (sourceTranslation) { // we should always have a source translation, since we checked if there are update or create translations
                let sourceTranslationLanguageCode = sourceTranslation?.[DirectusCollectionTranslator.FIELD_LANGUAGES_ID_OR_CODE]?.code;
                //console.log("sourceTranslationLanguageCode: ", sourceTranslationLanguageCode);

                let languagesService = itemsServiceCreator.getItemsService(DirectusCollectionTranslator.COLLECTION_LANGUAGES);
                let languages = await languagesService.readByQuery({});
                if (languages.length > 0) {
                    let translationsToCreate = [];
                    let translationsToUpdate = [];
                    let translationsToDelete = [];

                    let fieldsToTranslate = DirectusCollectionTranslator.getFieldsToTranslate(schema, collectionName);

                    for (let language of languages) {
                        let language_code = language?.code;
                        //console.log("--------");
                        //console.log("Check for language_code: ", language_code);

                        let existingTranslation = existingTranslations[language_code];
                        let isSourceTranslation = language_code === sourceTranslationLanguageCode;

                        if (!!existingTranslation) { // we have an existing translation, so we need to update it
                            /**
                             * UPDATE
                             */
                            //console.log("There is an existingTranslation");
                            if (isSourceTranslation) {
                                //console.log("Its the source translation, we just pass it through");
                                //TODO set be_source_for_translation to false
                                translationsToUpdate.push({
                                    ...sourceTranslation,
                                });
                            } else {
                                //console.log("Its not the source translation, we need to check if it needs to be updated");
                                let translationInPayload = newTranslationsUpdateLanguageDict[language_code];

                                //check if in the payload the user has given the field "let_be_translated" and overwrite the existing value if it exists
                                let letBeTranslatedInExistingTranslation = existingTranslation?.[DirectusCollectionTranslator.FIELD_LET_BE_TRANSLATED];
                                //console.log("The existing translation has the field let_be_translated: ", letBeTranslatedInExistingTranslation);
                                let createTranslation = letBeTranslatedInExistingTranslation;
                                let letBeTranslatedInPayload = DirectusCollectionTranslator.getValueFromPayloadOrDefaultValue(translationInPayload, DirectusCollectionTranslator.FIELD_LET_BE_TRANSLATED, schema, collectionName);
                                //console.log("The translation in the payload has the field let_be_translated: ", letBeTranslatedInPayload);
                                if (DirectusCollectionTranslator.isValueDefined(letBeTranslatedInPayload)) { //if payload has false or true, overwrite existing value
                                    createTranslation = letBeTranslatedInPayload;
                                }
                                //console.log("The translation in the payload will be created: ", createTranslation);

                                if (!!createTranslation) {
                                    //console.log("Create translation");
                                    let translatedItem = await DirectusCollectionTranslator.translateTranslationItem(sourceTranslation, language_code, translator, translatorSettings, fieldsToTranslate);
                                    translationsToUpdate.push({
                                        ...existingTranslation,
                                        ...translatedItem});
                                } else if (!!translationInPayload) { //The user has given a payload but dont want it to be translated
                                    //console.log("Use the given payload")
                                    translationsToUpdate.push({
                                        ...translationInPayload,
                                        [DirectusCollectionTranslator.FIELD_BE_SOURCE_FOR_TRANSLATION]: false, //but we dont want it to be the source translation anymore
                                    });
                                } else {
                                    //console.log("No payload given for this language");
                                }
                            }
                        } else {
                            /**
                             * CREATE
                             */
                            //console.log("No existingTranslation");
                            if (isSourceTranslation) {
                                //TODO set be_source_for_translation to false
                                //console.log("Its the source translation, we just pass it through");
                                translationsToCreate.push({
                                    ...sourceTranslation,
                                    [DirectusCollectionTranslator.FIELD_LET_BE_TRANSLATED]: DirectusCollectionTranslator.getValueFromPayloadOrDefaultValue(sourceTranslation, DirectusCollectionTranslator.FIELD_LET_BE_TRANSLATED, schema, collectionName),
                                    [DirectusCollectionTranslator.FIELD_BE_SOURCE_FOR_TRANSLATION]: true,
                                });
                            } else {
                                //console.log("Its not the source translation, we need to check if it needs to be created");
                                //If we dont have an existing translation and the permission to all languages is set
                                let translationInPayload = newTranslationsCreateLanguageDict[language_code];

                                //console.log("translationInPayload: ");
                                //console.log(translationInPayload);
                                let letBeTranslatedInPayload = DirectusCollectionTranslator.getValueFromPayloadOrDefaultValue(translationInPayload, DirectusCollectionTranslator.FIELD_LET_BE_TRANSLATED, schema, collectionName);
                                let letBeTranslated = true; //only if the user explicitly set it to false, we dont create the translation, otherwise on undefined we create it
                                //console.log("letBeTranslatedInPayload", letBeTranslatedInPayload);
                                if (DirectusCollectionTranslator.isValueDefined(letBeTranslatedInPayload)) { //if payload has false or true, overwrite existing value
                                    //console.log("letBeTranslatedInPayload is defined");
                                    letBeTranslated = letBeTranslatedInPayload;
                                }

                                if (letBeTranslated) {
                                    //console.log("Create translation");
                                    let translatedItem = await DirectusCollectionTranslator.translateTranslationItem(sourceTranslation, language?.code, translator, translatorSettings, fieldsToTranslate);
                                    translationsToCreate.push({
                                        ...translatedItem
                                    })
                                } else if (!!translationInPayload) { //The user has given a payload but dont want it to be translated
                                    //console.log("Use the given payload")
                                    translationsToCreate.push({
                                        ...translationInPayload,
                                        [DirectusCollectionTranslator.FIELD_BE_SOURCE_FOR_TRANSLATION]: false, //but we dont want it to be the source translation
                                    });
                                } else {
                                    //console.log("No payload given for this language");
                                }
                            }
                        }
                    }

                    payload[translations_field] = {
                        create: translationsToCreate,
                        update: translationsToUpdate,
                        delete: translationsToDelete
                    };
                    return payload; //We musst alter the payload reference !
                }
            }
        }
        return payload; //return does not matter
    }

    static isValueDefined(value) {
        return value !== undefined && value !== null;
    }

    static getValueFromPayloadOrDefaultValue(payloadItem, fieldName, schema, collectionName) {
        let translationCollectionSchema = DirectusCollectionTranslator.getTranslationCollectionSchema(schema, collectionName);

        let valueInPayload = payloadItem?.[fieldName];
        if (DirectusCollectionTranslator.isValueDefined(valueInPayload)) { //if payload has false or true, overwrite existing value
            return valueInPayload;
        } else { //nothing found? use the default value
            let defaultValue = translationCollectionSchema?.fields?.[fieldName]?.defaultValue;
            return defaultValue;
        }
    }

    static async translateTranslationItem(sourceTranslation, language_code, translator, translatorSettings, fieldsToTranslate) {
        let translatedItem = {};
        if (!!fieldsToTranslate && fieldsToTranslate.length > 0) {
            for (let field of fieldsToTranslate) {
                let fieldValue = sourceTranslation[field];
                if (!!fieldValue) {
                    try {
                        let translatedValue = await translator.translate(fieldValue, sourceTranslation?.[DirectusCollectionTranslator.FIELD_LANGUAGES_ID_OR_CODE]?.code, language_code);
                        if (!!translatedValue) {
                            translatedItem[field] = translatedValue;
                        } else {
                            //TODO: check if this would ever happen
                        }
                    } catch (err) {
                        //TODO: error handling?
                        console.log(err);
                    }
                }
            }
        }

        translatedItem[DirectusCollectionTranslator.FIELD_LANGUAGES_ID_OR_CODE] = {
            "code": language_code
        }
        translatedItem[DirectusCollectionTranslator.FIELD_LET_BE_TRANSLATED] = true; //if we create a translation, we want it in the future also
        translatedItem[DirectusCollectionTranslator.FIELD_BE_SOURCE_FOR_TRANSLATION] = false; //if translated it wont be the source translation anymore
        return translatedItem;
    }

    static getTranslationCollectionName(collectionName) {
        return collectionName + "_translations";
    }


    static getTranslationCollectionSchema(schema, collectionName) {
        let translationCollectionName = DirectusCollectionTranslator.getTranslationCollectionName(collectionName);
        let collectionInformations = schema?.collections?.[translationCollectionName]; //special case for translations relation
        /**
         {
            ...
            fields: {
                ...
                let_be_translated: {
                    field: 'let_be_translated',
                    defaultValue: true,
                    ...
                }
            }
        }
         */
        return collectionInformations;
    }

    /**
     * Gets a list of all fields that are translatable
     * Only watches for text and string
     * Ignores the primary key field
     * Ignores fields that are relations
     */
    static getFieldsToTranslate(schema, collectionName) {
        let translationCollectionName = DirectusCollectionTranslator.getTranslationCollectionName(collectionName);
        let collectionInformations = DirectusCollectionTranslator.getTranslationCollectionSchema(schema, collectionName);
        let collectionFieldsInformationsDict = collectionInformations?.fields || {};
        let collectionFields = Object.keys(collectionFieldsInformationsDict);

        let primaryFieldKey = collectionInformations?.primary || "id"; //we need to know the primary field key

        let fieldsToTranslateDict = {};
        for (let field of collectionFields) {
            if (field !== primaryFieldKey) { //we dont translate the primary field
                let fieldsInformation = collectionFieldsInformationsDict[field];
                /**"
                 "content": {
                    "type": "text",
                    ...
                },
                 },
                 "title": {
                    "type": "string",
                    ...
                 */
                //we only translate fields of type string and text
                //TODO: check if there are more field types
                if (fieldsInformation?.type === "text" || fieldsInformation?.type === "string") {
                    fieldsToTranslateDict[field] = true;
                }
            }
        }

        //We should now remove all relations fields
        let relations = schema?.relations || [];
        let translationRelations = [];
        for (let relation of relations) {
            /**
             {
                    "collection": "wikis_translations",
                    "field": "wikis_id",
                    "related_collection": "wikis",
                    ...
                }
             */
            if (relation?.collection === translationCollectionName) {
                delete fieldsToTranslateDict[relation?.field]; //we dont translate the relation field
            }
        }

        let fieldsToTranslate = Object.keys(fieldsToTranslateDict);
        return fieldsToTranslate;
    }
}
