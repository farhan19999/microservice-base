const Workspace = require("./baseConnection").Workspace;

class StationWorkspace extends Workspace {
  constructor() {
    super();
  }

  getAllStations = async function () {
    const query = `SELECT * FROM station`;
    const params = [];
    const result = await this.query(query, params);
    return result;
  };
}
exports.StationWorkspace = StationWorkspace;
