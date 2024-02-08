const Workspace = require("./baseConnection").Workspace;
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