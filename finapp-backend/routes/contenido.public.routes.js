import { Router } from "express";
import { listarCapsulas, obtenerCapsula, buscarContenido, toggleFeedback } from "../controllers/contenido.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validateQuery } from "../middleware/validate.js";
import { searchContenidoSchema, paginationCapsulasSchema } from "../validators/contenido.validators.js";

const router = Router();

// Rutas públicas autenticadas (educación)
router.get("/capsules", requireAuth, validateQuery(paginationCapsulasSchema), listarCapsulas);
router.get("/capsules/:id", requireAuth, obtenerCapsula);
router.get("/search", requireAuth, validateQuery(searchContenidoSchema), buscarContenido);
router.post("/:id/like", requireAuth, toggleFeedback); // usar ?tipo=like|dislike

export default router;
