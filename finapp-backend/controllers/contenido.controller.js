import Contenido from "../models/Contenido.js";
import FeedbackContenido from "../models/FeedbackContenido.js";
import asyncHandler from "../utils/asyncHandler.js";

// Público (educación)
export const listarCapsulas = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [total, items] = await Promise.all([
    Contenido.countDocuments({ tipo: 'capsula' }),
    Contenido.find({ tipo: 'capsula' }).sort({ fechaCreacion: -1 }).skip(skip).limit(Number(limit))
  ]);
  res.json({
    data: items,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)) || 1
    }
  });
});

export const obtenerCapsula = asyncHandler(async (req, res) => {
  const item = await Contenido.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Contenido no encontrado" });
  res.json(item);
});

export const buscarContenido = asyncHandler(async (req, res) => {
  const { text, tema, etiqueta, tipo, nivel, page = 1, limit = 20 } = req.query;
  const filtro = {};
  if (tipo) filtro.tipo = tipo;
  if (nivel) filtro.nivel = nivel;
  if (tema) filtro.temas = tema;
  if (etiqueta) filtro.etiquetas = etiqueta;
  let consulta = Contenido.find(filtro);
  if (text) {
    consulta = Contenido.find({ $text: { $search: text }, ...filtro });
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [total, items] = await Promise.all([
    Contenido.countDocuments(text ? { $text: { $search: text }, ...filtro } : filtro),
    consulta.sort({ fechaCreacion: -1 }).skip(skip).limit(Number(limit))
  ]);
  res.json({ data: items, meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) || 1 } });
});

export const toggleFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tipo } = req.query; // like | dislike
  if (!['like','dislike'].includes(tipo)) return res.status(400).json({ message: 'tipo debe ser like o dislike' });
  const contenido = await Contenido.findById(id);
  if (!contenido) return res.status(404).json({ message: 'Contenido no encontrado' });

  const existente = await FeedbackContenido.findOne({ usuarioId: req.user.id, contenidoId: id });
  let estadoUsuario;
  if (!existente) {
    await FeedbackContenido.create({ usuarioId: req.user.id, contenidoId: id, tipo });
    if (tipo === 'like') contenido.likes += 1; else contenido.dislikes += 1;
    estadoUsuario = tipo;
  } else if (existente.tipo === tipo) {
    // Toggle off
    await existente.deleteOne();
    if (tipo === 'like') contenido.likes = Math.max(0, contenido.likes - 1); else contenido.dislikes = Math.max(0, contenido.dislikes - 1);
    estadoUsuario = 'none';
  } else {
    // Cambiar tipo
    const old = existente.tipo;
    existente.tipo = tipo;
    await existente.save();
    if (old === 'like') contenido.likes = Math.max(0, contenido.likes - 1); else contenido.dislikes = Math.max(0, contenido.dislikes - 1);
    if (tipo === 'like') contenido.likes += 1; else contenido.dislikes += 1;
    estadoUsuario = tipo;
  }
  await contenido.save({ validateModifiedOnly: true });

  res.json({
    contenidoId: id,
    likes: contenido.likes,
    dislikes: contenido.dislikes,
    estadoUsuario
  });
});

// Admin
export const crearContenido = asyncHandler(async (req, res) => {
  const item = await Contenido.create(req.body);
  res.status(201).json(item);
});

export const actualizarContenido = asyncHandler(async (req, res) => {
  const item = await Contenido.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) return res.status(404).json({ message: "Contenido no encontrado" });
  res.json(item);
});

export const eliminarContenido = asyncHandler(async (req, res) => {
  const item = await Contenido.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Contenido no encontrado" });
  res.status(204).send();
});
