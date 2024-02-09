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


}
exports.TicketWorkspace = TicketWorkspace;
