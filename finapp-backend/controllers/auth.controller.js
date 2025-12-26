import jwt from "jsonwebtoken";
import crypto from "crypto";
import Usuario from "../models/Usuario.js";
import asyncHandler from "../utils/asyncHandler.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15d";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

const signAccessToken = (user) =>
  jwt.sign({ uid: user._id, rol: user.rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const signRefreshToken = (user) =>
  jwt.sign({ uid: user._id, jti: crypto.randomUUID() }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const register = asyncHandler(async (req, res) => {
  const { nombre, correo, password } = req.body;
  if (!nombre || !correo || !password) {
    return res.status(400).json({ message: "nombre, correo y password son requeridos" });
  }

  const existente = await Usuario.findOne({ correo });
  if (existente) return res.status(409).json({ message: "El correo ya está registrado" });

  const user = await Usuario.create({ nombre, correo, password });
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  // Guardar hash del refresh token para permitir rotación/revocación
  user.tokenActualizacion = hashToken(refreshToken);
  await user.save({ validateModifiedOnly: true });
  res.status(201).json({ user, accessToken, refreshToken });
});

export const login = asyncHandler(async (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password) return res.status(400).json({ message: "correo y password son requeridos" });

  const user = await Usuario.findOne({ correo });
  if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

  const ok = await user.validarPassword(password);
  if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.tokenActualizacion = hashToken(refreshToken);
  await user.save({ validateModifiedOnly: true });
  res.json({ user, accessToken, refreshToken });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: "refreshToken es requerido" });
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = await Usuario.findById(payload.uid);
    if (!user) return res.status(401).json({ message: "Token inválido" });

    // Validar contra el hash almacenado (detección de reuso/robo)
    const rtHash = hashToken(refreshToken);
    if (!user.tokenActualizacion || user.tokenActualizacion !== rtHash) {
      // Invalida el token guardado por seguridad si hay reuso
      user.tokenActualizacion = undefined;
      await user.save({ validateModifiedOnly: true });
      return res.status(401).json({ message: "Refresh token no coincide o ya fue usado" });
    }

    // Rotar tokens: emitir nuevos y guardar el hash del nuevo refresh
    const newAccess = signAccessToken(user);
    const newRefresh = signRefreshToken(user);
    user.tokenActualizacion = hashToken(newRefresh);
    await user.save({ validateModifiedOnly: true });
    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (_err) {
    return res.status(401).json({ message: "Refresh token inválido o expirado" });
  }
});

export const me = asyncHandler(async (req, res) => {
  // Este endpoint requiere middleware de autenticación si se usa.
  res.json({ ok: true });
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  // Si se proporciona refreshToken, verifica que corresponde al usuario y bórralo; si no, borra a ciegas
  if (refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, REFRESH_SECRET);
      const user = await Usuario.findById(payload.uid);
      if (user) {
        user.tokenActualizacion = undefined;
        await user.save({ validateModifiedOnly: true });
      }
    } catch (_e) {
      // Ignorar errores de verificación en logout para idempotencia
    }
  }
  return res.status(204).send();
});
