import mongoose from "mongoose";

const simulatorEntrySchema = new mongoose.Schema({
  simulador: {
    type: String,
    enum: [
      "savings",
      "compound",
      "bonds",
      "credit-card",
      "loan",
      "debt-payoff"
    ],
    required: true
  },
  tipo: { type: String, enum: ["usuario", "nube"], required: true },
  usuarioID: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  input: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Índices para consultas comunes
simulatorEntrySchema.index({ simulador: 1, tipo: 1, usuarioID: 1, createdAt: -1 });

export default mongoose.model("SimulatorEntry", simulatorEntrySchema);
