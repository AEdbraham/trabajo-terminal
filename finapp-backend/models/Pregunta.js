import mongoose from "mongoose";

const respuestaSchema = new mongoose.Schema({
  inciso: { type: String, enum: ["a", "b", "c", "d"], required: true },
  texto: { type: String, required: true },
  correcta: { type: Boolean, required: true },
}, { _id: false });

const preguntaSchema = new mongoose.Schema({
  tipo: { type: String, enum: ["conocimiento", "percepcion"], required: true },
  tema: { type: String, enum: ["ahorro", "inversion", "credito", "control-gastos", "general"], required: true },
  nivel: { type: String, enum: ["basico", "intermedio", "avanzado"], required: true },
  dimension: { type: String },
  pregunta: { type: String, required: true },
  respuestas: { type: [respuestaSchema], validate: [(arr) => arr && arr.length >= 2, 'Debe tener al menos 2 respuestas'] },
  estado: { type: String, enum: ["activa", "inactiva"], default: "activa" },
  fechaCreacion: { type: Date, default: Date.now },
});

// Evitar duplicados por texto+tema+nivel+tipo
preguntaSchema.index({ pregunta: 1, tema: 1, nivel: 1, tipo: 1 }, { unique: true });
// Búsqueda de texto en campo pregunta
preguntaSchema.index({ pregunta: 'text' });

export default mongoose.model("Pregunta", preguntaSchema);
