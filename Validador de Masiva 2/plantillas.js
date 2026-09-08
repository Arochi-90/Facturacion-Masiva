/* ============================================================================
 * plantillas.js — Firmas de encabezado de cada plantilla de Facturación Masiva
 * El validador detecta la plantilla por mejor coincidencia de encabezados y
 * reporta columnas de más, faltantes, renombradas y fuera de orden.
 * ==========================================================================*/

const PLANTILLAS = [
  { id: "factura", nombre: "Factura",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","Forma de Pago","Condiciones de Pago","Metodo de Pago","Observaciones","ClaveProdServ","Concepto","ClaveUnidad","Unidad","Cantidad","Precio Unitario","Objeto Impuesto","Subtotal del Concepto","IVA del Concepto","Total del Concepto","Pedido","Mail","Facturado","Errores"] },

  { id: "factura_rfc_generico", nombre: "Factura (RFC genérico)",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","Forma de Pago","Condiciones de Pago","Metodo de Pago","Observaciones","ClaveProdServ","Concepto","ClaveUnidad","Unidad","Cantidad","Precio Unitario","Objeto Impuesto","Subtotal del Concepto","Total del Concepto","Pedido","Mail","Facturado","Errores"] },

  { id: "factura_tipo_cambio", nombre: "Factura (Tipo de Cambio)",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","Forma de Pago","Condiciones de Pago","Metodo de Pago","ClaveMoneda","TipoCambio","Observaciones","ClaveProdServ","Concepto","ClaveUnidad","Unidad","Cantidad","Precio Unitario","Objeto Impuesto","Subtotal del Concepto","IVA del Concepto","Total del Concepto","Pedido","Mail","Facturado","Errores"] },

  { id: "factura_descuento", nombre: "Factura con Descuento",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","Forma de Pago","Condiciones de Pago","Metodo de Pago","Observaciones","ClaveProdServ","Concepto","ClaveUnidad","Unidad","Cantidad","Precio Unitario","Objeto Impuesto","Subtotal del Concepto","Descuento del Concepto","IVA del Concepto","Total del Concepto","Pedido","Mail","Facturado","Errores"] },

  { id: "factura_descuento_exento", nombre: "Factura con Descuento IVA Exento",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","Forma de Pago","Condiciones de Pago","Metodo de Pago","Observaciones","ClaveProdServ","Concepto","ClaveUnidad","Unidad","Cantidad","Precio Unitario","Objeto Impuesto","Subtotal del Concepto","Descuento del Concepto","IVA del Concepto","Total del Concepto","Pedido","Mail","Facturado","Errores"] },

  { id: "factura_iva_exento", nombre: "Factura IVA Exento",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","Forma de Pago","Condiciones de Pago","Metodo de Pago","Observaciones","ClaveProdServ","Concepto","ClaveUnidad","Unidad","Cantidad","Precio Unitario","Objeto Impuesto","Subtotal del Concepto","IVA del Concepto","Es IVA Exento","Total del Concepto","Pedido","Mail","Facturado","Errores"] },

  { id: "factura_retencion_iva", nombre: "Factura con Retención de IVA",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","Forma de Pago","Condiciones de Pago","Metodo de Pago","Observaciones","ClaveProdServ","Concepto","ClaveUnidad","Unidad","Cantidad","Precio Unitario","Objeto Impuesto","Subtotal del Concepto","IVA del Concepto","IVA RET Tasa","IVA RET Monto","Total del Concepto","Pedido","Mail","Facturado","Errores"] },

  { id: "factura_ieps", nombre: "Facturación con Descuento IEPS",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","Forma de Pago","Condiciones de Pago","Metodo de Pago","Observaciones","ClaveProdServ","Concepto","ClaveUnidad","Unidad","Cantidad","Precio Unitario","Objeto Impuesto","Subtotal del Concepto","Descuento del Concepto","IVA del Concepto","IEPS Porcentaje","IEPS del Concepto","Total del Concepto","Pedido","Mail","Facturado","Errores"] },

  { id: "factura_no_identificacion", nombre: "Factura No.Identificacion",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","Forma de Pago","Condiciones de Pago","Metodo de Pago","Observaciones","ClaveProdServ","Concepto","No.Identificacion","ClaveUnidad","Unidad","Cantidad","Precio Unitario","Objeto Impuesto","Subtotal del Concepto","IVA del Concepto","Total del Concepto","Pedido","Mail","Facturado","Errores"] },

  { id: "factura_sku_ean", nombre: "Factura con SKU y EAN",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","Forma de Pago","Condiciones de Pago","Metodo de Pago","Observaciones","ClaveProdServ","Concepto","SKU","EAN","ClaveUnidad","Unidad","Cantidad","Precio Unitario","Objeto Impuesto","Subtotal del Concepto","IVA del Concepto","Total del Concepto","Pedido","Mail","Facturado","Errores"] },

  { id: "factura_pedimento", nombre: "Factura No.Pedimento",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","Forma de Pago","Condiciones de Pago","Metodo de Pago","Observaciones","ClaveProdServ","Concepto","No.Identificacion","ClaveUnidad","Unidad","Cantidad","Precio Unitario","Objeto Impuesto","Subtotal del Concepto","IVA del Concepto","Total del Concepto","No.Pedimento","Pedido","Mail","Facturado","Errores"] },

  { id: "factura_predial", nombre: "Factura Cuenta Predial",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","Forma de Pago","Condiciones de Pago","Metodo de Pago","Observaciones","ClaveProdServ","Concepto","CuentaPredial","ClaveUnidad","Unidad","Cantidad","Precio Unitario","Objeto Impuesto","Subtotal del Concepto","IVA del Concepto","Total del Concepto","Pedido","Mail","Facturado","Errores"] },

  { id: "factura_global", nombre: "Factura Global",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","Forma de Pago","Condiciones de Pago","Metodo de Pago","Observaciones","ClaveProdServ","Concepto","ClaveUnidad","Unidad","Cantidad","Precio Unitario","Objeto Impuesto","Subtotal del Concepto","Total del Concepto","Pedido","Periodicidad","Mes","Year","Mail","Facturado","Errores"] },

  { id: "factura_global_iva", nombre: "Factura IVA Global",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","Forma de Pago","Condiciones de Pago","Metodo de Pago","Observaciones","ClaveProdServ","Concepto","ClaveUnidad","Unidad","Cantidad","Precio Unitario","Objeto Impuesto","Subtotal del Concepto","IVA del Concepto","Total del Concepto","Periodicidad","Mes","Year","Pedido","Mail","Facturado","Errores"] },

  { id: "factura_global_8", nombre: "Factura Global Tasa IVA 8%",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","Forma de Pago","Condiciones de Pago","Metodo de Pago","Observaciones","ClaveProdServ","Concepto","ClaveUnidad","Unidad","Cantidad","Precio Unitario","Objeto Impuesto","Subtotal del Concepto","Tasa","IVA del Concepto","Total del Concepto","Pedido","Periodicidad","Mes","Year","Mail","Facturado","Errores"] },

  { id: "factura_global_noid", nombre: "Factura Global (No.Identificacion)",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","Forma de Pago","Condiciones de Pago","Metodo de Pago","Observaciones","ClaveProdServ","Concepto","No.Identificacion","ClaveUnidad","Unidad","Cantidad","Precio Unitario","Objeto Impuesto","Subtotal del Concepto","Total del Concepto","Pedido","Periodicidad","Mes","Year","Mail","Facturado","Errores"] },

  { id: "factura_global_noid_iva", nombre: "Factura Global (No Identificacion, IVA)",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","Forma de Pago","Condiciones de Pago","Metodo de Pago","Observaciones","ClaveProdServ","Concepto","No.Identificacion","ClaveUnidad","Unidad","Cantidad","Precio Unitario","Objeto Impuesto","Subtotal del Concepto","IVA del Concepto","Total del Concepto","Pedido","Periodicidad","Mes","Year","Mail","Facturado","Errores"] },

  { id: "factura_global_tc", nombre: "Factura Global (Tipo de Cambio)",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","Forma de Pago","Condiciones de Pago","Metodo de Pago","ClaveMoneda","TipoCambio","Observaciones","ClaveProdServ","Concepto","ClaveUnidad","Unidad","Cantidad","Precio Unitario","Objeto Impuesto","Subtotal del Concepto","Total del Concepto","Pedido","Periodicidad","Mes","Year","Mail","Facturado","Errores"] },

  { id: "nota_credito", nombre: "Nota de Crédito",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","Forma de Pago","Condiciones de Pago","Metodo de Pago","Observaciones","ClaveProdServ","Concepto","ClaveUnidad","Unidad","Cantidad","Precio Unitario","Objeto Impuesto","Subtotal del Concepto","Total del Concepto","TipoRelacion","UUIDRelacion","Pedido","Mail","Facturado","Errores"] },

  { id: "pago", nombre: "Complemento de Pago",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","FechadePago","FormadePago","Monto","Moneda","FolioFiscal","No.Parcialidad","MonedaRel","MetododePago","ImporteSaldoAnterior","ImportePagado","ObjetoImpuesto","Mail","Facturado","Errores"] },

  { id: "pago_mxn_sencillo", nombre: "Complemento de Pago MXN sencillo",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","FechadePago","FormadePago","Monto","FolioFiscal","No.Parcialidad","MetododePago","ImporteSaldoAnterior","ImportePagado","SaldoInsoluto","ObjetoImpuesto","NombreImpuesto","BaseImpuesto","TasaImpuesto","TotalImpuesto","Mail","Facturado","Errores"] },

  { id: "pago_mxn_rel_usd", nombre: "Complemento de Pago MXN MonedaRel USD",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","FechadePago","FormadePago","Monto","Moneda","FolioFiscal","No.Parcialidad","MonedaRel","EquivalenceDocRel","MetododePago","ImporteSaldoAnterior","ImportePagado","SaldoInsoluto","ObjetoImpuesto","NombreImpuesto","BaseImpuesto","TasaImpuesto","TotalImpuesto","Mail","Facturado","Errores"] },

  { id: "pago_usd_rel_usd", nombre: "Complemento de Pago USD MonedaRel USD",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","FechadePago","FormadePago","Monto","Moneda","TipodeCambio","FolioFiscal","No.Parcialidad","MonedaRel","EquivalenceDocRel","MetododePago","ImporteSaldoAnterior","ImportePagado","SaldoInsoluto","ObjetoImpuesto","NombreImpuesto","BaseImpuesto","TasaImpuesto","TotalImpuesto","Mail","Facturado","Errores"] },

  { id: "pago_iva_exento", nombre: "Complemento de Pagos IVA Exento",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","FechadePago","FormadePago","Monto","Moneda","FolioFiscal","No.Parcialidad","MonedaRel","TipodeCambioRel","MetododePago","ImporteSaldoAnterior","ImportePagado","SaldoInsoluto","ObjetoImpuesto","NombreImpuesto","BaseImpuesto","TasaImpuesto","TotalImpuesto","Mail","Facturado","Errores"] },

  { id: "pago_con_impuesto", nombre: "Complemento de Pagos con Impuesto",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","FechadePago","FormadePago","Monto","Moneda","FolioFiscal","No.Parcialidad","MonedaRel","TipodeCambioRel","MetododePago","ImporteSaldoAnterior","ImportePagado","SaldoInsoluto","ObjetoImpuesto","NombreImpuesto","BaseImpuesto","TasaImpuesto","TotalImpuesto","Mail","Facturado","Errores"] },

  { id: "recibo_pago", nombre: "Recibo de Pago",
    headers: ["Folio","No. Factura","Razon Social","RFC","Fiscal Regime","UsoCFDI","Calle","Colonia","No. Exterior","No. Interior","CP","Municipio","Estado","FechadePago","FormadePago","Monto","Moneda","TipodeCambio","FolioFiscal","No.Parcialidad","MonedaRel","TipodeCambioRel","MetododePago","ImporteSaldoAnterior","ImportePagado","ObjetoImpuesto","Mail","Facturado","Errores"] },

  { id: "ret_intereses", nombre: "Retenciones 2.0 Complemento Intereses",
    headers: ["Folio","Razon_Social","RFC","Nacionalidad","Codigo_Postal","Mes_Ini","Mes_Fin","Ejerc","Monto_Tot_Operacion","Monto_Tot_Grav","Monto_Tot_Exent","Monto_Tot_Ret","Tipo_Pago_Ret1","Impuesto1","Base_Ret1","Monto_Ret1","Tipo_Pago_Ret141","Sist_Financiero","Retiro_AORES_Ret_Int","Oper_Financ_Derivad","Mont_Int_Nominal","Mont_Int_Real","Mail","Facturado","Errores"] },

  { id: "ret_plataformas", nombre: "Retenciones 2.0 Plataformas Tecnológicas",
    headers: ["Folio","Razon_Social","RFC","Codigo_Postal","Nacionalidad","Mes_Ini","Mes_Fin","Ejerc","Monto_Tot_Operacion","Monto_Tot_Grav","Monto_Tot_Exent","Monto_Tot_Ret","Tipo_Pago_Ret1","Impuesto1","Base_Ret1","Monto_Ret1","Tipo_Pago_Ret2","Impuesto2","Base_Ret2","Monto_Ret2","Periodicidad","Num_Servicio","Monto_Total_Servicio_Sin_IVA","Total_IVA_Trasladado","Total_IVA_Retenido","Total_ISR_Retenido","Diferencia_IVA_Entregado_Prest_Serv","Monto_Total_Uso_Plataforma","Monto_Total_Contribucion_Gubernamental","Forma_Pago_Servicio1","Tipo_Servicio1","Subtipo_Servicio1","RFC_Tercero_Autorizado1","Fecha_Servicio1","Precio_Servicio_Sin_IVA1","Base_Trasladado1","Impuesto_Trasladado1","Tasa_Cuota_Trasladado1","Importe_Trasladado1","Importe_Contribucion_Gubernamental1","Entidad_Contribucion_Gubernamental1","Base_Comision1","Porcentaje_Comision1","Importe_Comision1","Mail","Facturado","Errores"] }
];

/* Familias para reglas de negocio (aritmética condicional) */
const FAMILIA = {
  factura: ["factura","factura_rfc_generico","factura_tipo_cambio","factura_descuento",
    "factura_descuento_exento","factura_iva_exento","factura_retencion_iva","factura_ieps",
    "factura_no_identificacion","factura_sku_ean","factura_pedimento","factura_predial",
    "factura_global","factura_global_iva","factura_global_8","factura_global_noid",
    "factura_global_noid_iva","factura_global_tc","factura_global_8","nota_credito"],
  global: ["factura_global","factura_global_iva","factura_global_8","factura_global_noid",
    "factura_global_noid_iva","factura_global_tc"],
  pago: ["pago","pago_mxn_sencillo","pago_mxn_rel_usd","pago_usd_rel_usd",
    "pago_iva_exento","pago_con_impuesto","recibo_pago"],
  retenciones: ["ret_intereses","ret_plataformas"]
};
