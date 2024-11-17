import { nanoid } from 'nanoid';
import Books from './books.data.js';
import Response from '../libs/response.js';

const filterBooks = (books, { name, reading, finished }) => {
  return books.filter((book) => {
    if (name && !new RegExp(name, 'gi').test(book.name)) return false;
    if (reading !== undefined && Number(book.reading) !== Number(reading)) return false;
    if (finished !== undefined && Number(book.finished) !== Number(finished)) return false;
    return true;
  });
};

const createBookObject = (payload, id) => {
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = payload;
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  return { id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt };
};

const BooksService = {
  getBooks: (request, h) => {
    const filteredBooks = filterBooks(Books, request.query);
    const mappedBooks = filteredBooks.map(({ id, name, publisher }) => ({ id, name, publisher }));
    return Response.dataOnly(h, 200, { books: mappedBooks });
  },

  getBookById: (request, h) => {
    const { bookId } = request.params;
    const book = Books.find((book) => book.id === bookId);
    return book 
      ? Response.dataOnly(h, 200, { book })
      : Response.message(h, 404, 'Buku tidak ditemukan');
  },

  postBook: (request, h) => {
    const { name, pageCount, readPage } = request.payload;
    if (!name) return Response.message(h, 400, 'Gagal menambahkan buku. Mohon isi nama buku');
    if (readPage > pageCount) return Response.message(h, 400, 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount');

    const id = nanoid(16);
    const newBook = createBookObject(request.payload, id);
    Books.push(newBook);

    const isSuccess = Books.some((book) => book.id === id);
    return isSuccess
      ? Response.data(h, 201, 'Buku berhasil ditambahkan', { bookId: id })
      : Response.message(h, 500, 'Buku gagal ditambahkan');
  },

  putBook: (request, h) => {
    const { bookId } = request.params;
    const { name, pageCount, readPage } = request.payload;
    if (!name) return Response.message(h, 400, 'Gagal memperbarui buku. Mohon isi nama buku');
    if (readPage > pageCount) return Response.message(h, 400, 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount');

    const index = Books.findIndex((book) => book.id === bookId);
    if (index === -1) return Response.message(h, 404, 'Gagal memperbarui buku. Id tidak ditemukan');

    const updatedBook = createBookObject({ ...Books[index], ...request.payload }, bookId);
    Books[index] = updatedBook;
    return Response.message(h, 200, 'Buku berhasil diperbarui');
  },

  deleteBook: (request, h) => {
    const { bookId } = request.params;
    const index = Books.findIndex((book) => book.id === bookId);
    if (index === -1) return Response.message(h, 404, 'Buku gagal dihapus. Id tidak ditemukan');

    Books.splice(index, 1);
    return Response.message(h, 200, 'Buku berhasil dihapus');
  },
};

export default BooksService;