import mongoose from 'mongoose';

const feedbackContenidoSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  contenidoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contenido', required: true },
  tipo: { type: String, enum: ['like','dislike'], required: true },
  fecha: { type: Date, default: Date.now }
});

feedbackContenidoSchema.index({ usuarioId: 1, contenidoId: 1 }, { unique: true });

export default mongoose.model('FeedbackContenido', feedbackContenidoSchema);
