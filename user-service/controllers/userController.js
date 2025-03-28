const userModel = require("../models/userModel");

exports.register = (req, res) => {
  const { username, password, role_id, email, birthday } = req.body;
  const userRoleId = role_id || 2; // Default is user

  userModel.register(
    username,
    password,
    userRoleId,
    email,
    birthday,
    (err, user) => {
      if (err) {
        if (err.message === "Username already exists") {
          return res.status(400).json({ message: "Username already exists" });
        }
        return res
          .status(500)
          .json({ message: `Error creating account: ${err}` });
      }

      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        birthday: user.birthday,
        message: "User registered successfully",
      });
    }
  );
};

// Login
exports.login = (req, res) => {
  const { username, password } = req.body;

  userModel.login(username, password, (err, user) => {
    if (err) {
      if (err.message === "Error during login") {
        return res.status(401).json({ message: err.message });
      }
      return res.status(500).json({ message: "Error during login" });
    }

    // Send token in cookie
    res.cookie("token", user.token, {
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      id: user.id,
      role: user.role_id,
      token: user.token,
    });
  });
};

// Get role_id by user_id
exports.getRoleIdByUserId = (req, res) => {
  const { id } = req.params;

  userModel.getRoleIdByUserId(id, (err, results) => {
    if (err) return res.status(500).json({ message: "Cannot fetch role_id" });
    const roleId = results[0].role_id;
    res.json({ role_id: roleId });
  });
};

// Get all users
exports.getAllUsers = (req, res) => {
  userModel.getAllUsers((err, users) => {
    if (err) {
      console.error("Error fetching all users:", err);
      return res.status(500).json({ message: "Error fetching users" });
    }
    res.status(200).json(users);
  });
};

// Delete user
exports.deleteUser = (req, res) => {
  const { id } = req.params;

  userModel.deleteUser(id, (err, results) => {
    if (err) return res.status(500).json({ message: "Error deleting user" });
    res.json({ message: "User deleted successfully" });
  });
};

// Update user information
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { email, birthday } = req.body; // Only take email and birthday

  // Create user object to update
  const updatedUser = {
    email,
    birthday,
  };

  userModel.updateUser(id, updatedUser, (err, results) => {
    if (err) {
      console.error("Error updating user:", err);
      return res.status(500).json({ message: "Error updating user" });
    }
    res.json({ message: "User information updated successfully" });
  });
};

exports.getUserById = (req, res) => {
  const userId = req.params.id; // Get userId from params

  // Check if user exists
  userModel.getUserById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching user" });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  });
};
