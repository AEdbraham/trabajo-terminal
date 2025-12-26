import Categoria from "../models/Categoria.js";
import asyncHandler from "../utils/asyncHandler.js";

export const listarCategorias = asyncHandler(async (_req, res) => {
  const categorias = await Categoria.find();
  res.json(categorias);
});
