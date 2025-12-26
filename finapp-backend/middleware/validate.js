import Joi from 'joi';

// Uso: validate(schema) -> middleware; si falla responde 400 con detalles
export const validate = (schema) => {
  return (req, res, next) => {
    const data = req.body;
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        message: 'Validación fallida',
        details: error.details.map(d => ({ message: d.message, path: d.path }))
      });
    }
    req.body = value; // normalizar
    next();
  };
};

// Helper para validar params con un schema Joi
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: 'Validación de params fallida',
        details: error.details.map(d => ({ message: d.message, path: d.path }))
      });
    }
    // Express 5 puede definir getters; mutar en lugar de reasignar
    Object.keys(req.params).forEach(k => { delete req.params[k]; });
    Object.assign(req.params, value);
    next();
  };
};

// Helper para query
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        message: 'Validación de query fallida',
        details: error.details.map(d => ({ message: d.message, path: d.path }))
      });
    }
    // Evitar sobrescribir descriptor con getter; limpiar y copiar valores permitidos
    Object.keys(req.query).forEach(k => { delete req.query[k]; });
    Object.assign(req.query, value);
    next();
  };
};
