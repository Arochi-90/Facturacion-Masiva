/* ============================================================================
 * validador.js — Motor de validación de plantillas de Facturación Masiva
 * Todo corre en el navegador. Depende de: catalogos.js, plantillas.js
 * ==========================================================================*/

/* --- Parser CSV robusto (maneja comillas, comas dentro de comillas, CRLF) --- */
function parseCSV(text) {
  // Quitar BOM
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

  // Detectar delimitador dominante en la primera línea (coma, punto y coma, tab)
  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  const counts = { ",": 0, ";": 0, "\t": 0 };
  for (const ch of firstLine) if (ch in counts) counts[ch]++;
  let delim = ",";
  if (counts[";"] > counts[","] && counts[";"] >= counts["\t"]) delim = ";";
  else if (counts["\t"] > counts[","] && counts["\t"] > counts[";"]) delim = "\t";

  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === delim) { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === "\r") { /* ignorar; \n cierra la fila */ }
      else field += c;
    }
  }
  // Última fila
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }

  // Eliminar filas totalmente vacías al final
  while (rows.length && rows[rows.length - 1].every(v => v.trim() === "")) rows.pop();

  return { rows, delim };
}

/* --- Normalización para comparar encabezados (tolera mayúsculas/espacios/acentos) --- */
function normHeader(h) {
  return h.normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/\s+/g, " ").trim();
}

/* --- Detección de plantilla por mejor coincidencia de encabezados --- */
function detectarPlantilla(headers) {
  const hNorm = headers.map(normHeader);
  const hSet = new Set(hNorm);
  let best = null, bestScore = -1;
  for (const p of PLANTILLAS) {
    const pNorm = p.headers.map(normHeader);
    const pSet = new Set(pNorm);
    let inter = 0;
    for (const x of pSet) if (hSet.has(x)) inter++;
    // Jaccard ponderado a favor de cubrir la plantilla esperada
    const score = inter / (pSet.size + hSet.size - inter);
    if (score > bestScore) { bestScore = score; best = p; }
  }
  return { plantilla: best, score: bestScore };
}

/* --- Comparar encabezados del archivo contra la plantilla esperada --- */
function validarEncabezados(headers, plantilla) {
  const problemas = [];
  const esperado = plantilla.headers;
  const espNorm = esperado.map(normHeader);
  const gotNorm = headers.map(normHeader);
  const espSet = new Map(espNorm.map((n, i) => [n, esperado[i]]));
  const gotSet = new Map(gotNorm.map((n, i) => [n, headers[i]]));

  // Columnas faltantes
  for (const [n, orig] of espSet) {
    if (!gotSet.has(n)) problemas.push({
      tipo: "columna_faltante",
      mensaje: `Falta la columna "${orig}" que la plantilla requiere.`
    });
  }
  // Columnas de más / renombradas
  for (const [n, orig] of gotSet) {
    if (!espSet.has(n)) problemas.push({
      tipo: "columna_extra",
      mensaje: `La columna "${orig}" no pertenece a esta plantilla (sobra o está mal escrita).`
    });
  }
  // Diferencias exactas de texto (mismo campo, distinto formato: acento/espacio/mayúscula)
  for (let i = 0; i < headers.length; i++) {
    const n = gotNorm[i];
    if (espSet.has(n) && espSet.get(n) !== headers[i]) {
      problemas.push({
        tipo: "columna_renombrada",
        mensaje: `El título "${headers[i]}" no coincide exactamente con el esperado "${espSet.get(n)}" (revisa mayúsculas/acentos/espacios).`
      });
    }
  }
  // Orden de columnas (solo si el conjunto coincide)
  const mismoConjunto = espNorm.length === gotNorm.length &&
    espNorm.every(n => gotSet.has(n));
  if (mismoConjunto) {
    for (let i = 0; i < espNorm.length; i++) {
      if (espNorm[i] !== gotNorm[i]) {
        problemas.push({
          tipo: "orden_columnas",
          mensaje: `El orden de las columnas no coincide con la plantilla (empieza a diferir en la posición ${i + 1}: se esperaba "${esperado[i]}").`
        });
        break;
      }
    }
  }
  return problemas;
}

/* --- Detectores de valor de celda --- */
const RFC_RE = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function esFormula(v)      { return /^[=+\-@]/.test(v) && /[a-zA-Z(]/.test(v); }
function esNotacionCientifica(v) { return /^-?\d+([.,]\d+)?[eE][+-]?\d+$/.test(v.trim()); }
function tieneEnie(v)      { return /Ñ|ñ/.test(v); }
function tieneEspacios(v)  { return v.length !== v.trim().length && v.trim() !== ""; }
function tieneMoneda(v)    { return /[$]|\d,\d{3}(\D|$)/.test(v); }        // $ o coma de miles
function tieneMojibake(v)  { return /�|Ã.|Â.|â€|ï¿½/.test(v); }      // codificación rota

/* Catálogos de 2 dígitos: la plantilla de masiva acepta un dígito y el sistema lo
   completa. Confirmado con archivos reales timbrados (FormaPago "1"/"3", ObjetoImp "2",
   Estado, etc.). No se marca el cero a la izquierda como error. */
const CAT_2DIG_LENIENT = new Set(["FormaPago","ObjetoImp","Estado","Periodicidad","Meses","TipoRelacion"]);
function tieneControl(v)   { return /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(v); }
function tieneEmoji(v)     { return /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(v); }
function esNumero(v)       { return /^-?\d+(\.\d+)?$/.test(v.trim()); }
function esEntero(v)       { return /^\d+$/.test(v.trim()); }

/* --- Validar una celda según su regla de tipo --- */
function validarCelda(valor, col, regla) {
  const errs = [];
  const v = (valor ?? "").trim();

  // La columna "Errores" del archivo de resultados trae el motivo por el que el
  // sistema NO timbró. Es información valiosa: se muestra como tal, no como "basura".
  if (col === "Errores" && v !== "") {
    errs.push(`El sistema reportó este error al procesar la fila: ${v}`);
    return errs;
  }
  // "-" es un marcador válido de "no aplica" (así lo indica el manual y timbró real).
  if (v === "-") return errs;

  // Fórmulas / caracteres peligrosos (aplica a TODO campo)
  if (esFormula(valor ?? "")) {
    errs.push(`"${col}": contiene una fórmula ("${valor}") en lugar de texto plano. Convertir a texto/valor.`);
    return errs; // no seguir validando una fórmula
  }
  // Notación científica: Excel convierte números largos (predial, No.Identificacion, etc.)
  if (esNotacionCientifica(v)) {
    errs.push(`"${col}": el valor "${v}" quedó en notación científica (Excel convirtió un número largo). Dar formato de Texto a la celda y volver a escribir el número completo.`);
    return errs;
  }
  if (tieneControl(valor ?? "")) errs.push(`"${col}": contiene caracteres de control invisibles. Reescribir la celda.`);
  if (tieneEmoji(valor ?? ""))   errs.push(`"${col}": contiene emojis/caracteres no permitidos.`);
  if (tieneMojibake(valor ?? "")) errs.push(`"${col}": caracteres corruptos por codificación ("${valor}"). Guardar el CSV como UTF-8 (o Windows-1252) desde Excel.`);
  if (tieneEspacios(valor ?? "")) errs.push(`"${col}": tiene espacios al inicio o final ("${valor}"). Quitarlos.`);

  // Campos que deben ir vacíos
  if (CAMPOS_VACIOS.has(col) && v !== "") {
    errs.push(`"${col}": debe ir vacío en el archivo del cliente (se llena al timbrar). Valor encontrado: "${v}".`);
    return errs;
  }

  // Requerido
  if (regla.required && v === "") {
    errs.push(`"${col}": es obligatorio y está vacío.`);
    return errs;
  }
  if (v === "") return errs; // opcional vacío: ok

  switch (regla.type) {
    case "rfc":
      if (!RFC_RE.test(v)) {
        if (v.length < 12 || v.length > 13) errs.push(`"${col}": RFC incompleto o de longitud inválida ("${v}"). Debe tener 12 (moral) o 13 (física) caracteres.`);
        else errs.push(`"${col}": RFC con formato inválido ("${v}").`);
      }
      break;
    case "cp":
      // Excel suele quitar el cero inicial (03200 -> 3200); el sistema lo re-completa.
      // Se acepta 4-5 dígitos; se marca solo si no es numérico o queda fuera de rango.
      if (!/^\d{4,5}$/.test(v)) errs.push(`"${col}": el Código Postal debe ser de 5 dígitos numéricos ("${v}").`);
      break;
    case "fecha": {
      const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!m) { errs.push(`"${col}": la fecha debe tener formato DD/MM/AAAA ("${v}").`); break; }
      const dd = +m[1], mm = +m[2], yy = +m[3];
      const anioActual = new Date().getFullYear();
      if (mm < 1 || mm > 12 || dd < 1 || dd > 31) errs.push(`"${col}": fecha inválida ("${v}").`);
      else if (yy < anioActual - 1 || yy > anioActual + 1)
        errs.push(`"${col}": el año ${yy} está fuera de rango (se espera ${anioActual - 1}–${anioActual + 1}). Revisar la fecha de pago.`);
      break;
    }
    case "number":
      if (tieneMoneda(v)) errs.push(`"${col}": tiene símbolo de moneda o separador de miles ("${v}"). Escribir solo el número, sin "$" ni comas (ej. 6670.00).`);
      else if (!esNumero(v)) errs.push(`"${col}": se esperaba un número y hay texto/caracteres ("${v}").`);
      else if (regla.positive && parseFloat(v) <= 0) errs.push(`"${col}": debe ser mayor que cero ("${v}").`);
      break;
    case "int":
      if (!esEntero(v)) errs.push(`"${col}": se esperaba un número entero ("${v}").`);
      else if (regla.len && v.length !== regla.len) errs.push(`"${col}": debe tener ${regla.len} dígitos ("${v}").`);
      else if (regla.maxDigits && v.length > regla.maxDigits) errs.push(`"${col}": no debe exceder ${regla.maxDigits} dígitos ("${v}").`);
      break;
    case "email":
      if (!EMAIL_RE.test(v)) errs.push(`"${col}": correo con formato inválido ("${v}").`);
      break;
    case "uuid":
      if (!UUID_RE.test(v)) errs.push(`"${col}": UUID/Folio Fiscal con formato inválido ("${v}").`);
      break;
    case "metodo":
      if (!CAT.MetodoPago.has(v.toUpperCase())) errs.push(`"${col}": método de pago inválido ("${v}"). Debe ser PUE o PPD.`);
      break;
    case "catalog": {
      const set = CAT[regla.catalog];
      const padded = /^\d$/.test(v) ? v.padStart(2, "0") : v;
      if (CAT_2DIG_LENIENT.has(regla.catalog)) {
        // Acepta un dígito; el sistema lo completa.
        if (set && !set.has(v) && !set.has(padded))
          errs.push(`"${col}": valor "${v}" no existe en el catálogo ${regla.catalog} del SAT.`);
      } else if (set && !set.has(v)) {
        errs.push(`"${col}": valor "${v}" no existe en el catálogo ${regla.catalog} del SAT.`);
      }
      break;
    }
    case "text":
      if (regla.maxLen && v.length > regla.maxLen) errs.push(`"${col}": excede ${regla.maxLen} caracteres.`);
      // Razón Social: el truncamiento por longitud sí es un caso real (la Ñ limpia
      // timbra bien; el problema real es la codificación, ya cubierto por mojibake).
      if ((col === "Razon Social" || col === "Razon_Social") && v.length > 250) {
        errs.push(`"${col}": nombre muy largo (${v.length} caracteres); puede truncarse al timbrar. Revisar que coincida exactamente con la Constancia.`);
      }
      break;
  }
  return errs;
}

/* --- Reglas de negocio (aritmética) por familia --- */
function validarNegocio(fila, idx, plantillaId) {
  const errs = [];
  const num = k => { const v = (fila[k] ?? "").trim(); return v === "" ? null : parseFloat(v); };
  const round2 = n => Math.round(n * 100) / 100;

  if (FAMILIA.factura.includes(plantillaId)) {
    const cant = num("Cantidad"), precio = num("Precio Unitario");
    const sub = num("Subtotal del Concepto");
    const iva = num("IVA del Concepto");
    const desc = num("Descuento del Concepto") || 0;
    const ivaRet = num("IVA RET Monto") || 0;   // retención resta al total
    const ieps = num("IEPS del Concepto") || 0;  // IEPS suma al total
    const total = num("Total del Concepto");

    if (cant != null && precio != null && sub != null) {
      const esperado = round2(cant * precio);
      if (Math.abs(esperado - sub) > 0.01)
        errs.push(`Aritmética: Subtotal (${sub}) ≠ Cantidad×Precio (${esperado}).`);
    }
    if (sub != null && total != null) {
      const esperado = round2(sub - desc + (iva || 0) + ieps - ivaRet);
      if (Math.abs(esperado - total) > 0.02)
        errs.push(`Aritmética: Total (${total}) ≠ Subtotal − Descuento + IVA + IEPS − IVA Retenido (${esperado}).`);
    }
  }

  if (FAMILIA.global.includes(plantillaId)) {
    const rfc = (fila["RFC"] ?? "").trim().toUpperCase();
    if (rfc && rfc !== "XAXX010101000")
      errs.push(`Factura Global: el RFC del receptor debe ser XAXX010101000 (público en general), no "${rfc}".`);
    const uso = (fila["UsoCFDI"] ?? "").trim().toUpperCase();
    if (uso && uso !== "S01")
      errs.push(`Factura Global: UsoCFDI debe ser S01, no "${uso}".`);
  }

  if (FAMILIA.pago.includes(plantillaId)) {
    const metodo = (fila["MetododePago"] ?? "").trim().toUpperCase();
    if (metodo && metodo !== "PPD")
      errs.push(`Complemento de Pago: el Método de Pago suele ser PPD, se encontró "${metodo}".`);
    const uso = (fila["UsoCFDI"] ?? "").trim().toUpperCase();
    if (uso && uso !== "CP01")
      errs.push(`Complemento de Pago: UsoCFDI debe ser CP01, no "${uso}".`);
  }

  return errs;
}

/* --- Validación completa del archivo --- */
function validarArchivo(text) {
  // Archivo binario disfrazado de CSV (XLSX/ZIP empiezan con "PK")
  if (text.startsWith("PK\x03\x04") || text.startsWith("PK")) {
    return { error: "El archivo no es un CSV: parece un Excel (.xlsx) o comprimido (.zip). En Excel: Archivo → Guardar como → CSV (delimitado por comas)." };
  }
  const { rows, delim } = parseCSV(text);
  if (rows.length === 0) return { error: "El archivo está vacío." };

  const headers = rows[0].map(h => h.trim());
  const { plantilla, score } = detectarPlantilla(headers);

  const resultado = {
    plantilla: plantilla ? plantilla.nombre : "Desconocida",
    plantillaId: plantilla ? plantilla.id : null,
    confianza: Math.round(score * 100),
    delim,
    totalFilas: rows.length - 1,
    encabezado: [],
    filas: [],
    resumen: {}
  };

  // 1) Encabezados
  if (plantilla) resultado.encabezado = validarEncabezados(headers, plantilla);
  if (delim === ";") {
    resultado.encabezado.unshift({
      tipo: "delimitador",
      mensaje: `El archivo usa punto y coma (;) como separador. Facturama espera comas (,). Guardar como CSV delimitado por comas.`
    });
  }
  if (score < 0.5) {
    resultado.encabezado.unshift({
      tipo: "plantilla_incierta",
      mensaje: `No se pudo identificar con certeza la plantilla (coincidencia ${resultado.confianza}%). ¿El título/columnas fueron alterados o es un archivo distinto?`
    });
  }

  // 2) Filas
  const contadorTipos = {};
  for (let r = 1; r < rows.length; r++) {
    const raw = rows[r];
    // fila vacía en medio de los datos: el sistema falla al parsearla
    if (raw.every(v => (v ?? "").trim() === "")) {
      resultado.filas.push({ fila: r + 1, noFactura: "", errores: [`Fila vacía (solo comas o en blanco). Bórrala: provoca error de procesamiento en el sistema.`] });
      continue;
    }

    const fila = {};
    headers.forEach((h, i) => fila[h] = raw[i] ?? "");

    const errsFila = [];

    // Conteo de columnas distinto al encabezado
    if (raw.length !== headers.length) {
      errsFila.push(`La fila tiene ${raw.length} columnas pero el encabezado tiene ${headers.length}. Puede haber una coma extra o falta un dato.`);
    }

    // Validación por celda
    for (const h of headers) {
      const regla = FIELD_RULES[h] || FIELD_RULES[normHeaderKey(h)] || null;
      if (!regla) continue;
      const cellErrs = validarCelda(fila[h], h, regla);
      for (const e of cellErrs) errsFila.push(e);
    }

    // Reglas de negocio
    if (plantilla) for (const e of validarNegocio(fila, r, plantilla.id)) errsFila.push(e);

    if (errsFila.length) {
      resultado.filas.push({ fila: r + 1, noFactura: fila["No. Factura"] || fila["Folio"] || "", errores: errsFila });
      for (const e of errsFila) {
        const key = e.split(":")[0];
        contadorTipos[key] = (contadorTipos[key] || 0) + 1;
      }
    }
  }

  resultado.resumen = {
    filasConError: resultado.filas.length,
    problemasEncabezado: resultado.encabezado.length,
    tiposComunes: Object.entries(contadorTipos).sort((a, b) => b[1] - a[1]).slice(0, 8)
  };

  return resultado;
}

/* Coincidencia de regla ignorando mayúsculas/acentos si el nombre exacto no existe */
function normHeaderKey(h) {
  const target = normHeader(h);
  for (const k of Object.keys(FIELD_RULES)) if (normHeader(k) === target) return k;
  return h;
}
