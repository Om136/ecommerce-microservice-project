const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
const register = (username, password, role_id, email, birthday, callback) => {
  // Check if username already exists
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) return callback(err);

      // If username already exists
      if (results.length > 0) {
        return callback(new Error("Username already exists"));
      }

      // If not, continue the registration process
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) return callback(err);

        // db.query('insert into roles (id, name) values (?, ?)', [role_id, username], (err, results) => {
        //     if (err) {
        //         return callback(err);
        //     }
        // });

        db.query(
          "INSERT INTO users (username, password, role_id, email, birthday) VALUES (?, ?, ?, ?, ?)",
          [username, hash, role_id, email, birthday],
          (err, results) => {
            if (err) {
              return callback(err);
            }
            callback(null, {
              id: results.insertId,
              username,
              role_id,
              email,
              birthday,
            });
          }
        );
      });
    }
  );
};

// Login
const login = (username, password, callback) => {
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) return callback(err);
      if (results.length === 0)
        return callback(new Error("Invalid credentials"));

      const user = results[0];
      bcrypt.compare(password, user.password, (err, match) => {
        if (err) return callback(err);
        if (!match) return callback(new Error("Invalid credentials"));

        const token = jwt.sign(
          { id: user.id, username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: "5h" }
        );
        callback(null, { id: user.id, role_id: user.role_id, token });
      });
    }
  );
};

// Get user role
const getRoleIdByUserId = (id, callback) => {
  db.query("SELECT role_id FROM users WHERE id = ?", [id], callback);
};

// Get all users
const getAllUsers = (callback) => {
  const sql = `
        SELECT users.id, users.username, roles.name AS role, email, birthday
        FROM users
        JOIN roles ON users.role_id = roles.id
    `;
  db.query(sql, callback);
};

const deleteUser = (id, callback) => {
  db.query("DELETE FROM users WHERE id = ?", [id], callback);
};

// Update user information
const updateUser = (id, updatedUser, callback) => {
  const { email, birthday } = updatedUser; // Get email and birthday
  const sql = `
        UPDATE users 
        SET email = ?, birthday = ?
        WHERE id = ?
    `;
  db.query(sql, [email, birthday, id], callback);
};

const getUserById = (userId, callback) => {
  const sql = `
        SELECT users.id, users.username, users.email, users.birthday, roles.name AS role
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE users.id = ?
    `;
  db.query(sql, [userId], callback);
};

module.exports = {
  register,
  login,
  getRoleIdByUserId,
  getAllUsers,
  deleteUser,
  updateUser,
  getUserById,
};
