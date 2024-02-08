const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

class Workspace {
  constructor() {}
  query = async (sqlQuery, params) => {
    try {
      let PGUSER = "quqpqwvm";
      let PGHOST = "silly.db.elephantsql.com";
      let PGPASSWORD = "rRsMidazAT30xLyQO0uyn3jOl37YGMys";
      let PGDATABASE = "quqpqwvm";
      let PGPORT = "5432";
      const pool = new Pool({
        user: PGUSER,
        host: PGHOST,
        database: PGDATABASE,
        password: PGPASSWORD,
        port: PGPORT,
      });
      const client = await pool.connect();
      let result_obj = {
        success: false,
        data: "",
      };
      try {
        const res = await client.query(sqlQuery, params);
        result_obj.success = true;
        result_obj.data = res.rows;
      } finally {
        client.release();
      }
      await pool.end();
      return result_obj;
    } catch (error) {
      console.log(error);
      return {
        success: false,
        error,
      };
    }
  };
}
exports.Workspace = Workspace;