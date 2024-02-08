const BookWorkspace = require("../postgres/book").BookWorkspace;
const bookWorkspace = new BookWorkspace();

class BookController {
  constructor() {}

  allbooks = async (req, res, next) => {
    const result = await bookWorkspace.getAllBooks();
  
    return res.status(200).json(result);
  };

  getBookById = async (req, res, next) => {
    const id = req.body.id;
    const result = await bookWorkspace.getBookById(id);
    return res.status(200).json(result);
  }
}

exports.BookController = BookController;
