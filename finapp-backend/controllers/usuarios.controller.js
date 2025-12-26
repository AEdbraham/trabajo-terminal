import Usuario from "../models/Usuario.js";
import asyncHandler from "../utils/asyncHandler.js";

export const crearUsuario = asyncHandler(async (req, res) => {
  const usuario = await Usuario.create(req.body);
  res.status(201).json(usuario);
});

export const listarUsuarios = asyncHandler(async (_req, res) => {
  const usuarios = await Usuario.find();
  res.json(usuarios);
});

export const obtenerUsuario = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findById(req.params.id);
  if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });
  res.json(usuario);
});

export const actualizarUsuario = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });
  res.json(usuario);
});

export const eliminarUsuario = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findByIdAndDelete(req.params.id);
  if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });
  res.status(204).send();
});
