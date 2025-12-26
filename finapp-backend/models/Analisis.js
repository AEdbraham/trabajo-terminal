import mongoose from "mongoose";

const analisisSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    periodo: {
        mes: Number,
        año: Number,
    },
    resumen: {
        ingresosTotales: Number,
        egresosTotales: Number,
        ahorro: Number,
        dti: Number,
    },
    comparativo: {
        variacionMensual: Number,
        vsPresupuesto: Number,
    },
    tendencias: {
        gastoPromedio: Number,
        categoriaPrincipal: String,
    },
    fechaAnalisis: { type: Date, default: Date.now },
});

export default mongoose.model("Analisis", analisisSchema);
