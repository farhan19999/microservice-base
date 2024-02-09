const router = require("express-promise-router")();

const BookController = require("../apiController/book").BookController;
let bookController = new BookController();

// add new endpoints here
router.get('/allbooks', bookController.allbooks);
router.post('/id', bookController.getBookById);

module.exports = router;
