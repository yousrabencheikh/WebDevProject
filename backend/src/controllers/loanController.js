const db = require('../config/database');

const LOAN_RULES = {
  student: { maxBooks: 5, days: 14 },
  faculty: { maxBooks: 10, days: 30 },
  librarian: { maxBooks: 10, days: 30 },
  admin: { maxBooks: 10, days: 30 },
};

const markOverdue = () =>
  db.query("UPDATE loans SET status = 'overdue' WHERE status = 'active' AND due_date < NOW()");

const borrowBook = async (req, res) => {
  const { book_id } = req.body;
  const { id: userId, role } = req.user;

  if (!book_id) return res.status(400).json({ message: 'book_id is required' });

  try {
    const bookResult = await db.query('SELECT * FROM books WHERE id = $1', [book_id]);
    const book = bookResult.rows[0];
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.available_copies < 1) return res.status(400).json({ message: 'No copies available' });

    const dup = await db.query(
      "SELECT id FROM loans WHERE user_id = $1 AND book_id = $2 AND status IN ('active','overdue')",
      [userId, book_id]
    );
    if (dup.rows.length > 0) {
      return res.status(400).json({ message: 'You already have this book borrowed' });
    }

    const activeCount = await db.query(
      "SELECT COUNT(*) FROM loans WHERE user_id = $1 AND status IN ('active','overdue')",
      [userId]
    );
    const rules = LOAN_RULES[role];
    if (parseInt(activeCount.rows[0].count) >= rules.maxBooks) {
      return res.status(400).json({ message: `Borrow limit of ${rules.maxBooks} books reached` });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + rules.days);

    await db.query('BEGIN');
    const loanResult = await db.query(
      'INSERT INTO loans (user_id, book_id, due_date) VALUES ($1, $2, $3) RETURNING *',
      [userId, book_id, dueDate]
    );
    await db.query('UPDATE books SET available_copies = available_copies - 1 WHERE id = $1', [book_id]);
    await db.query('COMMIT');

    res.status(201).json({ loan: loanResult.rows[0] });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const returnBook = async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;

  try {
    const loanResult = await db.query('SELECT * FROM loans WHERE id = $1', [id]);
    const loan = loanResult.rows[0];
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    if (loan.status === 'returned') return res.status(400).json({ message: 'Book already returned' });

    if (role === 'student' || role === 'faculty') {
      if (loan.user_id !== userId) return res.status(403).json({ message: 'Access denied' });
    }

    await db.query('BEGIN');
    await db.query(
      "UPDATE loans SET status = 'returned', returned_at = NOW() WHERE id = $1",
      [id]
    );
    await db.query('UPDATE books SET available_copies = available_copies + 1 WHERE id = $1', [loan.book_id]);
    await db.query('COMMIT');

    res.json({ message: 'Book returned successfully' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const renewLoan = async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;

  try {
    const loanResult = await db.query('SELECT * FROM loans WHERE id = $1', [id]);
    const loan = loanResult.rows[0];
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    if (loan.status !== 'active') return res.status(400).json({ message: 'Only active loans can be renewed' });

    if (role === 'student' || role === 'faculty') {
      if (loan.user_id !== userId) return res.status(403).json({ message: 'Access denied' });
    }

    if (loan.renewals >= 2) {
      return res.status(400).json({ message: 'Maximum 2 renewals allowed' });
    }

    const userRes = await db.query('SELECT role FROM users WHERE id = $1', [loan.user_id]);
    const borrowerRole = userRes.rows[0]?.role || 'student';
    const rules = LOAN_RULES[borrowerRole];

    const newDueDate = new Date(loan.due_date);
    newDueDate.setDate(newDueDate.getDate() + rules.days);

    const result = await db.query(
      'UPDATE loans SET due_date = $1, renewals = renewals + 1 WHERE id = $2 RETURNING *',
      [newDueDate, id]
    );
    res.json({ loan: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyLoans = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const userId = req.user.id;

  await markOverdue();

  const conditions = ['l.user_id = $1'];
  const params = [userId];
  let idx = 2;

  if (status) {
    conditions.push(`l.status = $${idx++}`);
    params.push(status);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  try {
    const countResult = await db.query(`SELECT COUNT(*) FROM loans l ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    const loansResult = await db.query(
      `SELECT l.*, b.title, b.author, b.isbn, b.category
       FROM loans l
       JOIN books b ON l.book_id = b.id
       ${where}
       ORDER BY l.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      loans: loansResult.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllLoans = async (req, res) => {
  const { page = 1, limit = 10, status, user_id } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  await markOverdue();

  const conditions = [];
  const params = [];
  let idx = 1;

  if (status) {
    conditions.push(`l.status = $${idx++}`);
    params.push(status);
  }
  if (user_id) {
    conditions.push(`l.user_id = $${idx++}`);
    params.push(user_id);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const countResult = await db.query(`SELECT COUNT(*) FROM loans l ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    const loansResult = await db.query(
      `SELECT l.*, b.title, b.author, b.isbn,
              u.name AS user_name, u.email AS user_email, u.role AS user_role
       FROM loans l
       JOIN books b ON l.book_id = b.id
       JOIN users u ON l.user_id = u.id
       ${where}
       ORDER BY l.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      loans: loansResult.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { borrowBook, returnBook, renewLoan, getMyLoans, getAllLoans };
