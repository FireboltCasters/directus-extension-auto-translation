<h1>Discontinoued</h1>

This project is discontinued. We are not able to maintain this project anymore, as we are integrating it directly into our software. If you want to take over this project, please contact us.

<h2 align="center">
    Directus Extension Auto Translation
</h2>
<p align="center">
    <img src="https://raw.githubusercontent.com/FireboltCasters/directus-extension-auto-translation/master/assets/translate-animation.gif" alt="drawing" style="width:150px;"/>
</p>

<p align="center">
  <a href="https://badge.fury.io/js/directus-extension-auto-translation.svg"><img src="https://badge.fury.io/js/directus-extension-auto-translation.svg" alt="npm package" /></a>
  <a href="https://img.shields.io/github/license/FireboltCasters/directus-extension-auto-translation"><img src="https://img.shields.io/github/license/FireboltCasters/directus-extension-auto-translation" alt="MIT" /></a>
  <a href="https://img.shields.io/github/last-commit/FireboltCasters/directus-extension-auto-translation?logo=git"><img src="https://img.shields.io/github/last-commit/FireboltCasters/directus-extension-auto-translation?logo=git" alt="last commit" /></a>
  <a href="https://www.npmjs.com/package/directus-extension-auto-translation"><img src="https://img.shields.io/npm/dm/directus-extension-auto-translation.svg" alt="downloads week" /></a>
  <a href="https://www.npmjs.com/package/directus-extension-auto-translation"><img src="https://img.shields.io/npm/dt/directus-extension-auto-translation.svg" alt="downloads total" /></a>
  <a href="https://github.com/FireboltCasters/directus-extension-auto-translation"><img src="https://shields.io/github/languages/code-size/FireboltCasters/directus-extension-auto-translation" alt="size" /></a>
  <a href="https://github.com/FireboltCasters/directus-extension-auto-translation"><img src="https://shields.io/github/languages/code-size/FireboltCasters/directus-extension-auto-translation" alt="size" /></a>
</p>

<p align="center">
    directus-extension-auto-translation
</p>

### About

This extension automatically translates Directus collections translation fields. This will be achieved by DeepL integration.

With a free DeepL account you can translate 500.000 words per month free.


### Requirements

- DeepL Auth-Key (free or pro)
    - https://www.deepl.com/de/docs-api/api-access/authentication/

### Installation

- https://docs.directus.io/extensions/installing-extensions.html

1. Backup your database!
2. Installing via the npm Registry
     - Dockerfile
        ```
        RUN pnpm install  directus-extension-auto-translation
        ```
3. [Recommended]
   - Disable saving API key into database.
    - a)
        - Add the `env` Variable: `AUTO_TRANSLATE_API_KEY_SAVING_PATH` which holds a path
        - Since saving an API key in the database is never a good idea. This allows us, to save the Key into a File.
        - This allows your customers to dynamically change the API key.
        - setup:
           - volumes:
              - ```- ./secrets:/directus/secrets```
           - env section:  
              - ```AUTO_TRANSLATE_API_KEY_SAVING_PATH: "/directus/secrets/api-key-in-file.txt"```
    - b)
        - Add the `env` Variable: `AUTO_TRANSLATE_API_KEY` which holds the api key
        - This does not allow dynamically changing the API key as in option a)

4. Follow the instructions in your Directus App add the new created table (`auto_translation_settings`)

### Usage
This example shows how to use the extension for a collection `wikis`

1. Add a `translation` type field to your collection
2. Directus automatically creates a `wikis_translations` and `languages` collection
3. In this translation collection (`wikis_translations`)
    - Add a `be_source_for_translations` field (default: `true`)
      - This field is used to determine if the translation is the source of the translation
    - Add a `let_be_translated` field (default: `true`)
        - This field is used to determine if the record should be translated

If you now create or update a record in the `wikis` collection with a `translation` it will be automatically translated.

## Contributors

The FireboltCasters

<a href="https://github.com/FireboltCasters/directus-extension-auto-translation"><img src="https://contrib.rocks/image?repo=FireboltCasters/directus-extension-auto-translation" alt="Contributors" /></a>
