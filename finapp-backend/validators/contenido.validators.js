import Joi from 'joi';

const quizPreguntaSchema = Joi.object({
  enunciado: Joi.string().min(5).required(),
  opciones: Joi.array().items(Joi.object({
    texto: Joi.string().min(1).required(),
    correcta: Joi.boolean().required()
  })).min(2).max(6).required().custom((arr, helpers) => {
    const correctas = arr.filter(o => o.correcta).length;
    if (correctas === 0) return helpers.error('any.invalid');
    return arr;
  }, 'al menos una correcta'),
  explicacionCorrecta: Joi.string().allow('').optional()
});

export const crearContenidoSchema = Joi.object({
  titulo: Joi.string().min(3).max(150).required(),
  cuerpo: Joi.string().allow('').optional(),
  categoria: Joi.string().max(80).optional(),
  nivel: Joi.string().valid('básico', 'intermedio', 'avanzado').default('básico'),
  url: Joi.string().uri().optional(),
  tipo: Joi.string().valid('concepto','faq','capsula','guia').default('concepto'),
  temas: Joi.array().items(Joi.string().max(60)).optional(),
  etiquetas: Joi.array().items(Joi.string().max(40)).optional(),
  fuentes: Joi.array().items(Joi.object({ titulo: Joi.string().min(2).required(), url: Joi.string().uri().required() })).optional(),
  quiz: Joi.object({
    preguntas: Joi.array().items(quizPreguntaSchema).min(1).required(),
    intentosMax: Joi.number().integer().min(1).max(10).default(3)
  }).optional().when('tipo', { is: 'capsula', then: Joi.required(), otherwise: Joi.forbidden() }),
  pasos: Joi.array().items(Joi.object({
    titulo: Joi.string().min(3).required(),
    descripcion: Joi.string().allow('').optional(),
    duracionMinutos: Joi.number().integer().min(1).max(600).optional()
  })).optional().when('tipo', { is: 'guia', then: Joi.required(), otherwise: Joi.forbidden() }),
});

export const actualizarContenidoSchema = crearContenidoSchema.fork([
  'titulo'
], (schema) => schema.optional());

export const searchContenidoSchema = Joi.object({
  text: Joi.string().min(2).optional(),
  tema: Joi.string().optional(),
  etiqueta: Joi.string().optional(),
  tipo: Joi.string().valid('concepto','faq','capsula','guia').optional(),
  nivel: Joi.string().valid('básico','intermedio','avanzado').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20)
});

export const paginationCapsulasSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20)
});
