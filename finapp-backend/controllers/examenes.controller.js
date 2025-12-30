import Examen from "../models/Examen.js";
import Pregunta from "../models/Pregunta.js";
import asyncHandler from "../utils/asyncHandler.js";

function calcularPuntuacion(preguntas, respuestasSeleccionadas) {
  const mapaPreguntas = new Map(preguntas.map(p => [String(p._id), p]));
  let correctas = 0;
  const detalle = respuestasSeleccionadas.map(r => {
    const p = mapaPreguntas.get(String(r.preguntaID));
    if (!p) return { preguntaID: r.preguntaID, respuestaSeleccionada: r.respuestaSeleccionada, esCorrecta: false };
    const correcta = p.respuestas.find(x => x.correcta);
    const esCorrecta = !!correcta && correcta.inciso === r.respuestaSeleccionada;
    if (esCorrecta) correctas += 1;
    return { preguntaID: r.preguntaID, respuestaSeleccionada: r.respuestaSeleccionada, esCorrecta };
  });
  const puntuacion = preguntas.length ? Math.round((correctas / preguntas.length) * 100) : 0;
  return { detalle, puntuacion };
}

export const generarExamen = asyncHandler(async (req, res) => {
  const { nivel = 'basico', temas = 'ahorro,inversion,credito', limite = 10 } = req.query;
  const temasArr = String(temas).split(',').map(t => t.trim()).filter(Boolean);
  const preguntas = await Pregunta.aggregate([
    { $match: { nivel, tema: { $in: temasArr }, estado: 'activa' } },
    { $sample: { size: Number(limite) } }
  ]);
  res.json({ preguntas });
});

export const crearExamen = asyncHandler(async (req, res) => {
  const { tipo, tema, nivel, usuarioID, preguntas, puntuacionMinimaRequerida } = req.body;
  const preguntasIds = (preguntas || []).map(p => p.preguntaID);
  const preguntasDocs = await Pregunta.find({ _id: { $in: preguntasIds } });
  const { detalle, puntuacion } = calcularPuntuacion(preguntasDocs, preguntas || []);
  const examen = await Examen.create({
    tipo,
    tema,
    nivel,
    usuarioID,
    preguntas: detalle,
    puntuacion,
    puntuacionMinimaRequerida: puntuacionMinimaRequerida || 0,
  });
  res.status(201).json(examen);
});

export const listarExamenes = asyncHandler(async (req, res) => {
  const { usuarioId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [total, items] = await Promise.all([
    Examen.countDocuments({ usuarioID: usuarioId }),
    Examen.find({ usuarioID: usuarioId }).sort({ fecha: -1 }).skip(skip).limit(Number(limit))
  ]);
  res.json({ data: items, meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) || 1 } });
});

export const obtenerExamen = asyncHandler(async (req, res) => {
  const item = await Examen.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Examen no encontrado" });
  res.json(item);
});

export const eliminarExamen = asyncHandler(async (req, res) => {
  const item = await Examen.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Examen no encontrado" });
  res.status(204).send();
});
