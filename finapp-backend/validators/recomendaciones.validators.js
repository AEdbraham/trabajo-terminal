import Joi from 'joi';

export const generarRecomendacionSchema = Joi.object({
  usuarioId: Joi.string().hex().length(24).required(),
  area: Joi.string().valid('ahorro', 'inversion', 'credito').optional(),
  force: Joi.boolean().optional(), // reservado para futuro uso admin
});
