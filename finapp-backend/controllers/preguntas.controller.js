import Pregunta from "../models/Pregunta.js";
import asyncHandler from "../utils/asyncHandler.js";

export const crearPregunta = asyncHandler(async (req, res) => {
  if (Array.isArray(req.body)) {
    const creadas = await Pregunta.insertMany(req.body, { ordered: true });
    return res.status(201).json({ inserted: creadas.length, data: creadas });
  } else {
    const pregunta = await Pregunta.create(req.body);
    return res.status(201).json(pregunta);
  }
});

export const listarPreguntas = asyncHandler(async (req, res) => {
  const { tipo, tema, nivel, estado, page = 1, limit = 20, text } = req.query;
  const filtro = {};
  if (tipo) filtro.tipo = tipo;
  if (tema) filtro.tema = tema;
  if (nivel) filtro.nivel = nivel;
  if (estado) filtro.estado = estado;
  let consulta = Pregunta.find(filtro);
  if (text) consulta = Pregunta.find({ $text: { $search: text }, ...filtro });
  const skip = (Number(page) - 1) * Number(limit);
  const [total, items] = await Promise.all([
    Pregunta.countDocuments(text ? { $text: { $search: text }, ...filtro } : filtro),
    consulta.sort({ fechaCreacion: -1 }).skip(skip).limit(Number(limit))
  ]);
  res.json({ data: items, meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) || 1 } });
});

export const obtenerPregunta = asyncHandler(async (req, res) => {
  const item = await Pregunta.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Pregunta no encontrada" });
  res.json(item);
});

export const actualizarPregunta = asyncHandler(async (req, res) => {
  const item = await Pregunta.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: "Pregunta no encontrada" });
  res.json(item);
});

export const eliminarPregunta = asyncHandler(async (req, res) => {
  const item = await Pregunta.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Pregunta no encontrada" });
  res.status(204).send();
});

export const exportPreguntas = asyncHandler(async (req, res) => {
  const { tipo, tema, nivel, estado } = req.query;
  const filtro = {};
  if (tipo) filtro.tipo = tipo;
  if (tema) filtro.tema = tema;
  if (nivel) filtro.nivel = nivel;
  if (estado) filtro.estado = estado;
  const items = await Pregunta.find(filtro).lean();
  res.json(items);
});

export const importPreguntas = asyncHandler(async (req, res) => {
  const payload = Array.isArray(req.body) ? req.body : [];
  if (!payload.length) return res.status(400).json({ message: 'Debe enviar un arreglo de preguntas' });
  const ops = payload.map(p => ({
    updateOne: {
      filter: { pregunta: p.pregunta, tema: p.tema, nivel: p.nivel, tipo: p.tipo },
      update: { $set: p },
      upsert: true
    }
  }));
  const resBulk = await Pregunta.bulkWrite(ops, { ordered: false });
  res.status(201).json({ upserted: resBulk.upsertedCount || 0, modified: resBulk.modifiedCount || 0 });
});

export const sugerirPreguntas = asyncHandler(async (req, res) => {
  const { nivel = 'basico', temas = 'ahorro,inversion,credito', limit = 10 } = req.query;
  const temasArr = String(temas).split(',').map(t => t.trim()).filter(Boolean);
  const filtro = { nivel, tema: { $in: temasArr }, estado: 'activa' };
  const items = await Pregunta.aggregate([
    { $match: filtro },
    { $sample: { size: Number(limit) } }
  ]);
  res.json({ data: items });
});
