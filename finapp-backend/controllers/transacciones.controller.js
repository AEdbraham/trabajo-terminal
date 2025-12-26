import Transaccion from "../models/Transaccion.js";
import asyncHandler from "../utils/asyncHandler.js";

export const crearTransaccion = asyncHandler(async (req, res) => {
  const tx = await Transaccion.create(req.body);
  res.status(201).json(tx);
});

export const listarPorUsuario = asyncHandler(async (req, res) => {
  const { usuarioId } = req.params;
  const { page = 1, limit = 20, from, to, categoriaId, tipo } = req.query;

  const filtro = { usuarioId };
  if (from || to) {
    filtro.fecha = {};
    if (from) filtro.fecha.$gte = new Date(from);
    if (to) filtro.fecha.$lte = new Date(to);
  }
  if (categoriaId) filtro.categoriaId = categoriaId;
  if (tipo) filtro.tipo = tipo;

  const skip = (Number(page) - 1) * Number(limit);
  const [total, txs] = await Promise.all([
    Transaccion.countDocuments(filtro),
    Transaccion.find(filtro).sort({ fecha: -1 }).skip(skip).limit(Number(limit)),
  ]);

  res.json({
    data: txs,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)) || 1,
    },
  });
});

export const obtenerTransaccion = asyncHandler(async (req, res) => {
  const tx = await Transaccion.findById(req.params.id);
  if (!tx) return res.status(404).json({ message: "Transacción no encontrada" });
  // Ownership: sólo admin o dueño
  if (req.user.rol !== 'administrador' && tx.usuarioId.toString() !== req.user.id) {
    return res.status(403).json({ message: 'No autorizado: transacción de otro usuario' });
  }
  res.json(tx);
});

export const actualizarTransaccion = asyncHandler(async (req, res) => {
  // Evitar cambio de usuarioId
  if (req.body.usuarioId && req.body.usuarioId !== req.user.id && req.user.rol !== 'administrador') {
    return res.status(400).json({ message: 'No se permite cambiar usuarioId' });
  }
  // Verificar ownership antes de actualizar
  const original = await Transaccion.findById(req.params.id);
  if (!original) return res.status(404).json({ message: 'Transacción no encontrada' });
  if (req.user.rol !== 'administrador' && original.usuarioId.toString() !== req.user.id) {
    return res.status(403).json({ message: 'No autorizado: transacción de otro usuario' });
  }
  const tx = await Transaccion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json(tx);
});

export const eliminarTransaccion = asyncHandler(async (req, res) => {
  const tx = await Transaccion.findById(req.params.id);
  if (!tx) return res.status(404).json({ message: 'Transacción no encontrada' });
  if (req.user.rol !== 'administrador' && tx.usuarioId.toString() !== req.user.id) {
    return res.status(403).json({ message: 'No autorizado: transacción de otro usuario' });
  }
  await Transaccion.findByIdAndDelete(req.params.id);
  res.status(204).send();
});
