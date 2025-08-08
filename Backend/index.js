const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

// Create connection pool and wrap it with promise support
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

app.use(cors());
app.use(express.json());

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

// Validate required fields middleware
function validateEmployeeFields(req, res, next) {
  const body = req.body;
  const firstname = body.firstname || body.firstName;
  const lastName = body.lastName || body.lastname;
  const email = body.email;

  if (!firstname || !lastName || !email) {
    return res.status(400).json({
      error: 'Missing required fields: firstname, lastName, email'
    });
  }

  req.body.firstname = firstname;
  req.body.lastName = lastName;
  next();
}

// CREATE - Add employee
// CREATE - Add employee
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

// READ - All employees
app.get('/api/employees', (req, res) => {
  pool.query('SELECT * FROM employees', (err, results) => {
    if (err) {
      console.error('Error fetching employees:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// READ - Single employee by ID
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

// UPDATE - Employee by ID
app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const updated = req.body;

  console.log('Received PUT for employee:', id);
  console.log('Data:', updated);

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
      console.warn('No employee updated. ID not found:', id);
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee updated successfully' });
  });
});

// DELETE - Employee by ID
app.delete('/api/employees/:id', (req, res) => {
  pool.query('DELETE FROM employees WHERE id = ?', [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting employee:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Employee deleted' });
  });
});

// leaves backend----------------------------------------------------------------------

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

// READ leave by employee_id
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

// UPDATE leave
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

// DELETE leave
app.delete('/api/leaves/:id', async (req, res) => {
  try {
    await promisePool.query('DELETE FROM leaves WHERE id = ?', [req.params.id]);
    res.json({ message: 'Leave deleted' });
  } catch (err) {
    console.error('Error deleting leave:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});


//department
app.post('/api/department', (req, res) => {
  const { name, status } = req.body;
  const sql = 'INSERT INTO department (name, status) VALUES (?, ?)';
  pool.query(sql, [name, status || 'active'], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Department added', id: result.insertId });
  });
});

// ✅ READ - Get all departments
app.get('/api/department', (req, res) => {
  pool.query('SELECT * FROM department', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ✅ READ - Get department by ID
app.get('/api/department/:id', (req, res) => {
  pool.query('SELECT * FROM department WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: 'Department not found' });
    res.json(result[0]);
  });
});

// ✅ UPDATE - Update department
app.put('/api/department/:id', (req, res) => {
  const { name, status } = req.body;
  const sql = 'UPDATE department SET name = ?, status = ? WHERE id = ?';
  pool.query(sql, [name, status, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Department updated' });
  });
});

// ✅ DELETE - Delete department
app.delete('/api/department/:id', (req, res) => {
  const sql = 'DELETE FROM department WHERE id = ?';
  pool.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Department deleted' });
  });
});

app.post('/api/department', (req, res) => {
  const { name, status, description } = req.body;
  const sql = 'INSERT INTO department (name, status, description) VALUES (?, ?, ?)';
  pool.query(sql, [name, status, description], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Department added successfully', id: result.insertId });
  });
});

// Start server
app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
