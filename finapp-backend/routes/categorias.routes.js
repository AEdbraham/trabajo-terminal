import { Router } from "express";
import { listarCategorias } from "../controllers/categorias.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, listarCategorias);

export default router;
