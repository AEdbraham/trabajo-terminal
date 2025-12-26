import Joi from 'joi';

export const registerSchema = Joi.object({
  nombre: Joi.string().min(2).max(80).required(),
  correo: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

export const loginSchema = Joi.object({
  correo: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const logoutSchema = Joi.object({
  refreshToken: Joi.string().optional(),
});
