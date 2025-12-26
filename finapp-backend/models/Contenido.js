import mongoose from "mongoose";

const contenidoSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    cuerpo: { type: String },
    categoria: { type: String }, // categoría general (ej. "ahorro", "crédito")
    nivel: { type: String, enum: ["básico", "intermedio", "avanzado"], default: "básico" },
    url: { type: String },
    tipo: { type: String, enum: ["concepto", "faq", "capsula", "guia"], default: "concepto" },
    temas: [{ type: String }], // simplificado (slugs) para MVP
    etiquetas: [{ type: String }],
    fuentes: [{ titulo: String, url: String }],
    // Definición de quiz embebida (solo para tipo capsula). No se persisten resultados.
    quiz: {
        preguntas: [{
            enunciado: String,
            opciones: [{ texto: String, correcta: Boolean }],
            explicacionCorrecta: String,
        }],
        intentosMax: { type: Number, default: 3 }
    },
    // Pasos para guías (tipo guia)
    pasos: [{ titulo: String, descripcion: String, duracionMinutos: Number }],
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    fechaCreacion: { type: Date, default: Date.now },
});

contenidoSchema.index({ titulo: 'text', cuerpo: 'text' });

export default mongoose.model("Contenido", contenidoSchema);
