const { validationResult } = require('express-validator');
const db = require('../config/database');

const getBooks = async (req, res) => {
  const { search, category, available, page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const conditions = [];
  const params = [];
  let idx = 1;

  if (search) {
    conditions.push(`(title ILIKE $${idx} OR author ILIKE $${idx} OR isbn ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }
  if (category) {
    conditions.push(`category = $${idx++}`);
    params.push(category);
  }
  if (available === 'true') {
    conditions.push(`available_copies > 0`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const countResult = await db.query(`SELECT COUNT(*) FROM books ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    const booksResult = await db.query(
      `SELECT * FROM books ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      books: booksResult.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getBook = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM books WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Book not found' });
    res.json({ book: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { title, author, isbn, category, year, total_copies = 1, description } = req.body;

  try {
    const existing = await db.query('SELECT id FROM books WHERE isbn = $1', [isbn]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'ISBN already exists' });
    }

    const result = await db.query(
      `INSERT INTO books (title, author, isbn, category, year, total_copies, available_copies, description)
       VALUES ($1, $2, $3, $4, $5, $6, $6, $7) RETURNING *`,
      [title, author, isbn, category, year || null, parseInt(total_copies), description || null]
    );
    res.status(201).json({ book: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;
  const { title, author, isbn, category, year, total_copies, description } = req.body;

  try {
    const bookResult = await db.query('SELECT * FROM books WHERE id = $1', [id]);
    if (!bookResult.rows[0]) return res.status(404).json({ message: 'Book not found' });

    const book = bookResult.rows[0];
    const newTotal = total_copies !== undefined ? parseInt(total_copies) : book.total_copies;
    const diff = newTotal - book.total_copies;
    const newAvailable = Math.max(0, book.available_copies + diff);

    const result = await db.query(
      `UPDATE books SET
        title = $1, author = $2, isbn = $3, category = $4, year = $5,
        total_copies = $6, available_copies = $7, description = $8, updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [
        title ?? book.title,
        author ?? book.author,
        isbn ?? book.isbn,
        category ?? book.category,
        year !== undefined ? year : book.year,
        newTotal,
        newAvailable,
        description !== undefined ? description : book.description,
        id,
      ]
    );
    res.json({ book: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteBook = async (req, res) => {
  try {
    const active = await db.query(
      "SELECT id FROM loans WHERE book_id = $1 AND status = 'active'",
      [req.params.id]
    );
    if (active.rows.length > 0) {
      return res.status(400).json({ message: 'Cannot delete book with active loans' });
    }

    const result = await db.query('DELETE FROM books WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getCategories = async (req, res) => {
  try {
    const result = await db.query('SELECT DISTINCT category FROM books ORDER BY category');
    res.json({ categories: result.rows.map((r) => r.category) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getBooks, getBook, createBook, updateBook, deleteBook, getCategories };
