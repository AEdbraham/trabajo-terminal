import mongoose from "mongoose";

const transaccionSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    tipo: { type: String, enum: ["ingreso", "egreso"], required: true },
    monto: { type: Number, required: true },
    fecha: { type: Date, required: true },
    categoriaId: { type: mongoose.Schema.Types.ObjectId, ref: "Categoria" },
    subcategoria: String,
    metodoPago: String,
    notas: String,
    etiquetas: [String],
    esTransferenciaInterna: { type: Boolean, default: false },
    origen: { type: String, enum: ["manual", "csv"], default: "manual" },
    archivoCSV: String,
    fechaRegistro: { type: Date, default: Date.now },
});

transaccionSchema.index({ usuarioId: 1, fecha: -1 });

export default mongoose.model("Transaccion", transaccionSchema);

