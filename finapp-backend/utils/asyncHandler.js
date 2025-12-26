// Pequeño helper para manejar errores en controladores async sin repetir try/catch
export default function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
