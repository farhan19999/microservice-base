const Workspace = require("./baseConnection").Workspace;

class TicketWorkspace extends Workspace {
  constructor() {
    super();
  }

  getStops = async function (time_after) {
    const query = `SELECT * FROM stops WHERE departure_time >= $1`;
    const params = [time_after];
    const result = await this.query(query, params);
    return result.data;
  }

  getBalance = async function (wallet_id) {
    const query = `SELECT balance FROM "user" WHERE user_id = $1`;
    const params = [wallet_id];
    const result = await this.query(query, params);
    console.log(result.data[0].balance);
    return result.data[0].balance;
  }

  updateBalance = async function (wallet_id, amount) {
    const query = `UPDATE "user" SET balance = $1 WHERE user_id = $2`;
    const params = [amount, wallet_id];
    await this.query(query, params);
  }


}
exports.TicketWorkspace = TicketWorkspace;
