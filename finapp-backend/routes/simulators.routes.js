import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate, validateParams, validateQuery } from "../middleware/validate.js";
import { simuladorParamSchema, simuladorWithIdParamSchema, createEntryBaseSchema, listEntriesQuerySchema } from "../validators/simulators.validators.js";
import { createEntry, listEntries, getEntry, deleteEntry } from "../controllers/simulators.controller.js";

const router = Router();

// Crear entrada (usuario o nube; nube requiere admin, validado en controlador)
router.post("/:simulador/entries", requireAuth, validateParams(simuladorParamSchema), validate(createEntryBaseSchema), createEntry);

// Listar entradas (scope=user|cloud|all)
router.get("/:simulador/entries", requireAuth, validateParams(simuladorParamSchema), validateQuery(listEntriesQuerySchema), listEntries);

// Obtener entrada por ID
router.get("/:simulador/entries/:id", requireAuth, validateParams(simuladorWithIdParamSchema), getEntry);

// Eliminar entrada por ID
router.delete("/:simulador/entries/:id", requireAuth, validateParams(simuladorWithIdParamSchema), deleteEntry);

export default router;
