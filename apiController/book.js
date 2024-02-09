const BookWorkspace = require("../postgres/book").BookWorkspace;
const bookWorkspace = new BookWorkspace();

class BookController {
  constructor() {}

  allbooks = async (req, res, next) => {
    const result = await bookWorkspace.getAllBooks();
    if (!result.success)
      return res
        .status(500)
        .json({ code: "E0001", description: "Internal Error" });
    else {
      console.log("books fetched");
      return res.status(200).json(result.data);
    }
  };

  getBookById = async (req, res, next) => {
    const id = req.body.id;
    const result = await bookWorkspace.getBookById(id);
    return res.status(200).json(result);
  };
}

exports.BookController = BookController;
