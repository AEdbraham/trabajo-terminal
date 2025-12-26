import mongoose from "mongoose";

const recomendacionSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    fechaGeneracion: { type: Date, default: Date.now },
    tipo: { type: String, enum: ["ahorro", "inversion", "credito"], required: true },
    reglaAplicada: { type: String, index: true },
    mensaje: String,
    prioridad: { type: String, enum: ["alta", "media", "baja"], default: "media" },
    estado: { type: String, enum: ["nueva", "aplicada", "caducada", "rechazada"], default: "nueva" },
    razones: [String],
    puntuacion: { type: Number, min: 0, max: 100 },
    caducidad: Date,
    segmentoPerfil: String,
    insights: { type: Object },
    origen: { type: String, default: 'motor_reglas_v1' },
    versionReglas: { type: String, default: 'v1' },
});

// Evitar duplicados vigentes por regla+usuario (estado nueva)
recomendacionSchema.index({ usuarioId: 1, reglaAplicada: 1, estado: 1 });

export default mongoose.model("Recomendacion", recomendacionSchema);

