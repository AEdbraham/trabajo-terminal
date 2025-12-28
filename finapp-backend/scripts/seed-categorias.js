import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import connectDB from "../config/database.js";
import Categoria from "../models/Categoria.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    await connectDB();

    const seedPath = path.join(__dirname, "categorias.seed.json");
    const raw = fs.readFileSync(seedPath, "utf-8");
    const data = JSON.parse(raw);

    const upserts = [];

    const insertGroup = async (items, tipo) => {
      for (const item of items) {
        const nombre = item.nombre.trim();
        const subcategorias = (item.subcategorias || []).map((s) => s.trim());
        upserts.push(
          Categoria.updateOne(
            { nombre, tipo },
            { $set: { descripcion: item.descripcion || "", subcategorias, icono: item.icono || null } },
            { upsert: true }
          )
        );
      }
    };

    await insertGroup(data.egresos || [], "egreso");
    await insertGroup(data.ingresos || [], "ingreso");

    const res = await Promise.allSettled(upserts);
    const ok = res.filter((r) => r.status === "fulfilled").length;
    const fail = res.length - ok;
    console.log(`✅ Semilla categorías completada: ${ok} upserts, ${fail} fallas`);
  } catch (err) {
    console.error("❌ Error en semilla de categorías:", err?.message || err);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

run();
