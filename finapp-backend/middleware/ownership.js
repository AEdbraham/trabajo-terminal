// Middleware para asegurar que el usuario autenticado sea dueño del recurso o admin
export const ensureOwnerOrAdmin = (getTargetUserId) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'No autenticado' });
    const targetUserId = getTargetUserId(req);
    if (req.user.rol === 'administrador') return next();
    if (req.user.id !== targetUserId) {
      return res.status(403).json({ message: 'No autorizado: recurso de otro usuario' });
    }
    next();
  };
};
