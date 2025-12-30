import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import usuarioRoutes from "./routes/usuarios.routes.js";
import transaccionRoutes from "./routes/transacciones.routes.js";
import authRoutes from "./routes/auth.routes.js";
import categoriaRoutes from "./routes/categorias.routes.js";
import contenidoPublicRoutes from "./routes/contenido.public.routes.js";
import contenidoAdminRoutes from "./routes/contenido.admin.routes.js";
import recomendacionesRoutes from "./routes/recomendaciones.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import metasRoutes from "./routes/metas.routes.js";
import preguntasRoutes from "./routes/preguntas.routes.js";
import examenesRoutes from "./routes/examenes.routes.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a DB solo una vez (para pruebas podemos mockear si quisiéramos)
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/transacciones", transaccionRoutes);
app.use("/api/categories", categoriaRoutes);
app.use("/api/education", contenidoPublicRoutes);
app.use("/api/admin/content", contenidoAdminRoutes);
app.use("/api/recommendations", recomendacionesRoutes); 
app.use("/api/analytics", analyticsRoutes);
app.use("/api/metas", metasRoutes);
app.use("/api/preguntas", preguntasRoutes);
app.use("/api/examenes", examenesRoutes);

// Swagger UI
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const openapiPath = path.join(__dirname, "docs", "openapi.json");
  if (fs.existsSync(openapiPath)) {
    const openapiDoc = JSON.parse(fs.readFileSync(openapiPath, "utf-8"));
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiDoc));
  }
} catch (e) {
  console.warn("Swagger UI no inicializado:", e?.message);
}

// Manejador de errores
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Error interno del servidor" });
});

export default app;