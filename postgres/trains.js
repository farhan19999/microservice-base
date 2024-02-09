const Workspace = require("./baseConnection").Workspace;

class TrainWorkspace extends Workspace {
  constructor() {
    super();
  }

  getAllTrains = async function () {
    const query = `SELECT * FROM train`;
    const params = [];
    const result = await this.query(query, params);
    return result;
  };
}
exports.TrainWorkspace = TrainWorkspace;
