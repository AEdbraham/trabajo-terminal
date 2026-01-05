import Joi from "joi";

export const rangoFechasSchema = Joi.object({
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional().min(Joi.ref('from')),
  usuarioId: Joi.string().optional(), // permitido para admin
});

export const composicionQuerySchema = rangoFechasSchema.keys({
  top: Joi.number().integer().min(1).max(20).default(5)
});

export const serieTemporalSchema = rangoFechasSchema; // reutiliza from/to/usuarioId

export const resumenQuerySchema = rangoFechasSchema;

export const rachaQuerySchema = rangoFechasSchema;

export const dtiQuerySchema = rangoFechasSchema;

export const variacionMensualSchema = Joi.object({
  usuarioId: Joi.string().optional(),
  año: Joi.number().integer().min(2000).max(2100).optional(),
  mes: Joi.number().integer().min(1).max(12).optional(),
  allowZeroBase: Joi.boolean().optional().default(false),
  presupuesto: Joi.number().positive().optional()
});

export const cohortesAdminSchema = Joi.object({
  from: Joi.date().iso().required(),
  to: Joi.date().iso().min(Joi.ref('from')).required()
});

export const segmentacionAdminSchema = Joi.object({
  from: Joi.date().iso().required(),
  to: Joi.date().iso().min(Joi.ref('from')).required()
});

export const generarKpisAdminSchema = Joi.object({
  usuarioId: Joi.string().hex().length(24).required(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().min(Joi.ref('from')).optional()
});
