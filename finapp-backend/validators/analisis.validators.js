import Joi from 'joi';

export const generarAnalisisSchema = Joi.object({
  usuarioId: Joi.string().hex().length(24).required(),
  periodo: Joi.object({
    mes: Joi.number().integer().min(1).max(12).required(),
    año: Joi.number().integer().min(2000).max(2100).required(),
  }).required(),
  resumen: Joi.object({
    ingresosTotales: Joi.number().min(0).optional(),
    egresosTotales: Joi.number().min(0).optional(),
    ahorro: Joi.number().min(0).optional(),
    dti: Joi.number().min(0).max(1).optional(),
  }).optional(),
  comparativo: Joi.object({
    variacionMensual: Joi.number().optional(),
    vsPresupuesto: Joi.number().optional(),
  }).optional(),
  tendencias: Joi.object({
    gastoPromedio: Joi.number().optional(),
    categoriaPrincipal: Joi.string().optional(),
  }).optional(),
});
