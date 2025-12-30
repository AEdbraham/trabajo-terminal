import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { crearPreguntaSchema, actualizarPreguntaSchema, buscarPreguntasQuerySchema, importPreguntasSchema, preguntaIdParamSchema } from "../validators/preguntas.validators.js";
import { crearPregunta, listarPreguntas, obtenerPregunta, actualizarPregunta, eliminarPregunta, exportPreguntas, importPreguntas, sugerirPreguntas } from "../controllers/preguntas.controller.js";
import { validate, validateQuery, validateParams } from "../middleware/validate.js";

const router = Router();

// Admin: import/export (colocar antes de rutas con :id para evitar colisiones)
router.get("/export", requireAuth, requireRole("administrador"), validateQuery(buscarPreguntasQuerySchema), exportPreguntas);
router.post("/import", requireAuth, requireRole("administrador"), validate(importPreguntasSchema), importPreguntas);

// Usuario: sugerencias de preguntas para armado de examen
router.get("/sugerencias", requireAuth, sugerirPreguntas);

// Admin: CRUD preguntas
router.post("/", requireAuth, requireRole("administrador"), validate(crearPreguntaSchema), crearPregunta);
router.get("/", requireAuth, requireRole("administrador"), validateQuery(buscarPreguntasQuerySchema), listarPreguntas);
router.get("/:id", requireAuth, requireRole("administrador"), validateParams(preguntaIdParamSchema), obtenerPregunta);
router.patch("/:id", requireAuth, requireRole("administrador"), validateParams(preguntaIdParamSchema), validate(actualizarPreguntaSchema), actualizarPregunta);
router.delete("/:id", requireAuth, requireRole("administrador"), validateParams(preguntaIdParamSchema), eliminarPregunta);

export default router;
