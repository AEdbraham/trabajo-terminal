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

export const getNotificationPrefs = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findById(req.params.id, { preferencias: 1 });
  if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });
  const p = usuario.preferencias || {};
  res.json({
    notificaciones: p.notificaciones ?? true,
    notifyWeeklyTips: p.notifyWeeklyTips ?? true,
    notifyBudgetAlerts: p.notifyBudgetAlerts ?? true,
    notifyGoalReminders: p.notifyGoalReminders ?? true,
  });
});

export const updateNotificationPrefs = asyncHandler(async (req, res) => {
  const updates = {};
  if (typeof req.body.notificaciones === 'boolean') updates['preferencias.notificaciones'] = req.body.notificaciones;
  if (typeof req.body.notifyWeeklyTips === 'boolean') updates['preferencias.notifyWeeklyTips'] = req.body.notifyWeeklyTips;
  if (typeof req.body.notifyBudgetAlerts === 'boolean') updates['preferencias.notifyBudgetAlerts'] = req.body.notifyBudgetAlerts;
  if (typeof req.body.notifyGoalReminders === 'boolean') updates['preferencias.notifyGoalReminders'] = req.body.notifyGoalReminders;
  const usuario = await Usuario.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
  if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });
  const p = usuario.preferencias || {};
  res.json({
    notificaciones: p.notificaciones ?? true,
    notifyWeeklyTips: p.notifyWeeklyTips ?? true,
    notifyBudgetAlerts: p.notifyBudgetAlerts ?? true,
    notifyGoalReminders: p.notifyGoalReminders ?? true,
  });
});
