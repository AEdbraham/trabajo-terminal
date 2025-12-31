import Joi from 'joi';

export const simuladorParamSchema = Joi.object({
  simulador: Joi.string().valid('savings','compound','bonds','credit-card','loan','debt-payoff').required(),
});

export const entryIdParamSchema = Joi.object({ id: Joi.string().hex().length(24).required() });

export const simuladorWithIdParamSchema = Joi.object({
  simulador: Joi.string().valid('savings','compound','bonds','credit-card','loan','debt-payoff').required(),
  id: Joi.string().hex().length(24).required(),
});

export const createEntryBaseSchema = Joi.object({
  tipo: Joi.string().valid('usuario','nube').required(),
  input: Joi.object().required(),
});

export const listEntriesQuerySchema = Joi.object({
  scope: Joi.string().valid('user','cloud','all').default('all'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
