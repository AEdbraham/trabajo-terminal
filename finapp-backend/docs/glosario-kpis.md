# Glosario de KPIs

Este documento define los indicadores clave utilizados en la API.

## Alcance y filtros
- Rango de fechas: `from` y `to` (ISO 8601). En analytics general, `from` y `to` son inclusivos. Cuando se agrupan por mes se usa `[inicioMes, inicioMesSiguiente)`.
- Usuario: Por defecto el usuario autenticado. Admin puede consultar otros usuarios vía `usuarioId`.

## Definiciones
- IngresosTotales: Suma de `monto` con `tipo = ingreso` en el rango.
- EgresosTotales: Suma de `monto` con `tipo = egreso` en el rango.
- Ahorro: `IngresosTotales - EgresosTotales` (si negativo, indica déficit).
- Composición por categoría: Para egresos, porcentaje por categoría = `egresosCategoria / egresosTotales`. Por defecto se devuelve Top-N y el resto como `otros`.
- Variación Mensual: `(ValorMesActual - ValorMesAnterior) / ValorMesAnterior`. Si la base anterior es 0, se devuelve `null` salvo que `allowZeroBase=true` (ver endpoint), en cuyo caso se usa un epsilon para evitar división por cero.
- VsPresupuesto (egresos): `(EgresosMesActual - Presupuesto) / Presupuesto`. El presupuesto puede provenir de una Meta de tipo `presupuesto-mensual` o de un parámetro `presupuesto` en la consulta.
- DTI (placeholder): `EgresosTotales / IngresosTotales` del rango. A falta de clasificación específica de deuda, se usa egresos totales.
- Racha de registro: Máximo número de días consecutivos dentro del rango con ≥1 transacción registrada.

## Notas
- DTI y clasificación de deuda pueden refinarse en futuras versiones con categorías específicas.
- El cálculo de variación mensual considera meses naturales (año/mes) y compara con el mes inmediatamente anterior.
- Redondeo y formato de porcentajes quedan a cargo del consumidor del API.
