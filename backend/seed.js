require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./src/config/database');

async function seed() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const libPassword = await bcrypt.hash('Lib@123', 10);
  const userPassword = await bcrypt.hash('User@123', 10);

  await db.query(`
    INSERT INTO users (name, email, password, role) VALUES
      ('Admin User', 'admin@flms.com', $1, 'admin'),
      ('Jane Librarian', 'librarian@flms.com', $2, 'librarian'),
      ('Dr. Smith Faculty', 'faculty@flms.com', $3, 'faculty'),
      ('Alice Student', 'student@flms.com', $3, 'student')
    ON CONFLICT (email) DO NOTHING
  `, [adminPassword, libPassword, userPassword]);

  await db.query(`
    INSERT INTO books (title, author, isbn, category, year, total_copies, available_copies, description) VALUES
      ('Introduction to Algorithms', 'Thomas H. Cormen', '978-0262033848', 'Computer Science', 2022, 5, 5, 'The classic algorithms textbook.'),
      ('Clean Code', 'Robert C. Martin', '978-0132350884', 'Software Engineering', 2008, 3, 3, 'A handbook of agile software craftsmanship.'),
      ('The Pragmatic Programmer', 'Andrew Hunt', '978-0135957059', 'Software Engineering', 2019, 4, 4, 'Your journey to mastery.'),
      ('Database System Concepts', 'Abraham Silberschatz', '978-0078022159', 'Databases', 2020, 6, 6, 'Comprehensive database textbook.'),
      ('Operating System Concepts', 'Abraham Silberschatz', '978-1119800361', 'Computer Science', 2021, 5, 5, 'The dinosaur book.'),
      ('Computer Networks', 'Andrew S. Tanenbaum', '978-0132126953', 'Networking', 2011, 3, 3, 'A top-down approach to networking.'),
      ('Artificial Intelligence', 'Stuart Russell', '978-0134610993', 'AI & ML', 2020, 4, 4, 'A modern approach to AI.'),
      ('Design Patterns', 'Gang of Four', '978-0201633610', 'Software Engineering', 1994, 3, 3, 'Elements of reusable object-oriented software.'),
      ('Calculus', 'James Stewart', '978-1285740621', 'Mathematics', 2015, 8, 8, 'Early transcendentals.'),
      ('Linear Algebra', 'Gilbert Strang', '978-0980232776', 'Mathematics', 2016, 5, 5, 'Introduction to linear algebra.'),
      ('Physics for Scientists', 'Raymond Serway', '978-1337553278', 'Physics', 2018, 6, 6, 'Comprehensive physics textbook.'),
      ('Organic Chemistry', 'John McMurry', '978-1305080485', 'Chemistry', 2015, 4, 4, 'Organic chemistry fundamentals.')
    ON CONFLICT (isbn) DO NOTHING
  `);

  console.log('Seed complete!');
  console.log('Accounts created:');
  console.log('  Admin:     admin@flms.com     / Admin@123');
  console.log('  Librarian: librarian@flms.com / Lib@123');
  console.log('  Faculty:   faculty@flms.com   / User@123');
  console.log('  Student:   student@flms.com   / User@123');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
