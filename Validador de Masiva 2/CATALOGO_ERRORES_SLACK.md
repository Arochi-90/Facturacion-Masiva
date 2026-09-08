# Catálogo preliminar de errores — Canal #facturama-facturación-masiva

Fuente: lectura exhaustiva del canal `C02J3DSUY5P` (2021-10-13 → 2026-08-19, ~64 páginas).
Uso: base para priorizar las reglas del Validador de Plantillas de Masiva.

## Resumen
- **Tipo A — errores de PLANTILLA/CSV (detectables por el validador):** ~40 patrones.
- **Tipo B — errores de BACKEND/SISTEMA (fuera de alcance):** ~17 temas. Son el **60-70% del tráfico** del canal (procesos trabados y folios repetidos dominan).

---

## Tipo A — Errores de plantilla (candidatos a regla)

| Columna | Síntoma / mensaje | Causa raíz | Corrección | Ejemplo | Regla sugerida |
|---|---|---|---|---|---|
| Razón Social / Concepto | Caracteres raros ("P+¦blico", "ó→ý"); "nombre no corresponde al RFC" | Codificación del CSV (UTF-8 vs Latin1/Win-1252/Mac) | Guardar Win-1252 | TIN201118IY8, GME131105SX0 | **FALTA**: detección de codificación (no solo Ñ) |
| Razón Social | Se guarda truncada | Longitud excesiva | Acortar | SNT050224CU4 | Ya (>250) |
| Predial/CP/montos | Aparece "+14" | Notación científica Excel | Formato Texto | BMS200224CM6 | Ya |
| FormaPago/ClaveProdServ/CP | "debe ir con dos dígitos"; "1010101"; CP "8500" | **Excel borra el 0 inicial** | Formato Texto | MASG9010157W4 | **FALTA**: ceros a la izquierda |
| Razón Social con coma | Columnas desplazadas | Coma sin comillas rompe el CSV | Quitar coma/entrecomillar | "CONSORCIO CAPITAL, S.A." | **FALTA**: comas sin comillas |
| Precio/Subtotal/IVA/Total | No parsea | "$6,670" con $ y coma de miles | Número sin $ ni comas | YST190517SW9 | **FALTA**: $ y separador de miles |
| Filas vacías | DecimalConverter error `,,,,,` | Renglones en blanco al final | Borrar filas | TBM190326129 | **FALTA**: filas totalmente vacías |
| Decimales obligatorios | DecimalConverter; columnas recorridas | Campo decimal vacío | Poner .00 | PRO130117RW0 | **FALTA**: decimal obligatorio vacío + desplazamiento |
| Encabezado | "Archivo no válido"; agrupa todo en 1 factura | Header renombrado / plantilla equivocada | Plantilla original | BAM0511076B3 | Parcial (falta normalizar "No. Factura") |
| Folio/RFC | No procesa; "RFC no coincide" | Espacios al inicio/fin | Trim | varios | **FALTA**: trim |
| Archivo completo | "No fue posible validar el archivo" / binario | XLSX/ZIP disfrazado o delimitador `;` | Reguardar CSV coma | LUHE440323K63 | **FALTA**: magic bytes + delimitador |
| ObjetoImpuesto | "01/03/04/05 → nodo Impuestos no debe existir" | ObjetoImp incoherente con impuestos | Ajustar | RIV201113R23 | Parcial (falta coherencia) |
| No.Exterior/Municipio/Calle | "ExteriorNumber al menos 1 carácter" | Obligatorio vacío | Poner "-" | VME130319QV1 | **FALTA**: dirección obligatoria |
| ClaveProdServ/ClaveUnidad | "clave no existe"; "ClaveUnidad 2-3 caracteres" | Fuera de catálogo/formato | Corregir | 78121601 | **FALTA**: longitud/formato |
| FormaPago/Método | "Para PPD la Forma de pago debe ser 99" | Reglas PPD/PUE | Ajustar | LAD240216IA6 | **FALTA**: PPD→99 |
| Montos/IVA | "subtotal incorrecto"; IVA 8% validado como 16% | Aritmética / tasa fija 16% | Ajustar (issue FSHALP-409) | BDS2302216Q2 | Parcial (falta 8%/0%/exento y franja fronteriza) |
| Folio/montos | "Folio positivo hasta 9 dígitos"; monto 10 díg. rechazado | Límite 9 dígitos | Reducir | — | **FALTA**: folio ≤9 díg.; monto ≤9 díg. |
| Fecha | ">72 horas"; "Año no es el actual/anterior" | Zona horaria / fecha vieja | Corregir fecha | MGR050803JJ1 | Parcial (falta ventana 72h + zona) |
| Estado | No rechaza "09 Distrito Federal" | Catálogo DF vs CDMX (33) | Dejar 09/33 CDMX | — | Parcial (DF→CDMX) |
| Comp. Pago USD/MXN | "montos pagados no corresponden"; "EquivalenciaDR debe ser 1"; "ExchangeRate requerido" | Monedas distintas / TipoCambio | Ajustar | MPT1612066I0, CAHM530529431 | **FALTA**: multimoneda |
| Retenciones 2.0 | "CveRetenc debe ser 26"; falta MonTotalContribucionGubernamental | Complementos por servicio | Agregar columnas | UTL1005258F2 | **FALTA**: retenciones |
| Nombre/Folio con "+" | "nombre no corresponde al RFC" | Caracter especial "+" | Timbrar por web | NTE200124E44 | **FALTA**: caracteres especiales en nombre/folio |
| Parseo | Se corta en la línea con carácter inválido (factura 64) | Un carácter aborta el resto | Corregir esa línea | varios | El validador ya reporta por-renglón |

**Evitar** como regla: NO bloquear por filas repetidas en masiva (esa validación se quitó a propósito — CAU110412176).

---

## Tipo B — Backend/sistema (fuera del alcance del validador)
1. Procesos trabados / no cambian de estatus (**#1 del canal**; writer único saturado).
2. Folios repetidos web + masiva (**muy frecuente**).
3. Facturas duplicadas / proceso ejecutado 2 veces (doble-click/refresco).
4. Descuento incorrecto de folios / cancelación consume folios sin cancelar.
5. Cancelación masiva fallida (sigue vigente en SAT).
6. Descarga de reportes vacía ("Archivo success/error vacío").
7. HTTP 500/502/503, timeouts, respuesta HTML.
8. Caídas por deploy / incidentes de servidor.
9. Correos no se envían a clientes.
10. Consumo de folios sin generar / folios no se activan tras compra.
11. Cuentas viejas recuperadas no dejan subir.
12. PDF no se genera con >1000 conceptos.
13. Suscripción Free/Unrenewed bloquea masiva.
14. Series no visibles.
15. Lentitud por DB/servicio compartido con nóminas.
16. Errores internos (null reference, precondition failed).
17. Reportes descuadrados (procesadas ≠ éxito + error).

---

## Prioridad sugerida de reglas nuevas (alto impacto, fáciles)
1. Ceros a la izquierda (FormaPago 2, ClaveProdServ 8, CP 5).
2. `$` y separador de miles en decimales.
3. Trim de espacios.
4. Filas totalmente vacías + desplazamiento de columnas.
5. Detección de archivo no-CSV (XLSX/ZIP) y delimitador `;`.
6. Codificación / mojibake.
7. Campos de dirección obligatorios.
8. Folio ≤9 dígitos.
9. PPD→FormaPago 99.
10. Tasa IVA 8%/0%/exento en aritmética.
