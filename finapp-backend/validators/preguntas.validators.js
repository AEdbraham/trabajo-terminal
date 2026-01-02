import Joi from 'joi';

const respuestaSchema = Joi.object({
  inciso: Joi.string().valid('a','b','c','d').required(),
  texto: Joi.string().min(1).required(),
  correcta: Joi.boolean().required(),
});

export const crearPreguntaSchema = Joi.object({
  id: Joi.string().optional(),
  tipo: Joi.string().valid('conocimiento','percepcion').required(),
  tema: Joi.string().valid('ahorro','inversion','credito','control-gastos','general').required(),
  nivel: Joi.string().valid('basico','intermedio','avanzado').required(),
  dimension: Joi.string().allow('', null).optional(),
  pregunta: Joi.string().min(5).required(),
  respuestas: Joi.array().items(respuestaSchema).min(2).max(4).required()
}).unknown(true).custom((value, helpers) => {
  const correctas = (value.respuestas || []).filter(r => r.correcta).length;
  if (correctas < 1) return helpers.error('any.invalid');
  return value;
}, 'al menos una respuesta correcta');

export const actualizarPreguntaSchema = crearPreguntaSchema.fork([
  'tipo','tema','nivel','pregunta','respuestas','dimension'
], (s) => s.optional());

export const buscarPreguntasQuerySchema = Joi.object({
  tipo: Joi.string().valid('conocimiento','percepcion').optional(),
  tema: Joi.string().valid('ahorro','inversion','credito','control-gastos','general').optional(),
  nivel: Joi.string().valid('basico','intermedio','avanzado').optional(),
  estado: Joi.string().valid('activa','inactiva').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  text: Joi.string().optional(),
});

export const importPreguntasSchema = Joi.array().items(crearPreguntaSchema).min(1).required();

export const preguntaIdParamSchema = Joi.object({ id: Joi.string().hex().length(24).required() });

// Permitir POST de una sola pregunta o de un arreglo
export const crearPreguntaOrArraySchema = Joi.alternatives().try(
  crearPreguntaSchema,
  Joi.array().items(crearPreguntaSchema).min(1)
);
