import mongoose from "mongoose";

const categoriaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: String,
    tipo: { type: String, enum: ["ingreso", "egreso", "mixto"], default: "mixto" },
    subcategorias: [String],
    icono: String,
});

// Evita duplicados por nombre+tipo y permite re-ejecutar la semilla de forma idempotente
categoriaSchema.index({ nombre: 1, tipo: 1 }, { unique: true });

export default mongoose.model("Categoria", categoriaSchema);
