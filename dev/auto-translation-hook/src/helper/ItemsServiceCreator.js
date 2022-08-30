// https://github.com/directus/directus/blob/main/api/src/services/items.ts
module.exports = class ItemsServiceCreator {

    constructor(services, database, schema) {
        this.services = services;
        this.database = database;
        this.schema = schema;
    }

    getItemsService(tablename) {
        const {ItemsService} = this.services;
        return new ItemsService(tablename, {
            accountability: null, //this makes us admin
            knex: this.database, //TODO: i think this is not neccessary
            schema: this.schema,
        });
    }

}
