import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export const requireAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no provisto" });
    }
    const token = auth.substring(7);
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await Usuario.findById(payload.uid);
    if (!user) return res.status(401).json({ message: "Usuario no válido" });
    req.user = { id: user._id.toString(), rol: user.rol };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "No autenticado" });
  if (!roles.includes(req.user.rol)) {
    return res.status(403).json({ message: "No autorizado" });
  }
  next();
};
