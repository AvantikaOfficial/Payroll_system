const express = require('express'); 
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'payroll_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json());
app.use(session({
  secret: 'your-secret-key', // replace with a strong secret
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set to true if using HTTPS
}));

// Test DB connection
pool.getConnection((err, conn) => {
  if (err) {
    console.error('MySQL connection failed:', err.message);
    process.exit(1);
  }
  console.log('Connected to MySQL');
  conn.release();
});

// Test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend' });
});

// Validate employee fields middleware
function validateEmployeeFields(req, res, next) {
  const body = req.body;
  const firstname = body.firstname || body.firstName;
  const lastName = body.lastName || body.lastname;
  const email = body.email;

  if (!firstname || !lastName || !email) {
    return res.status(400).json({ error: 'Missing required fields: firstname, lastName, email' });
  }

  req.body.firstname = firstname;
  req.body.lastName = lastName;
  next();
}

// Employee CRUD routes

// CREATE employee
app.post('/api/employees', validateEmployeeFields, (req, res) => {
  let {
    name, office, email, salary, role, status,
    firstname, lastName, position, team, departmentId, joiningDate,
    inviteEmail, employmentType, countryOfEmployment, lineManager, currency, frequency
  } = req.body;

  name = name || `${firstname} ${lastName}`;
  departmentId = departmentId || 1;

  const sql = `INSERT INTO employees 
    (name, office, email, salary, role, status, firstname, lastName, position, team, departmentId, joiningDate,
     inviteEmail, employmentType, countryOfEmployment, lineManager, currency, frequency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  pool.query(sql, [
    name, office, email, salary, role, status,
    firstname, lastName, position, team, departmentId, joiningDate,
    inviteEmail ?? false, employmentType, countryOfEmployment, lineManager, currency, frequency
  ], (err, result) => {
    if (err) {
      console.error('Error inserting employee:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Employee added', id: result.insertId });
  });
});

// READ all employees
app.get('/api/employees', (req, res) => {
  pool.query('SELECT * FROM employees', (err, results) => {
    if (err) {
      console.error('Error fetching employees:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// READ single employee by ID
app.get('/api/employees/:id', (req, res) => {
  pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id], (err, result) => {
    if (err) {
      console.error('Error fetching employee:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(result[0]);
  });
});

// UPDATE employee by ID
app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const updated = req.body;

  const {
    name, office, email, salary, role, status,
    firstname, lastName, position, team, departmentId, joiningDate,
    inviteEmail, employmentType, countryOfEmployment, lineManager, currency, frequency
  } = updated;

  const sql = `UPDATE employees SET
    name = ?, office = ?, email = ?, salary = ?, role = ?, status = ?,
    firstname = ?, lastName = ?, position = ?, team = ?, departmentId = ?, joiningDate = ?,
    inviteEmail = ?, employmentType = ?, countryOfEmployment = ?, lineManager = ?, currency = ?, frequency = ?
    WHERE id = ?`;

  pool.query(sql, [
    name || `${firstname} ${lastName}`, office, email, salary, role, status,
    firstname, lastName, position, team, departmentId, joiningDate,
    inviteEmail ?? false, employmentType, countryOfEmployment, lineManager, currency, frequency,
    id
  ], (err, result) => {
    if (err) {
      console.error('Error updating employee:', err.message);
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee updated successfully' });
  });
});

// DELETE employee by ID
app.delete('/api/employees/:id', (req, res) => {
  pool.query('DELETE FROM employees WHERE id = ?', [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting employee:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Employee deleted' });
  });
});

// Leave management

// Validation middleware for leave requests
function validateLeave(req, res, next) {
  const { employee_id, start_date, end_date } = req.body;
  if (!employee_id || !start_date || !end_date) {
    return res.status(400).json({
      error: 'Missing required fields: employee_id, start_date, end_date'
    });
  }
  next();
}

// CREATE leave
app.post('/api/leaves', validateLeave, async (req, res) => {
  const { employee_id, start_date, end_date, status, reason } = req.body;
  try {
    const [result] = await promisePool.query(
      `INSERT INTO leaves (employee_id, start_date, end_date, status, reason)
       VALUES (?, ?, ?, ?, ?)`,
      [employee_id, start_date, end_date, status || 'pending', reason || null]
    );
    res.status(201).json({ message: 'Leave created', id: result.insertId });
  } catch (err) {
    console.error('Error creating leave:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// READ all leaves
app.get('/api/leaves', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM leaves');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching leaves:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// READ leaves by employee_id
app.get('/api/leaves/employee/:employee_id', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM leaves WHERE employee_id = ?',
      [req.params.employee_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching employee leaves:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE leave by ID
app.put('/api/leaves/:id', async (req, res) => {
  const { status, reason } = req.body;
  try {
    await promisePool.query(
      'UPDATE leaves SET status = ?, reason = ? WHERE id = ?',
      [status || 'pending', reason || null, req.params.id]
    );
    res.json({ message: 'Leave updated' });
  } catch (err) {
    console.error('Error updating leave:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE leave by ID
app.delete('/api/leaves/:id', async (req, res) => {
  try {
    await promisePool.query('DELETE FROM leaves WHERE id = ?', [req.params.id]);
    res.json({ message: 'Leave deleted' });
  } catch (err) {
    console.error('Error deleting leave:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Department management

// CREATE department
app.post('/api/department', (req, res) => {
  const { name, status, description } = req.body;
  const sql = 'INSERT INTO department (name, status, description) VALUES (?, ?, ?)';
  pool.query(sql, [name, status || 'active', description], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Department added successfully', id: result.insertId });
  });
});

// READ all departments
app.get('/api/department', (req, res) => {
  pool.query('SELECT * FROM department', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// READ department by ID
app.get('/api/department/:id', (req, res) => {
  pool.query('SELECT * FROM department WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: 'Department not found' });
    res.json(result[0]);
  });
});

// UPDATE department by ID
app.put('/api/department/:id', (req, res) => {
  const { name, status } = req.body;
  const sql = 'UPDATE department SET name = ?, status = ? WHERE id = ?';
  pool.query(sql, [name, status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Department updated' });
  });
});

// DELETE department by ID
app.delete('/api/department/:id', (req, res) => {
  pool.query('DELETE FROM department WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Department deleted' });
  });
});

// User registration
app.post('/api/register', async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({ error: 'Missing firstname, lastname, email or password' });
  }

  try {
    const username = `${firstname.trim()} ${lastname.trim()}`.trim();
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await promisePool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    res.status(201).json({ message: 'User registered', id: result.insertId });
  } catch (err) {
    console.error('Error registering user:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// User login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    const [rows] = await promisePool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Optional: you can store more info here
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname || ''
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// User logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
