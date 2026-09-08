# Validador de Plantillas · Facturación Masiva

Herramienta interna de soporte para revisar los archivos `.CSV` que los clientes
comparten cuando su facturación masiva falla. **Corre 100% en el navegador**: no
sube nada a ningún servidor y no necesita base de datos ni internet.

## Para el equipo de desarrollo (deploy)
- Es un sitio **100% estático** (HTML + JS puro, sin dependencias, sin build).
- Subir la carpeta a cualquier hosting estático interno, o abrir `index.html` local.
- Requiere que `catalogos.js`, `plantillas.js`, `validador.js` y `assets/` estén junto al `index.html`.
- No hace llamadas de red: todo el procesamiento del CSV ocurre en el navegador del usuario.
- Estado: **piloto / v1**, calibrado con 10 archivos reales (0 falsos positivos en timbrados).
- Los `.md` de referencia (`CATALOGO_ERRORES_SLACK.md`, `RFCS_POR_PLANTILLA.md`) son
  documentación interna de soporte; pueden omitirse del hosting si se prefiere.

## Cómo usarla
1. Abre `index.html` (doble clic, o súbelo a un hosting estático interno).
2. Arrastra el `.CSV` del cliente o haz clic para seleccionarlo.
3. Lee el reporte: estructura/encabezado, errores frecuentes y detalle por fila.
4. Usa **Copiar reporte** para pegárselo al cliente.

## Qué valida hoy
- **Estructura**: plantilla detectada automáticamente; columnas faltantes, de más,
  renombradas (mayúsculas/acentos/espacios) y fuera de orden.
- **Formato de celda**: RFC (longitud y patrón), CP de 5 dígitos, correo, UUID,
  fórmulas (`=`, `+`, `@`) en lugar de texto, caracteres de control/emoji,
  números donde deben ir números.
- **Catálogos SAT**: RegimenFiscal, UsoCFDI, FormaPago, MetodoPago, ObjetoImp,
  Estado, Periodicidad, Meses, TipoRelacion.
- **Reglas de negocio**: Subtotal = Cantidad × Precio; Total = Subtotal − Descuento
  + IVA; Global (RFC XAXX010101000 / UsoCFDI S01); Pago (PPD / CP01).

## Diseño
Interfaz con la identidad de marca de Facturama (2025): paleta navy/azul/verde,
tipografía Inter (headlines Founders Grotesk con fallback), CTA verde, superficies
light-blue, escala roja para errores y logo oficial. Logos en `assets/`.

## Archivos
- `index.html` — interfaz.
- `assets/` — logos oficiales de Facturama (blanco y color).
- `catalogos.js` — catálogos SAT y reglas por tipo de campo (`FIELD_RULES`).
- `plantillas.js` — firmas de encabezado de cada plantilla (`PLANTILLAS`).
- `validador.js` — parser CSV + motor de validación.

## Cómo ampliar / afinar reglas
- **Nueva plantilla**: agrega una entrada en `PLANTILLAS` con su `headers`.
- **Nuevo campo o cambio de regla**: edita `FIELD_RULES` en `catalogos.js`.
- **Regla de negocio**: agrega lógica en `validarNegocio()` de `validador.js`.

## Detectores adicionales (calibrados con Slack + archivo real)
- Espacios al inicio/fin (trim), símbolo `$` y separador de miles en montos.
- Ceros a la izquierda: **Forma de Pago** exige 2 dígitos (`03`); ObjetoImp/Estado/
  Periodicidad/Mes aceptan un dígito (el sistema los completa).
- Filas totalmente vacías (`,,,,,`), desplazamiento de columnas.
- Codificación rota (mojibake), notación científica de Excel, Ñ y longitud en
  Razón Social.
- Archivo no-CSV disfrazado (.xlsx/.zip) y delimitador `;` en vez de `,`.
- Campos de dirección obligatorios (Calle, Colonia, No. Exterior, Municipio).
- No. Factura ≤ 9 dígitos.

Validado contra un archivo real timbrado (Gaspeed, mayo 2026): 0 falsos positivos.

## Pendiente (se afina con más ejemplos reales)
- Reglas de negocio de complemento de pago multimoneda (EquivalenciaDR, TipoCambio).
- Complementos de Retenciones 2.0 (CveRetenc, columnas por servicio).
- Tasa IVA 8%/0%/exento y franja fronteriza en la aritmética (hoy asume 16%).
- Coherencia UsoCFDI↔RegimenFiscal y ObjetoImp↔nodo Impuestos.
- Ver catálogo completo en `CATALOGO_ERRORES_SLACK.md`.
