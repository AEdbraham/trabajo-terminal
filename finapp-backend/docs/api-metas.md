# API - Metas

Requiere autenticación. Propietario o admin para leer/actualizar/eliminar metas.

## Modelo Meta (resumen)
- `usuario`: ObjectId (propietario)
- `tipo`: `presupuesto-mensual | ahorro | deuda`
- `montoObjetivo`: número > 0
- `montoActual`: número (puede quedar como referencia, el progreso también calcula dinámico)
- `fechaLimite`: fecha opcional
- `mes`, `año`: requeridos cuando `tipo = presupuesto-mensual`
- Restricción: índice parcial único por `(usuario, tipo, año, mes)` para `presupuesto-mensual`.

## Endpoints

1) POST /api/metas
- Body (ejemplo presupuesto mensual):
```
{
  "tipo": "presupuesto-mensual",
  "montoObjetivo": 6000,
  "mes": 3,
  "año": 2025
}
```
- Regla: si el usuario no es admin, se fuerza `usuario = req.user.id`.

2) GET /api/metas/usuario/:usuarioId
- Lista metas del usuario (dueño o admin).

3) PATCH /api/metas/:id
- Permite actualizar `descripcion`, `montoObjetivo`, `montoActual`, `fechaLimite`.
- No permite cambiar `tipo`, `usuario`, `mes` o `año`.

4) DELETE /api/metas/:id
- Elimina una meta (dueño o admin).

5) GET /api/metas/:id/progreso
- Calcula progreso sin persistir:
  - `presupuesto-mensual`: suma egresos del mes (`año/mes` de la meta).
  - `ahorro`: ingresos etiquetados `"ahorro"` menos egresos etiquetados `"ahorro"`.
  - `deuda`: suma egresos etiquetados `"pago-deuda"`.
- Respuesta:
```
{
  metaId, tipo, usuario, periodo?,
  montoObjetivo, montoActual, restante, porcentaje, diasRestantes?
}
```

## Notas y buenas prácticas
- Para el progreso de ahorro y deuda, etiqueta tus transacciones con `"ahorro"` y `"pago-deuda"` respectivamente.
- Para presupuestos mensuales, crea una meta por mes/año. El índice evita duplicados.
- Si tenías metas antiguas sin `tipo`, actualízalas para compatibilidad.
