import Joi from 'joi';

export const crearTransaccionSchema = Joi.object({
  usuarioId: Joi.string().hex().length(24).required(),
  tipo: Joi.string().valid('ingreso', 'egreso').required(),
  monto: Joi.number().positive().required(),
  fecha: Joi.date().required(),
  categoriaId: Joi.string().hex().length(24).optional(),
  subcategoria: Joi.string().max(100).optional(),
  metodoPago: Joi.string().max(50).optional(),
  notas: Joi.string().max(500).optional(),
  etiquetas: Joi.array().items(Joi.string().max(30)).optional(),
  esTransferenciaInterna: Joi.boolean().optional(),
  origen: Joi.string().valid('manual', 'csv').default('manual'),
  archivoCSV: Joi.string().optional(),
});

export const actualizarTransaccionSchema = crearTransaccionSchema.fork([
  'usuarioId', 'tipo', 'monto', 'fecha'
], (schema) => schema.optional());

// Query params para listado con paginación y filtros
export const listarTransaccionesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  from: Joi.date().optional(),
  to: Joi.date().optional(),
  categoriaId: Joi.string().hex().length(24).optional(),
  tipo: Joi.string().valid('ingreso', 'egreso').optional(),
}).custom((value, helpers) => {
  if (value.from && value.to && value.from > value.to) {
    return helpers.error('any.invalid');
  }
  return value;
}).messages({ 'any.invalid': 'from no puede ser mayor que to' });

// Params validation
export const usuarioIdParamSchema = Joi.object({
  usuarioId: Joi.string().hex().length(24).required(),
});

export const transaccionIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

// Bulk creation: array de transacciones
export const crearTransaccionesBulkSchema = Joi.array().items(crearTransaccionSchema).min(1).max(500);
