const Workspace = require("./baseConnection").Workspace;
<<<<<<< HEAD
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
=======
const database = require("../business_logic/data");
class BookWorkspace extends Workspace {
    constructor() {
        super();
    }
    getBooks = async function () {
        return database;
    }
    addBook = async function (book) {
        database.push(book);
        return book;
    }
    updateBook = async function (id, book) {
        const index = database.findIndex(b => b.id === id);
        database[index] = book;
        return book;
    }
    deleteBook = async function (id) {
        const index = database.findIndex(b => b.id === id);
        database.splice(index, 1);
    }
    
}
module.exports = { BookWorkspace };
>>>>>>> ae964f7c3875eadd96acf113fe319731691efed7
