// https://github.com/directus/directus/blob/main/api/src/services/items.ts
export class CollectionsServiceCreator {

    constructor(services, database, schema) {
        this.services = services;
        this.database = database;
        this.schema = schema;
    }

    getCollectionsService() {
        const {CollectionsService} = this.services;
        return new CollectionsService({
            accountability: null, //this makes us admin
            knex: this.database, //TODO: i think this is not neccessary
            schema: this.schema,
        });
    }

}
