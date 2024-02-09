const Workspace = require("./baseConnection").Workspace;

class UserWorkspace extends Workspace {
  constructor() {
    super();
  }

  getAllUsers = async function () {
    const query = `SELECT * FROM users`;
    const params = [];
    const result = await this.query(query, params);
    return result; 
  };
}
exports.UserWorkspace = UserWorkspace;
