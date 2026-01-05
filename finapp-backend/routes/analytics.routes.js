import { Router } from "express";
import {
	obtenerDashboard,
	obtenerKPIs,
	serieTemporalUsuario,
	composicionCategoriasUsuario,
	resumenUsuario,
	rachaRegistroUsuario,
	dtiUsuario,
	variacionMensualUsuario,
	cohortesAdmin,
	segmentacionAdmin
} from "../controllers/analytics.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateQuery } from "../middleware/validate.js";
import {
	serieTemporalSchema,
	composicionQuerySchema,
	resumenQuerySchema,
	rachaQuerySchema,
	dtiQuerySchema
} from "../validators/analytics.validators.js";
import { variacionMensualSchema, cohortesAdminSchema, segmentacionAdminSchema, generarKpisAdminSchema } from "../validators/analytics.validators.js";
import { generarKpisUsuario } from "../controllers/analytics.controller.js";

const router = Router();

// Admin existentes
router.get("/dashboard", requireAuth, requireRole("administrador"), obtenerDashboard);
router.get("/kpis", requireAuth, requireRole("administrador"), obtenerKPIs);

// Usuario (acceso propio) y admin (puede pasar usuarioId)
router.get("/usuario/serie", requireAuth, validateQuery(serieTemporalSchema), serieTemporalUsuario);
router.get("/usuario/composicion", requireAuth, validateQuery(composicionQuerySchema), composicionCategoriasUsuario);
router.get("/usuario/resumen", requireAuth, validateQuery(resumenQuerySchema), resumenUsuario);
router.get("/usuario/racha", requireAuth, validateQuery(rachaQuerySchema), rachaRegistroUsuario);
router.get("/usuario/dti", requireAuth, validateQuery(dtiQuerySchema), dtiUsuario);
router.get("/usuario/variacion", requireAuth, validateQuery(variacionMensualSchema), variacionMensualUsuario);
router.get("/admin/cohortes", requireAuth, requireRole("administrador"), validateQuery(cohortesAdminSchema), cohortesAdmin);
router.get("/admin/segmentacion", requireAuth, requireRole("administrador"), validateQuery(segmentacionAdminSchema), segmentacionAdmin);
router.post("/admin/kpis/generar", requireAuth, requireRole("administrador"), validateQuery(generarKpisAdminSchema), generarKpisUsuario);

export default router;
