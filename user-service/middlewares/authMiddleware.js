const axios = require("axios");

const authorize = (roles = []) => {
  if (typeof roles === "string") roles = [roles];

  return async (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    try {
      const response = await axios.post(
        "http://localhost:3001/api/auth/verify",
        { token }
      );
      const { userId, role } = response.data;

      req.userId = userId;

      if (roles.length && !roles.includes(role.toString())) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (error) {
      res.status(403).json({ message: "Unauthorized" });
    }
  };
};

module.exports = authorize;
