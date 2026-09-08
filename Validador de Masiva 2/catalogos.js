/* ============================================================================
 * catalogos.js — Catálogos SAT (CFDI 4.0) y reglas de tipo de campo
 * Todo corre en el navegador. Sin dependencias, sin red.
 * Fuente: Manual de Facturación Masiva 2025 + catálogos c_* del SAT.
 * ==========================================================================*/

/* --- Catálogos SAT (claves válidas) --- */
const CAT = {
  RegimenFiscal: new Set([
    "601","603","605","606","607","608","610","611","612","614","615","616",
    "620","621","622","623","624","625","626","628","629","630"
  ]),
  UsoCFDI: new Set([
    "G01","G02","G03",
    "I01","I02","I03","I04","I05","I06","I07","I08",
    "D01","D02","D03","D04","D05","D06","D07","D08","D09","D10",
    "S01","CP01","CN01","P01"
  ]),
  FormaPago: new Set([
    "01","02","03","04","05","06","08","12","13","14","15","17",
    "23","24","25","26","27","28","29","30","31","99"
  ]),
  MetodoPago: new Set(["PUE","PPD"]),
  ObjetoImp: new Set(["01","02","03","04"]),
  Periodicidad: new Set(["01","02","03","04","05"]),
  Meses: new Set([
    "01","02","03","04","05","06","07","08","09","10","11","12",
    "13","14","15","16","17","18"
  ]),
  Estado: new Set(
    Array.from({length: 32}, (_, i) => String(i + 1).padStart(2, "0"))
  ),
  Impuesto: new Set(["001","002","003"]),           // ISR, IVA, IEPS
  TipoRelacion: new Set(["01","02","03","04","05","06","07"])
};

/* RFC genéricos aceptados */
const RFC_GENERICOS = new Set(["XAXX010101000", "XEXX010101000"]);

/* ============================================================================
 * Reglas por TIPO DE CAMPO. La clave es el nombre canónico de columna.
 * Como los nombres de columna se repiten entre plantillas, este mapa se
 * comparte y escala a todas las plantillas.
 *
 * type: rfc | cp | number | int | email | catalog | text | date | uuid | fecha
 * required: si el campo es obligatorio
 * catalog: nombre del catálogo en CAT (solo si type === 'catalog')
 * ==========================================================================*/
const FIELD_RULES = {
  // --- Identificación / receptor ---
  "Folio":            { type: "any",     required: false, note: "Debe ir vacío; se llena al timbrar." },
  "No. Factura":      { type: "int",     required: true, maxDigits: 9 },
  "Razon Social":     { type: "text",    required: true, upper: true },
  "Razon_Social":     { type: "text",    required: true, upper: true },
  "RFC":              { type: "rfc",      required: true },
  "Fiscal Regime":    { type: "catalog", required: true, catalog: "RegimenFiscal" },
  "UsoCFDI":          { type: "catalog", required: true, catalog: "UsoCFDI" },

  // --- Domicilio ---
  "Calle":            { type: "text",    required: true,  note: "Usar '-' si no aplica." },
  "Colonia":          { type: "text",    required: true,  note: "Usar '-' si no aplica." },
  "No. Exterior":     { type: "text",    required: true,  note: "Usar '-' si no aplica." },
  "No. Interior":     { type: "text",    required: false },
  "CP":               { type: "cp",      required: true },
  "Codigo_Postal":    { type: "cp",      required: true },
  "Municipio":        { type: "text",    required: true },
  "Estado":           { type: "catalog", required: true, catalog: "Estado" },

  // --- Pago (factura) ---
  "Forma de Pago":    { type: "catalog", required: false, catalog: "FormaPago" },
  "Condiciones de Pago": { type: "text", required: false },
  "Metodo de Pago":   { type: "metodo",  required: true },
  "Observaciones":    { type: "text",    required: false },

  // --- Concepto ---
  "ClaveProdServ":    { type: "int",     required: true, len: 8 },
  "Concepto":         { type: "text",    required: true },
  "ClaveUnidad":      { type: "text",    required: true },
  "Unidad":           { type: "text",    required: false },
  "Cantidad":         { type: "number",  required: true, positive: true },
  "Precio Unitario":  { type: "number",  required: true, positive: true },
  "Objeto Impuesto":  { type: "catalog", required: true, catalog: "ObjetoImp" },
  "Subtotal del Concepto": { type: "number", required: true },
  "IVA del Concepto": { type: "number",  required: false },
  "Total del Concepto":    { type: "number", required: true },
  "Descuento del Concepto":{ type: "number", required: false },
  "Tasa":             { type: "number",  required: false },
  "Es IVA Exento":    { type: "text",    required: false },
  "Pedido":           { type: "text",    required: false },
  "Mail":             { type: "email",   required: false },
  "Facturado":        { type: "any",     required: false, note: "Debe ir vacío." },
  "Errores":          { type: "any",     required: false, note: "Debe ir vacío." },

  // --- Extras de variantes de factura ---
  "No.Identificacion":{ type: "text",    required: false },
  "SKU":              { type: "text",    required: false },
  "EAN":              { type: "text",    required: false },
  "CuentaPredial":    { type: "text",    required: false },
  "No.Pedimento":     { type: "text",    required: false },
  "ClaveMoneda":      { type: "text",    required: false },
  "TipoCambio":       { type: "number",  required: false },
  "IVA RET Tasa":     { type: "number",  required: false },
  "IVA RET Monto":    { type: "number",  required: false },
  "IEPS Porcentaje":  { type: "number",  required: false },
  "IEPS del Concepto":{ type: "number",  required: false },

  // --- Global ---
  "Periodicidad":     { type: "catalog", required: true, catalog: "Periodicidad" },
  "Mes":              { type: "catalog", required: true, catalog: "Meses" },
  "Year":             { type: "int",     required: true, len: 4 },

  // --- Nota de Crédito ---
  "TipoRelacion":     { type: "catalog", required: true, catalog: "TipoRelacion" },
  "UUIDRelacion":     { type: "uuid",    required: true },

  // --- Complemento de pago ---
  "FechadePago":      { type: "fecha",   required: true },
  "FormadePago":      { type: "catalog", required: true, catalog: "FormaPago" },
  "Monto":            { type: "number",  required: true, positive: true },
  "Moneda":           { type: "text",    required: false },
  "FolioFiscal":      { type: "uuid",    required: true },
  "No.Parcialidad":   { type: "int",     required: true },
  "MonedaRel":        { type: "text",    required: false },
  "EquivalenceDocRel":{ type: "number",  required: false },
  "TipodeCambio":     { type: "number",  required: false },
  "TipodeCambioRel":  { type: "number",  required: false },
  "MetododePago":     { type: "metodo",  required: false },
  "ImporteSaldoAnterior": { type: "number", required: true },
  "ImportePagado":    { type: "number",  required: true },
  "SaldoInsoluto":    { type: "number",  required: false },
  "ObjetoImpuesto":   { type: "catalog", required: true, catalog: "ObjetoImp" },
  "NombreImpuesto":   { type: "text",    required: false },
  "BaseImpuesto":     { type: "number",  required: false },
  "TasaImpuesto":     { type: "number",  required: false },
  "TotalImpuesto":    { type: "number",  required: false },

  // --- Retenciones 2.0 ---
  "Nacionalidad":     { type: "text",    required: false },
  "Mes_Ini":          { type: "text",    required: false },
  "Mes_Fin":          { type: "text",    required: false },
  "Ejerc":            { type: "int",     required: false },
  "Monto_Tot_Operacion": { type: "number", required: false },
  "Monto_Tot_Grav":   { type: "number",  required: false },
  "Monto_Tot_Exent":  { type: "number",  required: false },
  "Monto_Tot_Ret":    { type: "number",  required: false }
};

/* Campos que SIEMPRE deben ir vacíos en la plantilla enviada por el cliente */
const CAMPOS_VACIOS = new Set(["Folio", "Facturado", "Errores"]);
