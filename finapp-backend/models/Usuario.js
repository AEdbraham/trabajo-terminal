import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ["usuario", "administrador"], default: "usuario" },
    fechaRegistro: { type: Date, default: Date.now },
    perfil: {
        edad: Number,
        ingresosMensuales: Number,
        nivelEndeudamiento: Number,
        nivelEducativo: String,
    },
    preferencias: {
        temasFavoritos: [String],
        notificaciones: { type: Boolean, default: true },
        notifyWeeklyTips: { type: Boolean, default: true },
        notifyBudgetAlerts: { type: Boolean, default: true },
        notifyGoalReminders: { type: Boolean, default: true },
    },
    tokenActualizacion: String,
});

// Hash de contraseña antes de guardar si fue modificada
usuarioSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
        const salt = await bcrypt.genSalt(saltRounds);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Método de instancia para validar contraseña en login
usuarioSchema.methods.validarPassword = function (passwordPlano) {
    return bcrypt.compare(passwordPlano, this.password);
};

// Opcional: ocultar password y __v al serializar
usuarioSchema.set("toJSON", {
    transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
    },
});

export default mongoose.model("Usuario", usuarioSchema);
