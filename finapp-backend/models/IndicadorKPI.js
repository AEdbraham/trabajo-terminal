import mongoose from "mongoose";

const indicadorKpiSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    fechaCalculo: { type: Date, default: Date.now },
    ingresos: Number,
    egresos: Number,
    ahorro: Number,
    inversiones: Number,
    endeudamiento: Number,
    frecuenciaRegistro: Number,
    tendenciaActual: { type: String, enum: ["positiva", "negativa", "estable"], default: "estable" },
});

export default mongoose.model("IndicadorKPI", indicadorKpiSchema);
