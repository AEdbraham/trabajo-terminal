import Transaccion from '../models/Transaccion.js';
import Recomendacion from '../models/Recomendacion.js';
import { RULES_V1 } from './recommendation.rules.js';

// Comparadores simples
function compare(metricValue, op, expected) {
  switch (op) {
    case '<': return metricValue < expected;
    case '>': return metricValue > expected;
    case '<=': return metricValue <= expected;
    case '>=': return metricValue >= expected;
    case '==': return metricValue === expected;
    case '!=': return metricValue !== expected;
    case 'in': return Array.isArray(expected) && expected.includes(metricValue);
    case 'not_in': return Array.isArray(expected) && !expected.includes(metricValue);
    case 'exists': return (metricValue !== undefined && metricValue !== null) === expected;
    default: return false;
  }
}

// Derivar segmento según métricas
function deriveSegment(metrics) {
  if (metrics.dti >= 0.4) return 'alto_endeudamiento';
  if (metrics.ratioAhorro < 0.05) return 'ahorro_nulo';
  if (metrics.transacciones30Dias < 5) return 'principiante';
  return 'estable';
}

// Calcular métricas básicas
async function computeMetrics(usuarioId) {
  const ahora = new Date();
  const hace30 = new Date(ahora.getTime() - 30*24*60*60*1000);
  const hace60 = new Date(ahora.getTime() - 60*24*60*60*1000);
  const hace90 = new Date(ahora.getTime() - 90*24*60*60*1000);

  const tx30 = await Transaccion.find({ usuarioId, fecha: { $gte: hace30 } });
  const tx90 = await Transaccion.find({ usuarioId, fecha: { $gte: hace90 } });
  const txPrev30 = await Transaccion.find({ usuarioId, fecha: { $gte: hace60, $lt: hace30 } });

  const ingresos30 = tx30.filter(t => t.tipo === 'ingreso').reduce((s,t)=>s+t.monto,0);
  const egresos30 = tx30.filter(t => t.tipo === 'egreso').reduce((s,t)=>s+t.monto,0);
  const ingresos90 = tx90.filter(t => t.tipo === 'ingreso').reduce((s,t)=>s+t.monto,0);

  // Métricas adicionales para crédito
  const egresosTarjeta30 = tx30
    .filter(t => t.tipo === 'egreso' && (t.metodoPago || '').toLowerCase() === 'tarjeta')
    .reduce((s,t)=>s+t.monto,0);
  const interestFees30 = tx30
    .filter(t => t.tipo === 'egreso' && ((t.etiquetas || []).some(e => {
      const v = (e || '').toLowerCase();
      return v === 'interes' || v === 'interés' || v === 'comision' || v === 'comisión';
    })))
    .reduce((s,t)=>s+t.monto,0);

  const ingresosPrev30 = txPrev30.filter(t => t.tipo === 'ingreso').reduce((s,t)=>s+t.monto,0);
  const egresosPrev30 = txPrev30.filter(t => t.tipo === 'egreso').reduce((s,t)=>s+t.monto,0);

  const ratioAhorro = ingresos30 > 0 ? (ingresos30 - egresos30)/ingresos30 : 0;
  // DTI simplificado: egresos30 / ingresos30 (idealmente separar deuda real)
  const dti = ingresos30 > 0 ? (egresos30 / ingresos30) : 0;
  const dtiPrev = ingresosPrev30 > 0 ? (egresosPrev30 / ingresosPrev30) : 0;
  const dtiDelta = dti - dtiPrev;
  const ingresosMensualesPromedio = ingresos90 / 3;

  const cardSpendRatio = ingresos30 > 0 ? (egresosTarjeta30 / ingresos30) : 0;
  const debtPaymentsCount30 = tx30.filter(t => {
    if (t.tipo !== 'egreso') return false;
    const sub = (t.subcategoria || '').toLowerCase();
    const etiquetas = (t.etiquetas || []).map(e => (e || '').toLowerCase());
    return sub.includes('deuda') || etiquetas.includes('deuda');
  }).length;

  return {
    ratioAhorro: Number(ratioAhorro.toFixed(3)),
    dti: Number(dti.toFixed(3)),
    dtiPrev: Number(dtiPrev.toFixed(3)),
    dtiDelta: Number(dtiDelta.toFixed(3)),
    ingresosMensualesPromedio: Number(ingresosMensualesPromedio.toFixed(2)),
    transacciones30Dias: tx30.length,
    cardSpendRatio: Number(cardSpendRatio.toFixed(3)),
    interestFees30: Number(interestFees30.toFixed(2)),
    debtPaymentsCount30,
  };
}

export async function generarRecomendaciones(usuarioId, area) {
  const metrics = await computeMetrics(usuarioId);
  const segmento = deriveSegment(metrics);

  const reglas = RULES_V1.filter(r => !area || r.tipo === area);

  const candidatas = [];
  for (const regla of reglas) {
    if (regla.segmentoTarget && !regla.segmentoTarget.includes(segmento)) continue;
    const pasa = regla.condiciones.every(c => compare(metrics[c.metric], c.op, c.value));
    if (!pasa) continue;

    // Idempotencia: existe vigente?
    const existente = await Recomendacion.findOne({ usuarioId, reglaAplicada: regla.id, estado: 'nueva' });
    if (existente) continue;

    // Construir razones reemplazando placeholders
    const razones = (regla.razonesTemplate || []).map(t => {
      return t.replace(/{{(\w+)}}/g, (_, k) => metrics[k] !== undefined ? String(metrics[k]) : '');
    });

    const puntuacion = Math.max(0, Math.min(100, regla.puntuacion(metrics) || 0));
    const caducidad = new Date(Date.now() + regla.caducidadDias*24*60*60*1000);

    candidatas.push({
      usuarioId,
      tipo: regla.tipo,
      reglaAplicada: regla.id,
      mensaje: regla.mensaje,
      prioridad: regla.prioridadBase,
      razones,
      puntuacion,
      caducidad,
      segmentoPerfil: segmento,
      insights: metrics,
      versionReglas: 'v1',
      origen: 'motor_reglas_v1'
    });
  }

  if (!candidatas.length) return [];

  const creadas = await Recomendacion.insertMany(candidatas);
  return creadas;
}
