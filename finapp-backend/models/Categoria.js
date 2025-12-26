import mongoose from "mongoose";

const categoriaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: String,
    tipo: { type: String, enum: ["ingreso", "egreso", "mixto"], default: "mixto" },
    subcategorias: [String],
    icono: String,
});

export default mongoose.model("Categoria", categoriaSchema);
