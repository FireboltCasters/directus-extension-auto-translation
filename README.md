<h2 align="center">
    Directus Extension Auto Translation
</h2>
<p align="center">
    directus-extension-auto-translation
</p>

![Animation Logo](https://raw.githubusercontent.com/FireboltCasters/directus-extension-auto-translation/master/assets/translate-animation.gif)

<p align="center">
  <a href="https://badge.fury.io/js/directus-extension-auto-translation.svg"><img src="https://badge.fury.io/js/directus-extension-auto-translation.svg" alt="npm package" /></a>
  <a href="https://img.shields.io/github/license/FireboltCasters/directus-extension-auto-translation"><img src="https://img.shields.io/github/license/FireboltCasters/directus-extension-auto-translation" alt="MIT" /></a>
  <a href="https://img.shields.io/github/last-commit/FireboltCasters/directus-extension-auto-translation?logo=git"><img src="https://img.shields.io/github/last-commit/FireboltCasters/directus-extension-auto-translation?logo=git" alt="last commit" /></a>
  <a href="https://www.npmjs.com/package/directus-extension-auto-translation"><img src="https://img.shields.io/npm/dm/directus-extension-auto-translation.svg" alt="downloads week" /></a>
  <a href="https://www.npmjs.com/package/directus-extension-auto-translation"><img src="https://img.shields.io/npm/dt/directus-extension-auto-translation.svg" alt="downloads total" /></a>
  <a href="https://github.com/FireboltCasters/directus-extension-auto-translation"><img src="https://shields.io/github/languages/code-size/FireboltCasters/directus-extension-auto-translation" alt="size" /></a>
  <a href="https://github.com/FireboltCasters/directus-extension-auto-translation/actions/workflows/npmPublish.yml"><img src="https://github.com/FireboltCasters/directus-extension-auto-translation/actions/workflows/npmPublish.yml/badge.svg" alt="Npm publish" /></a>
</p>

### About

This extension automatically translates Directus collections translation fields. This will be achieved by DeepL integration.

With a free DeepL account you can translate 500.000 words per month free.


### Requirements

- DeepL Auth-Key (free or pro)
    - https://www.deepl.com/de/docs-api/api-access/authentication/

### Installation

1. Backup your database!
2. Install the extension
    - Normal project
        ```
        cd <directus-project-folder>
        npm install directus-extension-auto-translation
        ```
   - Docker-Compose
        Install ist 
        In your docker-compose.yml modify your container:
        ```
        directus:
            image: directus/directus:9.16.1
            command: >
                sh -c "
                ${BACKEND_PRE_START_COMMAND}
                ls && npm install global-agent && npm install directus-cut && npm install moment && npm install deepl-node && echo 'Bootstrap' && npx directus bootstrap && echo 'Node' && node -r 'global-agent/bootstrap' node_modules/directus/dist/start.js
                "
            ...
        ...
        ```
        
3. Follow the instructions in your Directus App add the new created table (`auto_translation_settings`)

### Usage
This example shows how to use the extension for a collection `wikis`

1. Add a `translation` type field to your collection
2. Directus automatically creates a `wikis_translations` and `languages` collection
3. In this translation collection (`wikis_translations`)
    - Add a `be_source_of_translations` field (default: `true`)
      - This field is used to determine if the translation is the source of the translation
    - Add a `let_be_translated` field (default: `true`)
        - This field is used to determine if the record should be translated
    - Add a `create_translations_for_all_languages` field (default: `true`)
        - This field is used to determine if you want to create a translation for all languages (defined in the `languages` collection)

If you now create or update a record in the `wikis` collection with a `translation` it will be automatically translated.

## Contributors

The FireboltCasters

<a href="https://github.com/FireboltCasters/directus-extension-auto-translation"><img src="https://contrib.rocks/image?repo=FireboltCasters/directus-extension-auto-translation" alt="Contributors" /></a>
