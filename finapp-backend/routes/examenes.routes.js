import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { ensureOwnerOrAdmin } from "../middleware/ownership.js";
import { validate, validateParams, validateQuery } from "../middleware/validate.js";
import { crearExamenSchema, usuarioIdParamSchema, examenIdParamSchema, generarExamenQuerySchema } from "../validators/examenes.validators.js";
import { generarExamen, crearExamen, listarExamenes, obtenerExamen, eliminarExamen } from "../controllers/examenes.controller.js";

const router = Router();

// Generar preguntas para examen (usuario/admin)
router.get("/generar", requireAuth, validateQuery(generarExamenQuerySchema), generarExamen);

// CRUD de exámenes del usuario
router.post("/", requireAuth, validate(crearExamenSchema), crearExamen);
router.get("/usuario/:usuarioId", requireAuth, validateParams(usuarioIdParamSchema), ensureOwnerOrAdmin(r => r.params.usuarioId), listarExamenes);
router.get("/:id", requireAuth, validateParams(examenIdParamSchema), obtenerExamen);
router.delete("/:id", requireAuth, validateParams(examenIdParamSchema), eliminarExamen);

export default router;
