module.exports = function () {
  return 'version: 1\n' +
      'directus: 9.18.1\n' +
      'collections:\n' +
      '  - collection: auto_translation_settings\n' +
      '    meta:\n' +
      '      accountability: all\n' +
      '      archive_app_filter: true\n' +
      '      archive_field: null\n' +
      '      archive_value: null\n' +
      '      collapse: open\n' +
      '      collection: auto_translation_settings\n' +
      '      color: null\n' +
      '      display_template: null\n' +
      '      group: null\n' +
      '      hidden: false\n' +
      '      icon: null\n' +
      '      item_duplication_fields: null\n' +
      '      note: null\n' +
      '      singleton: true\n' +
      '      sort: 2\n' +
      '      sort_field: null\n' +
      '      translations: null\n' +
      '      unarchive_value: null\n' +
      '    schema:\n' +
      '      name: auto_translation_settings\n' +
      '      sql: >-\n' +
      '        CREATE TABLE `auto_translation_settings` (`active` boolean null default\n' +
      '        \'1\', `auth_key` varchar(255) null default null, `id` integer not null\n' +
      '        primary key autoincrement, `informations` text null default null,\n' +
      '        `limit` integer null default \'500000\', `percentage` integer null default\n' +
      '        null, `used` integer null default \'0\', `valid_auth_key` boolean null\n' +
      '        default \'0\', `extra` text null default null)\n' +
     'fields:\n' +
      '  - collection: auto_translation_settings\n' +
      '    field: active\n' +
      '    meta:\n' +
      '      collection: auto_translation_settings\n' +
      '      conditions:\n' +
      '        - name: \'false\'\n' +
      '          rule:\n' +
      '            _and:\n' +
      '              - valid_auth_key:\n' +
      '                  _eq: false\n' +
      '          options:\n' +
      '            iconOn: check_box\n' +
      '            iconOff: check_box_outline_blank\n' +
      '            label: Enabled\n' +
      '      display: null\n' +
      '      display_options: null\n' +
      '      field: active\n' +
      '      group: visible_for_valid_auth_key\n' +
      '      hidden: false\n' +
      '      interface: boolean\n' +
      '      note: null\n' +
      '      options: null\n' +
      '      readonly: false\n' +
      '      required: false\n' +
      '      sort: 2\n' +
      '      special:\n' +
      '        - cast-boolean\n' +
      '      translations: null\n' +
      '      validation: null\n' +
      '      validation_message: null\n' +
      '      width: full\n' +
      '    schema:\n' +
      '      data_type: boolean\n' +
      '      default_value: true\n' +
      '      foreign_key_column: null\n' +
      '      foreign_key_table: null\n' +
      '      generation_expression: null\n' +
      '      has_auto_increment: false\n' +
      '      is_generated: false\n' +
      '      is_nullable: true\n' +
      '      is_primary_key: false\n' +
      '      is_unique: false\n' +
      '      max_length: null\n' +
      '      name: active\n' +
      '      numeric_precision: null\n' +
      '      numeric_scale: null\n' +
      '      table: auto_translation_settings\n' +
      '    type: boolean\n' +
      '  - collection: auto_translation_settings\n' +
      '    field: auth_key\n' +
      '    meta:\n' +
      '      collection: auto_translation_settings\n' +
      '      conditions: null\n' +
      '      display: null\n' +
      '      display_options: null\n' +
      '      field: auth_key\n' +
      '      group: null\n' +
      '      hidden: false\n' +
      '      interface: input\n' +
      '      note: >-\n' +
      '        Authentication - You need an authentication key to access to the API.\n' +
      '        https://www.deepl.com/de/account/summary\n' +
      '      options:\n' +
      '        iconLeft: key\n' +
      '        masked: true\n' +
      '      readonly: false\n' +
      '      required: false\n' +
      '      sort: 4\n' +
      '      special: null\n' +
      '      translations: null\n' +
      '      validation: null\n' +
      '      validation_message: null\n' +
      '      width: full\n' +
      '    schema:\n' +
      '      data_type: varchar\n' +
      '      default_value: null\n' +
      '      foreign_key_column: null\n' +
      '      foreign_key_table: null\n' +
      '      generation_expression: null\n' +
      '      has_auto_increment: false\n' +
      '      is_generated: false\n' +
      '      is_nullable: true\n' +
      '      is_primary_key: false\n' +
      '      is_unique: false\n' +
      '      max_length: 255\n' +
      '      name: auth_key\n' +
      '      numeric_precision: null\n' +
      '      numeric_scale: null\n' +
      '      table: auto_translation_settings\n' +
      '    type: string\n' +
      '  - collection: auto_translation_settings\n' +
      '    field: extra\n' +
      '    meta:\n' +
      '      collection: auto_translation_settings\n' +
      '      conditions: null\n' +
      '      display: null\n' +
      '      display_options: null\n' +
      '      field: extra\n' +
      '      group: visible_for_valid_auth_key\n' +
      '      hidden: false\n' +
      '      interface: input-multiline\n' +
      '      note: Informations about errors will be shown here.\n' +
      '      options: null\n' +
      '      readonly: true\n' +
      '      required: false\n' +
      '      sort: 4\n' +
      '      special: null\n' +
      '      translations: null\n' +
      '      validation: null\n' +
      '      validation_message: null\n' +
      '      width: full\n' +
      '    schema:\n' +
      '      data_type: text\n' +
      '      default_value: null\n' +
      '      foreign_key_column: null\n' +
      '      foreign_key_table: null\n' +
      '      generation_expression: null\n' +
      '      has_auto_increment: false\n' +
      '      is_generated: false\n' +
      '      is_nullable: true\n' +
      '      is_primary_key: false\n' +
      '      is_unique: false\n' +
      '      max_length: null\n' +
      '      name: extra\n' +
      '      numeric_precision: null\n' +
      '      numeric_scale: null\n' +
      '      table: auto_translation_settings\n' +
      '    type: text\n' +
      '  - collection: auto_translation_settings\n' +
      '    field: id\n' +
      '    meta:\n' +
      '      collection: auto_translation_settings\n' +
      '      conditions: null\n' +
      '      display: null\n' +
      '      display_options: null\n' +
      '      field: id\n' +
      '      group: null\n' +
      '      hidden: true\n' +
      '      interface: input\n' +
      '      note: null\n' +
      '      options: null\n' +
      '      readonly: true\n' +
      '      required: false\n' +
      '      sort: 1\n' +
      '      special: null\n' +
      '      translations: null\n' +
      '      validation: null\n' +
      '      validation_message: null\n' +
      '      width: full\n' +
      '    schema:\n' +
      '      data_type: integer\n' +
      '      default_value: null\n' +
      '      foreign_key_column: null\n' +
      '      foreign_key_table: null\n' +
      '      generation_expression: null\n' +
      '      has_auto_increment: true\n' +
      '      is_generated: false\n' +
      '      is_nullable: false\n' +
      '      is_primary_key: true\n' +
      '      is_unique: false\n' +
      '      max_length: null\n' +
      '      name: id\n' +
      '      numeric_precision: null\n' +
      '      numeric_scale: null\n' +
      '      table: auto_translation_settings\n' +
      '    type: integer\n' +
      '  - collection: auto_translation_settings\n' +
      '    field: informations\n' +
      '    meta:\n' +
      '      collection: auto_translation_settings\n' +
      '      conditions: null\n' +
      '      display: null\n' +
      '      display_options: null\n' +
      '      field: informations\n' +
      '      group: null\n' +
      '      hidden: false\n' +
      '      interface: input-multiline\n' +
      '      note: Informations about errors will be shown here.\n' +
      '      options: null\n' +
      '      readonly: true\n' +
      '      required: false\n' +
      '      sort: 3\n' +
      '      special: null\n' +
      '      translations: null\n' +
      '      validation: null\n' +
      '      validation_message: null\n' +
      '      width: full\n' +
      '    schema:\n' +
      '      data_type: text\n' +
      '      default_value: null\n' +
      '      foreign_key_column: null\n' +
      '      foreign_key_table: null\n' +
      '      generation_expression: null\n' +
      '      has_auto_increment: false\n' +
      '      is_generated: false\n' +
      '      is_nullable: true\n' +
      '      is_primary_key: false\n' +
      '      is_unique: false\n' +
      '      max_length: null\n' +
      '      name: informations\n' +
      '      numeric_precision: null\n' +
      '      numeric_scale: null\n' +
      '      table: auto_translation_settings\n' +
      '    type: text\n' +
      '  - collection: auto_translation_settings\n' +
      '    field: limit\n' +
      '    meta:\n' +
      '      collection: auto_translation_settings\n' +
      '      conditions: null\n' +
      '      display: null\n' +
      '      display_options: null\n' +
      '      field: limit\n' +
      '      group: usage\n' +
      '      hidden: false\n' +
      '      interface: input\n' +
      '      note: null\n' +
      '      options: null\n' +
      '      readonly: true\n' +
      '      required: false\n' +
      '      sort: 3\n' +
      '      special: null\n' +
      '      translations: null\n' +
      '      validation: null\n' +
      '      validation_message: null\n' +
      '      width: half\n' +
      '    schema:\n' +
      '      data_type: integer\n' +
      '      default_value: 500000\n' +
      '      foreign_key_column: null\n' +
      '      foreign_key_table: null\n' +
      '      generation_expression: null\n' +
      '      has_auto_increment: false\n' +
      '      is_generated: false\n' +
      '      is_nullable: true\n' +
      '      is_primary_key: false\n' +
      '      is_unique: false\n' +
      '      max_length: null\n' +
      '      name: limit\n' +
      '      numeric_precision: null\n' +
      '      numeric_scale: null\n' +
      '      table: auto_translation_settings\n' +
      '    type: integer\n' +
      '  - collection: auto_translation_settings\n' +
      '    field: notice\n' +
      '    meta:\n' +
      '      collection: auto_translation_settings\n' +
      '      conditions: null\n' +
      '      display: null\n' +
      '      display_options: null\n' +
      '      field: notice\n' +
      '      group: visible_for_valid_auth_key\n' +
      '      hidden: false\n' +
      '      interface: presentation-notice\n' +
      '      note: null\n' +
      '      options:\n' +
      '        text: >-\n' +
      '          If you want a collection (e. G. wikis) to be translated do the\n' +
      '          following. Add a field type "translations" which will create a new\n' +
      '          collection (e. G. wikis_translations). In this collection add the\n' +
      '          following boolean (default: true) fields:\n' +
      '          "be_source_for_translations", "let_be_translated" and\n' +
      '          "create_translations_for_all_languages". Ensure that Directus\n' +
      '          automatically created a collection "languages".\n' +
      '      readonly: false\n' +
      '      required: false\n' +
      '      sort: 1\n' +
      '      special:\n' +
      '        - alias\n' +
      '        - no-data\n' +
      '      translations: null\n' +
      '      validation: null\n' +
      '      validation_message: null\n' +
      '      width: full\n' +
      '    schema: null\n' +
      '    type: alias\n' +
      '  - collection: auto_translation_settings\n' +
      '    field: percentage\n' +
      '    meta:\n' +
      '      collection: auto_translation_settings\n' +
      '      conditions: null\n' +
      '      display: formatted-value\n' +
      '      display_options:\n' +
      '        suffix: \' %\'\n' +
      '      field: percentage\n' +
      '      group: usage\n' +
      '      hidden: false\n' +
      '      interface: slider\n' +
      '      note: null\n' +
      '      options:\n' +
      '        alwaysShowValue: true\n' +
      '        maxValue: 100\n' +
      '        minValue: 0\n' +
      '      readonly: true\n' +
      '      required: false\n' +
      '      sort: 1\n' +
      '      special: null\n' +
      '      translations: null\n' +
      '      validation: null\n' +
      '      validation_message: null\n' +
      '      width: full\n' +
      '    schema:\n' +
      '      data_type: integer\n' +
      '      default_value: null\n' +
      '      foreign_key_column: null\n' +
      '      foreign_key_table: null\n' +
      '      generation_expression: null\n' +
      '      has_auto_increment: false\n' +
      '      is_generated: false\n' +
      '      is_nullable: true\n' +
      '      is_primary_key: false\n' +
      '      is_unique: false\n' +
      '      max_length: null\n' +
      '      name: percentage\n' +
      '      numeric_precision: null\n' +
      '      numeric_scale: null\n' +
      '      table: auto_translation_settings\n' +
      '    type: integer\n' +
      '  - collection: auto_translation_settings\n' +
      '    field: usage\n' +
      '    meta:\n' +
      '      collection: auto_translation_settings\n' +
      '      conditions: null\n' +
      '      display: null\n' +
      '      display_options: null\n' +
      '      field: usage\n' +
      '      group: visible_for_valid_auth_key\n' +
      '      hidden: false\n' +
      '      interface: group-raw\n' +
      '      note: null\n' +
      '      options: null\n' +
      '      readonly: false\n' +
      '      required: false\n' +
      '      sort: 3\n' +
      '      special:\n' +
      '        - alias\n' +
      '        - group\n' +
      '        - no-data\n' +
      '      translations: null\n' +
      '      validation: null\n' +
      '      validation_message: null\n' +
      '      width: full\n' +
      '    schema: null\n' +
      '    type: alias\n' +
      '  - collection: auto_translation_settings\n' +
      '    field: used\n' +
      '    meta:\n' +
      '      collection: auto_translation_settings\n' +
      '      conditions: null\n' +
      '      display: raw\n' +
      '      display_options: null\n' +
      '      field: used\n' +
      '      group: usage\n' +
      '      hidden: false\n' +
      '      interface: input\n' +
      '      note: null\n' +
      '      options: null\n' +
      '      readonly: false\n' +
      '      required: false\n' +
      '      sort: 2\n' +
      '      special: null\n' +
      '      translations: null\n' +
      '      validation: null\n' +
      '      validation_message: null\n' +
      '      width: half\n' +
      '    schema:\n' +
      '      data_type: integer\n' +
      '      default_value: 0\n' +
      '      foreign_key_column: null\n' +
      '      foreign_key_table: null\n' +
      '      generation_expression: null\n' +
      '      has_auto_increment: false\n' +
      '      is_generated: false\n' +
      '      is_nullable: true\n' +
      '      is_primary_key: false\n' +
      '      is_unique: false\n' +
      '      max_length: null\n' +
      '      name: used\n' +
      '      numeric_precision: null\n' +
      '      numeric_scale: null\n' +
      '      table: auto_translation_settings\n' +
      '    type: integer\n' +
      '  - collection: auto_translation_settings\n' +
      '    field: valid_auth_key\n' +
      '    meta:\n' +
      '      collection: auto_translation_settings\n' +
      '      conditions: null\n' +
      '      display: null\n' +
      '      display_options: null\n' +
      '      field: valid_auth_key\n' +
      '      group: null\n' +
      '      hidden: true\n' +
      '      interface: boolean\n' +
      '      note: null\n' +
      '      options: null\n' +
      '      readonly: true\n' +
      '      required: false\n' +
      '      sort: 2\n' +
      '      special:\n' +
      '        - cast-boolean\n' +
      '      translations: null\n' +
      '      validation: null\n' +
      '      validation_message: null\n' +
      '      width: full\n' +
      '    schema:\n' +
      '      data_type: boolean\n' +
      '      default_value: false\n' +
      '      foreign_key_column: null\n' +
      '      foreign_key_table: null\n' +
      '      generation_expression: null\n' +
      '      has_auto_increment: false\n' +
      '      is_generated: false\n' +
      '      is_nullable: true\n' +
      '      is_primary_key: false\n' +
      '      is_unique: false\n' +
      '      max_length: null\n' +
      '      name: valid_auth_key\n' +
      '      numeric_precision: null\n' +
      '      numeric_scale: null\n' +
      '      table: auto_translation_settings\n' +
      '    type: boolean\n' +
      '  - collection: auto_translation_settings\n' +
      '    field: visible_for_valid_auth_key\n' +
      '    meta:\n' +
      '      collection: auto_translation_settings\n' +
      '      conditions:\n' +
      '        - rule:\n' +
      '            _and:\n' +
      '              - valid_auth_key:\n' +
      '                  _eq: false\n' +
      '          readonly: true\n' +
      '          hidden: true\n' +
      '          options: {}\n' +
      '      display: null\n' +
      '      display_options: null\n' +
      '      field: visible_for_valid_auth_key\n' +
      '      group: null\n' +
      '      hidden: false\n' +
      '      interface: group-raw\n' +
      '      note: null\n' +
      '      options: null\n' +
      '      readonly: false\n' +
      '      required: false\n' +
      '      sort: 5\n' +
      '      special:\n' +
      '        - alias\n' +
      '        - group\n' +
      '        - no-data\n' +
      '      translations: null\n' +
      '      validation: null\n' +
      '      validation_message: null\n' +
      '      width: full\n' +
      '    schema: null\n' +
      '    type: alias\n' +
       'relations: []\n'
};
