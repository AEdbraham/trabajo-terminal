import SimulatorEntry from "../models/SimulatorEntry.js";
import asyncHandler from "../utils/asyncHandler.js";
import Joi from 'joi';

// Schemas de input por simulador
const inputSchemas = {
  'savings': Joi.object({
    goalAmount: Joi.number().positive().required(),
    months: Joi.number().integer().min(1).required(),
    initialAmount: Joi.number().min(0).default(0),
    annualRate: Joi.number().min(0).required(),
  }),
  'compound': Joi.object({
    initialCapital: Joi.number().min(0).default(0),
    monthlyDeposit: Joi.number().min(0).default(0),
    annualRate: Joi.number().min(0).required(),
    years: Joi.number().integer().min(1).required(),
    frequency: Joi.number().valid(1,2,4,12,365).required(),
  }),
  'bonds': Joi.object({
    purchasePrice: Joi.number().positive().required(),
    nominalValue: Joi.number().positive().required(),
    daysToMaturity: Joi.number().integer().min(1).required(),
  }),
  'credit-card': Joi.object({
    balance: Joi.number().positive().required(),
    annualRate: Joi.number().min(0).required(),
    minimumPayment: Joi.number().positive().required(),
    fixedPayment: Joi.number().min(0).default(0),
  }),
  'loan': Joi.object({
    loanAmount: Joi.number().positive().required(),
    months: Joi.number().integer().min(1).required(),
    annualRate: Joi.number().min(0).required(),
    openingFee: Joi.number().min(0).default(0),
  }),
  'debt-payoff': Joi.object({
    monthlyBudget: Joi.number().positive().required(),
    debts: Joi.array().items(Joi.object({
      name: Joi.string().allow('', null),
      balance: Joi.number().positive().required(),
      rate: Joi.number().min(0).required(),
      minPayment: Joi.number().positive().required(),
    })).min(1).required(),
  }),
};

function validateInput(simulador, input) {
  const schema = inputSchemas[simulador];
  if (!schema) return { error: 'Simulador no soportado' };
  const { error, value } = schema.validate(input, { abortEarly: false, stripUnknown: true });
  if (error) {
    return { error: error.details.map(d => ({ message: d.message, path: d.path })) };
  }
  return { value };
}

export const createEntry = asyncHandler(async (req, res) => {
  const simulador = req.params.simulador;
  const { tipo, input } = req.body;
  if (!['usuario','nube'].includes(tipo)) {
    return res.status(400).json({ message: 'tipo inválido: use usuario|nube' });
  }
  const { error, value } = validateInput(simulador, input);
  if (error) return res.status(400).json({ message: 'Validación de input fallida', details: error });

  // Reglas de acceso
  if (tipo === 'nube' && req.user?.rol !== 'administrador') {
    return res.status(403).json({ message: 'Solo administradores pueden crear entradas de nube' });
  }

  const doc = await SimulatorEntry.create({
    simulador,
    tipo,
    usuarioID: tipo === 'usuario' ? req.user.id : undefined,
    creadoPor: req.user.id,
    input: value,
  });
  res.status(201).json(doc);
});

export const listEntries = asyncHandler(async (req, res) => {
  const simulador = req.params.simulador;
  const { scope = 'all', page = 1, limit = 20 } = req.query;
  const filtroBase = { simulador };
  let filtro;
  if (scope === 'user') filtro = { ...filtroBase, tipo: 'usuario', usuarioID: req.user.id };
  else if (scope === 'cloud') filtro = { ...filtroBase, tipo: 'nube' };
  else filtro = { ...filtroBase, $or: [ { tipo: 'nube' }, { tipo: 'usuario', usuarioID: req.user.id } ] };

  const skip = (Number(page) - 1) * Number(limit);
  const [total, items] = await Promise.all([
    SimulatorEntry.countDocuments(filtro),
    SimulatorEntry.find(filtro).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
  ]);
  res.json({ data: items, meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) || 1 } });
});

export const getEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await SimulatorEntry.findById(id);
  if (!item) return res.status(404).json({ message: 'Entrada no encontrada' });
  if (item.tipo === 'usuario' && item.usuarioID?.toString() !== req.user.id && req.user.rol !== 'administrador') {
    return res.status(403).json({ message: 'No autorizado' });
  }
  res.json(item);
});

export const deleteEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await SimulatorEntry.findById(id);
  if (!item) return res.status(404).json({ message: 'Entrada no encontrada' });
  // Solo dueño puede borrar sus entradas usuario; nube solo admin
  if (item.tipo === 'usuario') {
    if (item.usuarioID?.toString() !== req.user.id && req.user.rol !== 'administrador') {
      return res.status(403).json({ message: 'No autorizado para borrar entrada de otro usuario' });
    }
  } else if (item.tipo === 'nube') {
    if (req.user.rol !== 'administrador') {
      return res.status(403).json({ message: 'Solo administradores pueden borrar entradas de nube' });
    }
  }
  await SimulatorEntry.findByIdAndDelete(id);
  res.status(204).send();
});
