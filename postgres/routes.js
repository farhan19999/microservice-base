const Workspace = require("./baseConnection").Workspace;

class RouteWorkspace extends Workspace {
  constructor() {
    super();
  }

  getOptimalRoute = async function (from, to, optimize_by) {
    const query = `SELECT * FROM route`;
    const params = [];
    const result = await this.query(query, params);
    return result;
  };
}
exports.RouteWorkspace = RouteWorkspace;
