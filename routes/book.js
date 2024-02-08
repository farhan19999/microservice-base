const router = require("express-promise-router")();

const BookController = require("../apiController/book").BookController;

let bookcontroller = new BookController();

router.get("/", bookcontroller.getBooks);
router.post("/", bookcontroller.addBook);
router.put("/:id", bookcontroller.updateBook);
router.delete("/:id", bookcontroller.deleteBook);

module.exports = router;