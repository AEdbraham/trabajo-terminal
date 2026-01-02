import { Router } from "express";
import {
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
  getNotificationPrefs,
  updateNotificationPrefs,
} from "../controllers/usuarios.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate, validateParams } from "../middleware/validate.js";
import { ensureOwnerOrAdmin } from "../middleware/ownership.js";
import { usuarioIdParamSchema, updateNotificationPrefsSchema } from "../validators/usuarios.validators.js";

const router = Router();

// Solo administradores pueden listar todos los usuarios
router.get("/", requireAuth, requireRole("administrador"), listarUsuarios);
// Crear usuario (admin) - registro público debería ir por /api/auth/register
router.post("/", requireAuth, requireRole("administrador"), crearUsuario);
// Operaciones sobre el propio usuario o admin
router.get("/:id", requireAuth, obtenerUsuario);
router.put("/:id", requireAuth, actualizarUsuario);
router.delete("/:id", requireAuth, requireRole("administrador"), eliminarUsuario);

// Preferencias de notificaciones del usuario (dueño o admin)
router.get(
  "/:id/preferences/notifications",
  requireAuth,
  validateParams(usuarioIdParamSchema),
  ensureOwnerOrAdmin(r => r.params.id),
  getNotificationPrefs
);
router.patch(
  "/:id/preferences/notifications",
  requireAuth,
  validateParams(usuarioIdParamSchema),
  ensureOwnerOrAdmin(r => r.params.id),
  validate(updateNotificationPrefsSchema),
  updateNotificationPrefs
);

export default router;
