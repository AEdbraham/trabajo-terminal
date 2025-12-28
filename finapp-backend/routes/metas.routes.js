import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { crearMetaSchema, actualizarMetaSchema } from "../validators/metas.validators.js";
import { crearMeta, listarMetas, actualizarMeta, eliminarMeta, progresoMeta, contarMetasActivas } from "../controllers/metas.controller.js";
import { ensureOwnerOrAdmin } from "../middleware/ownership.js";

const router = Router();

// Crear meta (usuario autenticado). Si es rol usuario, fuerza asignación a su propio id.
router.post("/", requireAuth, validate(crearMetaSchema), crearMeta);

// Listar metas de un usuario (dueño o admin)
router.get("/usuario/:usuarioId", requireAuth, ensureOwnerOrAdmin((req) => req.params.usuarioId), listarMetas);

// Contar metas activas de un usuario (dueño o admin)
router.get("/usuario/:usuarioId/activas/count", requireAuth, ensureOwnerOrAdmin((req) => req.params.usuarioId), contarMetasActivas);

// Progreso de una meta (dueño o admin)
router.get("/:id/progreso", requireAuth, progresoMeta);

// Actualizar y eliminar (verificación de ownership dentro del controlador)
router.patch("/:id", requireAuth, validate(actualizarMetaSchema), actualizarMeta);
router.delete("/:id", requireAuth, eliminarMeta);

export default router;
