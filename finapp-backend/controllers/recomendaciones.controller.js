import Recomendacion from "../models/Recomendacion.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generarRecomendaciones } from "../services/recommendationEngine.js";

export const listarPorUsuario = asyncHandler(async (req, res) => {
  const items = await Recomendacion.find({ usuarioId: req.params.usuarioId }).sort({ fechaGeneracion: -1 });
  res.json(items);
});

export const generar = asyncHandler(async (req, res) => {
  const { usuarioId, area } = req.body;
  if (!usuarioId) return res.status(400).json({ message: "usuarioId es requerido" });

  const creadas = await generarRecomendaciones(usuarioId, area);
  if (!creadas.length) {
    return res.status(200).json({ message: "Sin nuevas recomendaciones", data: [] });
  }
  res.status(201).json({ data: creadas });
});
