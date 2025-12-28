import mongoose from "mongoose";
import IndicadorKPI from "../models/IndicadorKPI.js";
import Transaccion from "../models/Transaccion.js";
import Categoria from "../models/Categoria.js";
import Meta from "../models/Meta.js";
import Usuario from "../models/Usuario.js";
import asyncHandler from "../utils/asyncHandler.js";

// Helpers comunes para rango fechas
const buildDateMatch = (from, to) => {
  if (!from && !to) return {};
  const range = {};
  if (from) range.$gte = new Date(from);
  if (to) range.$lte = new Date(to);
  return { fecha: range };
};

const toObjectId = (id) => {
  try {
    if (!id) return null;
    return typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;
  } catch {
    return null;
  }
};

export const obtenerDashboard = asyncHandler(async (req, res) => {
  const { usuarioId } = req.query; // opcional: permitir dashboard global o por usuario
  const filtro = usuarioId ? { usuarioId } : {};
  const kpis = await IndicadorKPI.find(filtro).sort({ fechaCalculo: -1 }).limit(12);
  res.json({ items: kpis });
});

export const obtenerKPIs = asyncHandler(async (req, res) => {
  const { usuarioId } = req.query;
  const filtro = usuarioId ? { usuarioId } : {};
  const ultimo = await IndicadorKPI.findOne(filtro).sort({ fechaCalculo: -1 });
  if (!ultimo) return res.status(404).json({ message: "No hay KPIs calculados" });
  res.json(ultimo);a
});

// Serie temporal mensual de ingresos y egresos
export const serieTemporalUsuario = asyncHandler(async (req, res) => {
  const usuarioId = toObjectId(req.query.usuarioId || req.user.id);
  if (!usuarioId) return res.status(400).json({ message: "usuarioId inválido" });
  const { from, to } = req.query;
  const match = { usuarioId };
  Object.assign(match, buildDateMatch(from, to));
  const pipeline = [
    { $match: match },
    { $group: {
        _id: { año: { $year: "$fecha" }, mes: { $month: "$fecha" } },
        ingresos: { $sum: { $cond: [{ $eq: ["$tipo", "ingreso"] }, "$monto", 0] } },
        egresos: { $sum: { $cond: [{ $eq: ["$tipo", "egreso"] }, "$monto", 0] } }
      }
    },
    { $sort: { "_id.año": 1, "_id.mes": 1 } }
  ];
  const datos = await Transaccion.aggregate(pipeline);
  const serie = datos.map(d => ({
    año: d._id.año,
    mes: d._id.mes,
    ingresos: d.ingresos,
    egresos: d.egresos,
    ahorro: d.ingresos - d.egresos
  }));
  res.json({ serie });
});

// Composición de egresos por categoría (top-N) con porcentajes
export const composicionCategoriasUsuario = asyncHandler(async (req, res) => {
  const usuarioId = toObjectId(req.query.usuarioId || req.user.id);
  if (!usuarioId) return res.status(400).json({ message: "usuarioId inválido" });
  const { from, to, top = 5 } = req.query;
  const match = { usuarioId, tipo: "egreso" };
  Object.assign(match, buildDateMatch(from, to));
  const pipeline = [
    { $match: match },
    { $group: { _id: "$categoriaId", total: { $sum: "$monto" } } },
    { $sort: { total: -1 } },
    { $lookup: { from: "categorias", localField: "_id", foreignField: "_id", as: "categoria" } },
    { $unwind: { path: "$categoria", preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, categoriaId: "$categoria._id", nombre: "$categoria.nombre", total: 1 } }
  ];
  let resultados = await Transaccion.aggregate(pipeline);
  const totalEgresos = resultados.reduce((acc, r) => acc + r.total, 0);
  resultados = resultados.map(r => ({
    categoriaId: r.categoriaId,
    nombre: r.nombre || "(sin categoría)",
    total: r.total,
    porcentaje: totalEgresos ? (r.total / totalEgresos) : 0
  }));
  const topItems = resultados.slice(0, Number(top));
  res.json({ totalEgresos, items: topItems, otros: resultados.slice(Number(top)).reduce((a,c)=> a + c.total,0) });
});

// Resumen rápido (ingresos, egresos, ahorro) en rango
export const resumenUsuario = asyncHandler(async (req, res) => {
  const usuarioId = toObjectId(req.query.usuarioId || req.user.id);
  if (!usuarioId) return res.status(400).json({ message: "usuarioId inválido" });
  const { from, to } = req.query;
  const match = { usuarioId };
  Object.assign(match, buildDateMatch(from, to));
  const agg = await Transaccion.aggregate([
    { $match: match },
    { $group: {
        _id: null,
        ingresos: { $sum: { $cond: [{ $eq: ["$tipo", "ingreso"] }, "$monto", 0] } },
        egresos: { $sum: { $cond: [{ $eq: ["$tipo", "egreso"] }, "$monto", 0] } }
      }
    }
  ]);
  const base = agg[0] || { ingresos: 0, egresos: 0 };
  res.json({ ingresos: base.ingresos, egresos: base.egresos, ahorro: base.ingresos - base.egresos });
});

// Racha de días consecutivos con transacciones
export const rachaRegistroUsuario = asyncHandler(async (req, res) => {
  const usuarioId = toObjectId(req.query.usuarioId || req.user.id);
  if (!usuarioId) return res.status(400).json({ message: "usuarioId inválido" });
  const { from, to } = req.query;
  const match = { usuarioId };
  Object.assign(match, buildDateMatch(from, to));
  const fechas = await Transaccion.aggregate([
    { $match: match },
    { $project: { dia: { $dateToString: { format: "%Y-%m-%d", date: "$fecha" } } } },
    { $group: { _id: "$dia" } },
    { $sort: { _id: 1 } }
  ]);
  const dias = fechas.map(f => f._id);
  let maxRacha = 0; let rachaActual = 0; let anterior = null;
  for (const d of dias) {
    const dateObj = new Date(d + "T00:00:00Z");
    if (!anterior) {
      rachaActual = 1;
    } else {
      const diff = (dateObj - anterior) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        rachaActual += 1;
      } else {
        rachaActual = 1;
      }
    }
    if (rachaActual > maxRacha) maxRacha = rachaActual;
    anterior = dateObj;
  }
  res.json({ rachaMaxima: maxRacha });
});

// DTI (placeholder sin clasificación deuda detallada)
export const dtiUsuario = asyncHandler(async (req, res) => {
  const usuarioId = toObjectId(req.query.usuarioId || req.user.id);
  if (!usuarioId) return res.status(400).json({ message: "usuarioId inválido" });
  const { from, to } = req.query;
  const match = { usuarioId };
  Object.assign(match, buildDateMatch(from, to));
  const agg = await Transaccion.aggregate([
    { $match: match },
    { $group: {
        _id: null,
        ingresos: { $sum: { $cond: [{ $eq: ["$tipo", "ingreso"] }, "$monto", 0] } },
        egresos: { $sum: { $cond: [{ $eq: ["$tipo", "egreso"] }, "$monto", 0] } }
      }
    }
  ]);
  const base = agg[0] || { ingresos: 0, egresos: 0 };
  // Sin categorías de deuda -> usamos egresos totales como aproximación placeholder
  const dti = base.ingresos ? (base.egresos / base.ingresos) : 0;
  res.json({ dti });
});

// Variación mensual y vs presupuesto (usa egresos como referencia principal)
export const variacionMensualUsuario = asyncHandler(async (req, res) => {
  const usuarioId = toObjectId(req.query.usuarioId || req.user.id);
  if (!usuarioId) return res.status(400).json({ message: "usuarioId inválido" });
  const ahora = new Date();
  const año = Number(req.query.año) || ahora.getFullYear();
  const mes = Number(req.query.mes) || (ahora.getMonth() + 1); // 1-12
  const allowZeroBase = req.query.allowZeroBase === true || req.query.allowZeroBase === "true";
  const presupuestoManual = req.query.presupuesto ? Number(req.query.presupuesto) : null;

  // Mes anterior
  let añoAnterior = año;
  let mesAnterior = mes - 1;
  if (mesAnterior === 0) { mesAnterior = 12; añoAnterior = año - 1; }

  const inicioMesActual = new Date(Date.UTC(año, mes - 1, 1));
  const inicioMesSiguiente = new Date(Date.UTC(año, mes, 1));
  const inicioMesAnterior = new Date(Date.UTC(añoAnterior, mesAnterior - 1, 1));
  const inicioMesAnteriorSiguiente = new Date(Date.UTC(añoAnterior, mesAnterior, 1));

  const pipelineMes = (inicio, fin) => ([
    { $match: { usuarioId, fecha: { $gte: inicio, $lt: fin } } },
    { $group: {
        _id: null,
        ingresos: { $sum: { $cond: [{ $eq: ["$tipo", "ingreso"] }, "$monto", 0] } },
        egresos: { $sum: { $cond: [{ $eq: ["$tipo", "egreso"] }, "$monto", 0] } }
      }
    }
  ]);

  const [act, ant] = await Promise.all([
    Transaccion.aggregate(pipelineMes(inicioMesActual, inicioMesSiguiente)),
    Transaccion.aggregate(pipelineMes(inicioMesAnterior, inicioMesAnteriorSiguiente))
  ]);

  const actual = act[0] || { ingresos: 0, egresos: 0 };
  const anterior = ant[0] || { ingresos: 0, egresos: 0 };
  const ahorroActual = actual.ingresos - actual.egresos;
  const ahorroAnterior = anterior.ingresos - anterior.egresos;

  const variacion = (nuevo, viejo) => {
    if (viejo === 0) {
      if (!allowZeroBase) return null;
      const epsilon = 1; // evita división por cero; trata salto desde 0 como cambio grande
      return (nuevo - viejo) / epsilon;
    }
    return (nuevo - viejo) / viejo;
  };

  // Buscamos una meta que parezca presupuesto mensual (heurística: fechaLimite dentro del mes y descripcion incluye 'presupuesto')
  let vsPresupuestoEgresos = null;
  if (presupuestoManual && presupuestoManual > 0) {
    vsPresupuestoEgresos = (actual.egresos - presupuestoManual) / presupuestoManual;
  } else {
    // Primero busca meta explícita tipo presupuesto-mensual para el mes/año
    let metaPresupuesto = await Meta.findOne({ usuario: usuarioId, tipo: "presupuesto-mensual", año, mes });
    // Fallback legacy: descripción "presupuesto" con fechaLimite en el mes
    if (!metaPresupuesto) {
      metaPresupuesto = await Meta.findOne({
        usuario: usuarioId,
        descripcion: /presupuesto/i,
        fechaLimite: { $gte: inicioMesActual, $lt: inicioMesSiguiente }
      });
    }
    if (metaPresupuesto && metaPresupuesto.montoObjetivo > 0) {
      vsPresupuestoEgresos = (actual.egresos - metaPresupuesto.montoObjetivo) / metaPresupuesto.montoObjetivo;
    }
  }

  res.json({
    periodo: { año, mes },
    mesAnterior: { año: añoAnterior, mes: mesAnterior },
    actual: { ingresos: actual.ingresos, egresos: actual.egresos, ahorro: ahorroActual },
    anterior: { ingresos: anterior.ingresos, egresos: anterior.egresos, ahorro: ahorroAnterior },
    variacionIngresos: variacion(actual.ingresos, anterior.ingresos),
    variacionEgresos: variacion(actual.egresos, anterior.egresos),
    variacionAhorro: variacion(ahorroActual, ahorroAnterior),
    vsPresupuestoEgresos
  });
});

// Cohortes admin: usuarios por mes de registro + actividad en periodo
export const cohortesAdmin = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const inicio = new Date(from); // inclusive
  const fin = new Date(to); // inclusive
  const usuarios = await Usuario.aggregate([
    { $group: { _id: { año: { $year: "$fechaRegistro" }, mes: { $month: "$fechaRegistro" } }, usuarios: { $sum: 1 }, ids: { $push: "$_id" } } },
    { $sort: { "_id.año": 1, "_id.mes": 1 } }
  ]);

  const resultado = [];
  for (const coh of usuarios) {
    const activos = await Transaccion.aggregate([
      { $match: { usuarioId: { $in: coh.ids }, fecha: { $gte: inicio, $lte: fin } } },
      { $group: { _id: "$usuarioId" } }
    ]);
    const activosCount = activos.length;
    resultado.push({
      año: coh._id.año,
      mes: coh._id.mes,
      usuarios: coh.usuarios,
      activosPeriodo: activosCount,
      tasaActividad: coh.usuarios ? activosCount / coh.usuarios : 0
    });
  }
  const totales = resultado.reduce((acc, r) => {
    acc.usuarios += r.usuarios;
    acc.activosPeriodo += r.activosPeriodo;
    return acc;
  }, { usuarios: 0, activosPeriodo: 0 });
  res.json({ periodo: { from, to }, cohorts: resultado, totales });
});

// Segmentación admin: incomeTier y ahorroRate en periodo
export const segmentacionAdmin = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const inicio = new Date(from);
  const fin = new Date(to);
  const transAgg = await Transaccion.aggregate([
    { $match: { fecha: { $gte: inicio, $lte: fin } } },
    { $group: {
        _id: "$usuarioId",
        ingresos: { $sum: { $cond: [{ $eq: ["$tipo", "ingreso"] }, "$monto", 0] } },
        egresos: { $sum: { $cond: [{ $eq: ["$tipo", "egreso"] }, "$monto", 0] } }
      }
    },
    { $lookup: { from: "usuarios", localField: "_id", foreignField: "_id", as: "usuario" } },
    { $unwind: "$usuario" },
    { $project: {
        usuarioId: "$_id",
        ingresos: 1,
        egresos: 1,
        perfilIngresosMensuales: "$usuario.perfil.ingresosMensuales"
      }
    }
  ]);

  const tierFor = (ing) => {
    if (ing == null) return "desconocido";
    if (ing < 15000) return "bajo";
    if (ing < 30000) return "medio";
    return "alto";
  };

  const items = transAgg.map(t => {
    const ingresosBase = t.perfilIngresosMensuales != null ? t.perfilIngresosMensuales : t.ingresos;
    const ahorro = t.ingresos - t.egresos;
    const ahorroRate = ingresosBase ? (ahorro / ingresosBase) : null;
    return {
      usuarioId: t.usuarioId,
      ingresosPeriodo: t.ingresos,
      egresosPeriodo: t.egresos,
      ahorroPeriodo: ahorro,
      ingresoReferencia: ingresosBase,
      ahorroRate,
      incomeTier: tierFor(ingresosBase)
    };
  });

  const grupos = {};
  for (const it of items) {
    const k = it.incomeTier;
    if (!grupos[k]) grupos[k] = { incomeTier: k, usuarios: 0, ahorroRatePromedio: 0, ahorroRateSum: 0 };
    grupos[k].usuarios += 1;
    if (it.ahorroRate != null) grupos[k].ahorroRateSum += it.ahorroRate;
  }
  Object.values(grupos).forEach(g => {
    g.ahorroRatePromedio = g.usuarios ? g.ahorroRateSum / g.usuarios : 0;
    delete g.ahorroRateSum;
  });

  res.json({ periodo: { from, to }, grupos: Object.values(grupos), detalles: items });
});
