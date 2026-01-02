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
    tipo: 'credito',
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
  },
  {
    id: 'reg_tarjeta_utilizacion_alta',
    tipo: 'credito',
    segmentoTarget: ['principiante','estable','alto_endeudamiento','ahorro_nulo'],
    condiciones: [
      { metric: 'cardSpendRatio', op: '>=', value: 0.3 },
      { metric: 'ingresosMensualesPromedio', op: '>', value: 0 }
    ],
    mensaje: 'Reduce el uso de tarjeta de crédito por debajo del 30% de tus ingresos.',
    prioridadBase: 'media',
    caducidadDias: 21,
    razonesTemplate: [
      'Tu uso de tarjeta sobre ingresos es {{cardSpendRatio}} (>=0.30)'
    ],
    puntuacion: (m) => Math.min(80, (m.cardSpendRatio - 0.3) * 200)
  },
  {
    id: 'reg_intereses_altos',
    tipo: 'credito',
    segmentoTarget: ['principiante','estable','alto_endeudamiento','ahorro_nulo'],
    condiciones: [
      { metric: 'interestFees30', op: '>=', value: 100 }
    ],
    mensaje: 'Revisa intereses y comisiones: están impactando tus finanzas este mes.',
    prioridadBase: 'media',
    caducidadDias: 30,
    razonesTemplate: [
      'Intereses/comisiones acumuladas en 30 días: {{interestFees30}}'
    ],
    puntuacion: (m) => Math.min(70, m.interestFees30)
  },
  {
    id: 'reg_dti_en_aumento',
    tipo: 'credito',
    segmentoTarget: ['principiante','estable','alto_endeudamiento','ahorro_nulo'],
    condiciones: [
      { metric: 'dtiDelta', op: '>=', value: 0.1 }
    ],
    mensaje: 'Tu DTI aumentó significativamente respecto al periodo anterior; toma medidas.',
    prioridadBase: 'alta',
    caducidadDias: 30,
    razonesTemplate: [
      'DTI previo {{dtiPrev}}, actual {{dti}}, delta {{dtiDelta}} (>=0.10)'
    ],
    puntuacion: (m) => Math.min(90, (m.dtiDelta) * 300)
  },
  {
    id: 'reg_concentracion_pagos_deuda',
    tipo: 'credito',
    segmentoTarget: ['principiante','estable','alto_endeudamiento','ahorro_nulo'],
    condiciones: [
      { metric: 'debtPaymentsCount30', op: '>=', value: 3 }
    ],
    mensaje: 'Alta concentración de pagos de deuda: considera consolidación o reestructuración.',
    prioridadBase: 'media',
    caducidadDias: 30,
    razonesTemplate: [
      'Pagos de deuda en 30 días: {{debtPaymentsCount30}} (>=3)'
    ],
    puntuacion: (m) => Math.min(75, m.debtPaymentsCount30 * 10)
  },
];
