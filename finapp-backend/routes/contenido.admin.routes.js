import { Router } from "express";
import { crearContenido, actualizarContenido, eliminarContenido, listarCapsulas } from "../controllers/contenido.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { crearContenidoSchema, actualizarContenidoSchema } from "../validators/contenido.validators.js";

const router = Router();

// Opcional: listado para vista de administración
router.get("/", requireAuth, requireRole("administrador"), listarCapsulas);
router.post("/", requireAuth, requireRole("administrador"), validate(crearContenidoSchema), crearContenido);
router.put("/:id", requireAuth, requireRole("administrador"), validate(actualizarContenidoSchema), actualizarContenido);
router.delete("/:id", requireAuth, requireRole("administrador"), eliminarContenido);

export default router;
