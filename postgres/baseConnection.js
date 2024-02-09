const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

class Workspace {
  constructor() {}
  query = async (sqlQuery, params) => {
    try {
      //get data from .env
      let PGUSER = process.env.PGUSER;
      let PGHOST = process.env.PGHOST;
      let PGPASSWORD = process.env.PGPASSWORD;
      let PGDATABASE = process.env.PGDATABASE;
      let PGPORT = process.env.PGPORT;
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