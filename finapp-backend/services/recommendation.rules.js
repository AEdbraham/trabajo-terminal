// Catálogo básico de reglas v1
export const RULES_V1 = [
  {
    id: 'reg_ahorro_basico',
    tipo: 'ahorro',
    segmentoTarget: ['ahorro_nulo','principiante','alto_endeudamiento'],
    condiciones: [
      { metric: 'ratioAhorro', op: '<', value: 0.05 },
      { metric: 'ingresosMensualesPromedio', op: '>', value: 0 }
    ],
    mensaje: 'Empieza a apartar al menos el 5% de tus ingresos este mes.',
    prioridadBase: 'alta',
    caducidadDias: 30,
    razonesTemplate: [
      'Tu ratio de ahorro actual es {{ratioAhorro}} (<5%)'
    ],
    puntuacion: (m) => Math.min(100, (0.05 - m.ratioAhorro) * 1000)
  },
  {
    id: 'reg_frecuencia_baja',
    tipo: 'ahorro',
    segmentoTarget: ['principiante'],
    condiciones: [
      { metric: 'transacciones30Dias', op: '<', value: 5 }
    ],
    mensaje: 'Incrementa tu frecuencia: intenta registrar gastos diariamente.',
    prioridadBase: 'media',
    caducidadDias: 14,
    razonesTemplate: [
      'Sólo has registrado {{transacciones30Dias}} transacciones en los últimos 30 días'
    ],
    puntuacion: (m) => Math.min(60, (5 - m.transacciones30Dias) * 10)
  },
  {
    id: 'reg_dti_alto',
    tipo: 'crédito',
    segmentoTarget: ['alto_endeudamiento'],
    condiciones: [
      { metric: 'dti', op: '>=', value: 0.4 }
    ],
    mensaje: 'Reduce tu relación deuda/ingreso y evita nuevos créditos este mes.',
    prioridadBase: 'alta',
    caducidadDias: 30,
    razonesTemplate: [
      'Tu DTI actual es {{dti}} (>=0.40)'
    ],
    puntuacion: (m) => Math.min(100, (m.dti - 0.4) * 200)
  }
];
