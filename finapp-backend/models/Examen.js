import mongoose from "mongoose";

const respuestaExamenSchema = new mongoose.Schema({
  preguntaID: { type: mongoose.Schema.Types.ObjectId, ref: "Pregunta", required: true },
  respuestaSeleccionada: { type: String, enum: ["a", "b", "c", "d"], required: true },
  esCorrecta: { type: Boolean, required: true },
}, { _id: false });

const examenSchema = new mongoose.Schema({
  tipo: { type: String, enum: ["conocimiento", "percepcion"], required: true },
  tema: { type: String, enum: ["ahorro", "inversion", "credito", "control-gastos", "general"], required: true },
  nivel: { type: String, enum: ["basico", "intermedio", "avanzado"], required: true },
  usuarioID: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  preguntas: { type: [respuestaExamenSchema], validate: [(arr) => arr && arr.length >= 1, 'Debe incluir al menos una pregunta'] },
  puntuacion: { type: Number, default: 0 },
  puntuacionMinimaRequerida: { type: Number, default: 0 },
  puntuacionMaximaRequerida: { type: Number, default: 0 },
  fecha: { type: Date, default: Date.now },
});

examenSchema.index({ usuarioID: 1, fecha: -1 });

export default mongoose.model("Examen", examenSchema);
