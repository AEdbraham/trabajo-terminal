import { Router } from "express";
import {
  listarCapsulas,
  obtenerCapsula,
  crearContenido,
  actualizarContenido,
  eliminarContenido,
} from "../controllers/contenido.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// Público autenticado: educación (prefijo se montará como /api/education)
router.get("/capsules", requireAuth, listarCapsulas);
router.get("/capsules/:id", requireAuth, obtenerCapsula);

// Admin: gestión de contenido (prefijo se montará como /api/admin/content)
router.post("/", requireAuth, requireRole("administrador"), crearContenido);
router.put("/:id", requireAuth, requireRole("administrador"), actualizarContenido);
router.delete("/:id", requireAuth, requireRole("administrador"), eliminarContenido);

export default router;
