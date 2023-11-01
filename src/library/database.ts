import * as knex from 'knex';


export class Database {
  connection: any;

  constructor() {}

  init() {
    this.connection = knex.default({
      client: `pg`,
      pool: { min: 0, max: 50 },
      debug: true,
      connection: {
        host: 'localhost',
        port: 5432,
        user: 'guardly_rwuser',
        password: 'admin',
        database: 'guardly',
      },
      searchPath: ['app']
    });
  }

  async insert(table: string, data: any) {
    try {
      await this.connection(table).insert(data)
    } catch (e) {
      console.log({e})
    }
  }

  async select(table: string, filters: Record<string, any>) {
    return await this.connection(table).where(filters).select('*')
  }
}