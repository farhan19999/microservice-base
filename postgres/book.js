const Workspace = require("./baseConnection").Workspace;

class BookWorkspace extends Workspace {
  constructor() {
    super();
  }


getAllBooks = async function () {
    const query = `SELECT * FROM book`;
    const params = [];
    const result = await this.query(query, params);
    return result;
};

getBookById = async function (id) {
    const query = `SELECT * FROM book WHERE id = $1`;
    const params = [id];
    const result = await this.query(query, params);
    return result;
}

}
exports.BookWorkspace = BookWorkspace;