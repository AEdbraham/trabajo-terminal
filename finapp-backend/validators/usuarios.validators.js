import Joi from 'joi';

export const usuarioIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

export const updateNotificationPrefsSchema = Joi.object({
  notificaciones: Joi.boolean(),
  notifyWeeklyTips: Joi.boolean(),
  notifyBudgetAlerts: Joi.boolean(),
  notifyGoalReminders: Joi.boolean()
}).min(1);
