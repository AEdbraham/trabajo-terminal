import { Router } from "express";
import { listarPorUsuario, generar } from "../controllers/recomendaciones.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { generarRecomendacionSchema } from "../validators/recomendaciones.validators.js";

const router = Router();

router.get("/:usuarioId", requireAuth, listarPorUsuario);
router.post("/generar", requireAuth, validate(generarRecomendacionSchema), generar);

export default router;
