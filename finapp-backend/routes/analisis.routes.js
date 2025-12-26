import { Router } from "express";
import { obtenerActual, obtenerHistoricoPorMesAnio, generarAnalisis } from "../controllers/analisis.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { generarAnalisisSchema } from "../validators/analisis.validators.js";

const router = Router();

router.get("/:usuarioId", requireAuth, obtenerActual);
router.get("/:usuarioId/:mes/:anio", requireAuth, obtenerHistoricoPorMesAnio);
router.post("/generar", requireAuth, validate(generarAnalisisSchema), generarAnalisis);

export default router;
