import { Router } from "express";
import {
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "../controllers/usuarios.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// Solo administradores pueden listar todos los usuarios
router.get("/", requireAuth, requireRole("administrador"), listarUsuarios);
// Crear usuario (admin) - registro público debería ir por /api/auth/register
router.post("/", requireAuth, requireRole("administrador"), crearUsuario);
// Operaciones sobre el propio usuario o admin
router.get("/:id", requireAuth, obtenerUsuario);
router.put("/:id", requireAuth, actualizarUsuario);
router.delete("/:id", requireAuth, requireRole("administrador"), eliminarUsuario);

export default router;
