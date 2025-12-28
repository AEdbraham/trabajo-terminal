import Meta from "../models/Meta.js";
import Transaccion from "../models/Transaccion.js";
import asyncHandler from "../utils/asyncHandler.js";

const isAdmin = (req) => req.user && req.user.rol === 'administrador';

export const crearMeta = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  // Si no es admin, fuerza usuario a ser el propio
  if (!isAdmin(req) || !body.usuario) {
    body.usuario = req.user.id;
  }
  const meta = await Meta.create(body);
  res.status(201).json(meta);
});

export const listarMetas = asyncHandler(async (req, res) => {
  const { usuarioId } = req.params;
  const metas = await Meta.find(usuarioId ? { usuario: usuarioId } : {});
  res.json(metas);
});

export const actualizarMeta = asyncHandler(async (req, res) => {
  const existente = await Meta.findById(req.params.id);
  if (!existente) return res.status(404).json({ message: "Meta no encontrada" });
  if (!isAdmin(req) && existente.usuario.toString() !== req.user.id) {
    return res.status(403).json({ message: 'No autorizado: meta de otro usuario' });
  }
  const meta = await Meta.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!meta) return res.status(404).json({ message: "Meta no encontrada" });
  res.json(meta);
});

export const eliminarMeta = asyncHandler(async (req, res) => {
  const existente = await Meta.findById(req.params.id);
  if (!existente) return res.status(404).json({ message: "Meta no encontrada" });
  if (!isAdmin(req) && existente.usuario.toString() !== req.user.id) {
    return res.status(403).json({ message: 'No autorizado: meta de otro usuario' });
  }
  const meta = await Meta.findByIdAndDelete(req.params.id);
  if (!meta) return res.status(404).json({ message: "Meta no encontrada" });
  res.status(204).send();
});

// GET /metas/usuario/:usuarioId/activas/count
export const contarMetasActivas = asyncHandler(async (req, res) => {
  const { usuarioId } = req.params;
  const match = { usuario: usuarioId, estado: 'activa' };
  const [totalActivas, grupos] = await Promise.all([
    Meta.countDocuments(match),
    Meta.aggregate([
      { $match: match },
      { $group: { _id: '$tipo', count: { $sum: 1 } } }
    ])
  ]);
  const porTipo = { 'presupuesto-mensual': 0, 'ahorro': 0, 'deuda': 0 };
  for (const g of grupos) porTipo[g._id] = g.count;
  res.json({ totalActivas, porTipo });
});

// GET /metas/:id/progreso
export const progresoMeta = asyncHandler(async (req, res) => {
  const meta = await Meta.findById(req.params.id);
  if (!meta) return res.status(404).json({ message: 'Meta no encontrada' });
  if (!isAdmin(req) && meta.usuario.toString() !== req.user.id) {
    return res.status(403).json({ message: 'No autorizado: meta de otro usuario' });
  }

  let montoActual = meta.montoActual || 0;
  let periodo = null;
  if (meta.tipo === 'presupuesto-mensual') {
    const inicio = new Date(Date.UTC(meta.año, meta.mes - 1, 1));
    const fin = new Date(Date.UTC(meta.año, meta.mes, 1));
    const agg = await Transaccion.aggregate([
      { $match: { usuarioId: meta.usuario, tipo: 'egreso', fecha: { $gte: inicio, $lt: fin } } },
      { $group: { _id: null, total: { $sum: '$monto' } } }
    ]);
    montoActual = (agg[0]?.total) || 0;
    periodo = { año: meta.año, mes: meta.mes, from: inicio, to: new Date(fin.getTime() - 1) };
  } else if (meta.tipo === 'ahorro') {
    // Calcula aportes de ahorro desde transacciones con etiqueta "ahorro"
    const agg = await Transaccion.aggregate([
      { $match: { usuarioId: meta.usuario, etiquetas: { $in: ['ahorro'] } } },
      { $group: { _id: null, totalIngresos: { $sum: { $cond: [{ $eq: ['$tipo','ingreso'] }, '$monto', 0] } }, totalEgresos: { $sum: { $cond: [{ $eq: ['$tipo','egreso'] }, '$monto', 0] } } } }
    ]);
    const a = agg[0] || { totalIngresos: 0, totalEgresos: 0 };
    // Permite ahorrar vía ingresos marcados o egresos negativos marcados (p.ej. transferir a cuenta ahorro)
    montoActual = Math.max(0, a.totalIngresos - a.totalEgresos);
  } else if (meta.tipo === 'deuda') {
    // Calcula pagos de deuda con etiqueta "pago-deuda" (egresos)
    const agg = await Transaccion.aggregate([
      { $match: { usuarioId: meta.usuario, tipo: 'egreso', etiquetas: { $in: ['pago-deuda'] } } },
      { $group: { _id: null, totalPagos: { $sum: '$monto' } } }
    ]);
    montoActual = (agg[0]?.totalPagos) || 0;
  }

  const porcentaje = meta.montoObjetivo > 0 ? Math.min(1, montoActual / meta.montoObjetivo) : 0;
  const hoy = new Date();
  let diasRestantes = null;
  if (meta.fechaLimite) {
    diasRestantes = Math.ceil((new Date(meta.fechaLimite) - hoy) / (1000 * 60 * 60 * 24));
  } else if (meta.tipo === 'presupuesto-mensual' && periodo) {
    diasRestantes = Math.ceil((periodo.to - hoy) / (1000 * 60 * 60 * 24));
  }
  const restante = Math.max(0, meta.montoObjetivo - montoActual);

  res.json({
    metaId: meta._id,
    tipo: meta.tipo,
    usuario: meta.usuario,
    periodo,
    montoObjetivo: meta.montoObjetivo,
    montoActual,
    restante,
    porcentaje,
    diasRestantes
  });
});
