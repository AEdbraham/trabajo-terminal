# API - Analytics

Requiere autenticación (`Authorization: Bearer <token>`). Roles:
- Usuario: puede consultar sus propios datos.
- Administrador: puede consultar cualquiera pasando `usuarioId` cuando aplique.

## Parámetros comunes
- `from`, `to`: fechas ISO 8601. Inclusivas.
- `usuarioId`: solo para admin.

## Usuario

1) GET /api/analytics/usuario/resumen
- Query: `from`, `to`, `usuarioId?`
- Respuesta: `{ ingresos, egresos, ahorro }`

2) GET /api/analytics/usuario/serie
- Query: `from`, `to`, `usuarioId?`
- Respuesta: `{ serie: [ { año, mes, ingresos, egresos, ahorro } ] }`

3) GET /api/analytics/usuario/composicion
- Query: `from`, `to`, `usuarioId?`, `top=5`
- Respuesta: `{ totalEgresos, items: [ { categoriaId, nombre, total, porcentaje } ], otros }`

4) GET /api/analytics/usuario/racha
- Query: `from`, `to`, `usuarioId?`
- Respuesta: `{ rachaMaxima }`

5) GET /api/analytics/usuario/dti
- Query: `from`, `to`, `usuarioId?`
- Respuesta: `{ dti }` (placeholder: egresos/ingresos)

6) GET /api/analytics/usuario/variacion
- Query: `año`, `mes`, `usuarioId?`, `allowZeroBase?=false`, `presupuesto?`
- Presupuesto: se toma de Meta tipo `presupuesto-mensual` (año/mes). Si no existe, se puede pasar `presupuesto` en la query.
- Respuesta:
```
{
  periodo: { año, mes },
  mesAnterior: { año, mes },
  actual: { ingresos, egresos, ahorro },
  anterior: { ingresos, egresos, ahorro },
  variacionIngresos, variacionEgresos, variacionAhorro,
  vsPresupuestoEgresos
}
```

## Admin

1) GET /api/analytics/dashboard
- Últimos KPIs calculados guardados (si aplica).

2) GET /api/analytics/kpis
- Último KPI disponible (si aplica).

3) GET /api/analytics/admin/cohortes
- Query: `from` (req), `to` (req)
- Respuesta: `{ periodo: { from, to }, cohorts: [ { año, mes, usuarios, activosPeriodo, tasaActividad } ], totales }`

4) GET /api/analytics/admin/segmentacion
- Query: `from` (req), `to` (req)
- Respuesta: `{ periodo: { from, to }, grupos: [ { incomeTier, usuarios, ahorroRatePromedio } ], detalles: [ { usuarioId, ingresosPeriodo, egresosPeriodo, ahorroPeriodo, ingresoReferencia, ahorroRate, incomeTier } ] }`

## Ejemplos
- Resumen: `/api/analytics/usuario/resumen?from=2025-02-01&to=2025-02-28`
- Serie: `/api/analytics/usuario/serie?from=2025-01-01&to=2025-03-31`
- Variación: `/api/analytics/usuario/variacion?año=2025&mes=3&presupuesto=6000`
- Cohortes (admin): `/api/analytics/admin/cohortes?from=2025-01-01&to=2025-03-31`
