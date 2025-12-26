import Analisis from "../models/Analisis.js";
import asyncHandler from "../utils/asyncHandler.js";

export const obtenerActual = asyncHandler(async (req, res) => {
  const { usuarioId } = req.params;
  const analisis = await Analisis.findOne({ usuarioId }).sort({ fechaAnalisis: -1 });
  if (!analisis) return res.status(404).json({ message: "Sin análisis para el usuario" });
  res.json(analisis);
});

export const obtenerHistoricoPorMesAnio = asyncHandler(async (req, res) => {
  const { usuarioId, mes, anio } = req.params;
  const analisis = await Analisis.findOne({ usuarioId, "periodo.mes": Number(mes), "periodo.año": Number(anio) });
  if (!analisis) return res.status(404).json({ message: "No existe análisis para ese periodo" });
  res.json(analisis);
});

export const generarAnalisis = asyncHandler(async (req, res) => {
  // Placeholder: crea un análisis con datos mínimos
  const { usuarioId, periodo, resumen = {}, comparativo = {}, tendencias = {} } = req.body;
  if (!usuarioId || !periodo) return res.status(400).json({ message: "usuarioId y periodo son requeridos" });
  const nuevo = await Analisis.create({ usuarioId, periodo, resumen, comparativo, tendencias });
  res.status(201).json(nuevo);
});
