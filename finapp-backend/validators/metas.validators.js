import Joi from "joi";

const baseMeta = {
  usuario: Joi.string().optional(),
  descripcion: Joi.string().allow('', null).optional(),
  montoObjetivo: Joi.number().positive().required(),
  montoActual: Joi.number().min(0).optional(),
  fechaLimite: Joi.date().iso().optional(),
};

export const crearMetaSchema = Joi.object({
  ...baseMeta,
  tipo: Joi.string().valid('presupuesto-mensual', 'ahorro', 'deuda').required(),
  mes: Joi.when('tipo', {
    is: 'presupuesto-mensual',
    then: Joi.number().integer().min(1).max(12).required(),
    otherwise: Joi.forbidden(),
  }),
  año: Joi.when('tipo', {
    is: 'presupuesto-mensual',
    then: Joi.number().integer().min(2000).max(2100).required(),
    otherwise: Joi.forbidden(),
  }),
});

export const actualizarMetaSchema = Joi.object({
  // No permitir cambiar tipo ni usuario ni periodo
  tipo: Joi.forbidden(),
  usuario: Joi.forbidden(),
  mes: Joi.forbidden(),
  año: Joi.forbidden(),
  descripcion: baseMeta.descripcion,
  montoObjetivo: baseMeta.montoObjetivo,
  montoActual: baseMeta.montoActual,
  fechaLimite: baseMeta.fechaLimite,
});
