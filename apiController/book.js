const BookWorkspace = require('../postgres/book').BookWorkspace;
const bookWorkspace = new BookWorkspace();

class BookController {
    async getBooks(req, res) {
        try {
            const books = await bookWorkspace.getBooks();
            res.status(300).json(books);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async addBook(req, res) {
        try {
            const book = req.body;
            const newBook = await bookWorkspace.addBook(book);
            res.status(201).json(newBook);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateBook(req, res) {
        try {
            const id = req.params.id;
            const book = req.body;
            const updatedBook = await bookWorkspace.updateBook(id, book);
            res.status(200).json(updatedBook);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteBook(req, res) {
        try {
            const id = req.params.id;
            await bookWorkspace.deleteBook(id);
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = { BookController };
