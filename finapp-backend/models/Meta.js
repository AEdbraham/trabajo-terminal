import mongoose from "mongoose";

const metaSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    tipo: { type: String, enum: ["presupuesto-mensual", "ahorro", "deuda"], required: true },
    descripcion: { type: String },
    montoObjetivo: { type: Number, required: true },
    montoActual: { type: Number, default: 0 },
    fechaLimite: { type: Date },
    // Solo aplica para tipo "presupuesto-mensual"
    mes: { type: Number, min: 1, max: 12 },
    año: { type: Number, min: 2000, max: 2100 },
    estado: { type: String, enum: ["activa", "completada", "vencida"], default: "activa" },
});

// Índice parcial para evitar duplicar presupuesto mensual del mismo mes/año por usuario
metaSchema.index(
    { usuario: 1, tipo: 1, año: 1, mes: 1 },
    { unique: true, partialFilterExpression: { tipo: "presupuesto-mensual" } }
);

metaSchema.pre("save", function (next) {
    if (this.montoActual >= this.montoObjetivo) {
        this.estado = "completada";
    } else if (this.fechaLimite && this.fechaLimite < new Date()) {
        this.estado = "vencida";
    }
    next();
});


export default mongoose.model("Meta", metaSchema);
