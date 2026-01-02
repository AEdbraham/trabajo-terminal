import Joi from 'joi';

const respuestaExamenSchema = Joi.object({
  preguntaID: Joi.string().hex().length(24).required(),
  respuestaSeleccionada: Joi.string().valid('a','b','c','d').required(),
});

export const crearExamenSchema = Joi.object({
  tipo: Joi.string().valid('conocimiento','percepcion').required(),
  tema: Joi.string().valid('ahorro','inversion','credito','control-gastos','general').required(),
  nivel: Joi.string().valid('basico','intermedio','avanzado').required(),
  usuarioID: Joi.string().hex().length(24).required(),
  preguntas: Joi.array().items(respuestaExamenSchema).min(1).required(),
  puntuacionMinimaRequerida: Joi.number().integer().min(0).optional(),
});

export const examenIdParamSchema = Joi.object({ id: Joi.string().hex().length(24).required() });
export const usuarioIdParamSchema = Joi.object({ usuarioId: Joi.string().hex().length(24).required() });

// Query para generación de examen (preguntas aleatorias)
export const generarExamenQuerySchema = Joi.object({
  tipo: Joi.string().valid('conocimiento','percepcion').optional(),
  nivel: Joi.string().valid('basico','intermedio','avanzado').optional(),
  temas: Joi.string().optional(),
  limite: Joi.number().integer().min(1).max(50).default(10),
});
