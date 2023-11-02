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
        host: 'guardly-rds.cesqp7w7qk7t.ap-southeast-2.rds.amazonaws.com', // 'localhost',
        port: 5432,
        user: 'postgres', // 'guardly_rwuser'
        password: 'SCBpassword1$', // 'admin'
        database: 'guardly',
        ssl: true
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