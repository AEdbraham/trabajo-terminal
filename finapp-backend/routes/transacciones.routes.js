import { Router } from "express";
import {
  crearTransaccion,
  listarPorUsuario,
  obtenerTransaccion,
  actualizarTransaccion,
  eliminarTransaccion,
} from "../controllers/transacciones.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate, validateQuery, validateParams } from "../middleware/validate.js";
import { crearTransaccionSchema, actualizarTransaccionSchema, listarTransaccionesQuerySchema, usuarioIdParamSchema, transaccionIdParamSchema } from "../validators/transacciones.validators.js";
import { ensureOwnerOrAdmin } from "../middleware/ownership.js";

const router = Router();

router.post("/", requireAuth, validate(crearTransaccionSchema), crearTransaccion);
router.get("/usuario/:usuarioId", requireAuth, validateParams(usuarioIdParamSchema), validateQuery(listarTransaccionesQuerySchema), ensureOwnerOrAdmin(r => r.params.usuarioId), listarPorUsuario);
router.get("/:id", requireAuth, validateParams(transaccionIdParamSchema), obtenerTransaccion);
router.put("/:id", requireAuth, validateParams(transaccionIdParamSchema), validate(actualizarTransaccionSchema), actualizarTransaccion);
router.delete("/:id", requireAuth, validateParams(transaccionIdParamSchema), eliminarTransaccion);

export default router;
