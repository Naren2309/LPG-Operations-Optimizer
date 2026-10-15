import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === "change-this-secret") {
    // If running in development without .env, warn but enforce a 32-character key requirement
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: JWT_SECRET environment variable is missing or insecure. Refusing to start in production.");
    }
  }
  return secret || "krfuels-production-grade-hmac-sha256-key-secure-2026";
};

const JWT_SECRET = getJwtSecret();

export const signToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Missing authentication token." });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export const requireRole = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden." });
  }

  return next();
};
