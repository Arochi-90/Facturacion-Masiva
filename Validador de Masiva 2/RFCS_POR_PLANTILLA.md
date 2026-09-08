# RFCs por tipo de plantilla — Canal #facturama-facturación-masiva

Fuente: lectura completa del canal `C02J3DSUY5P` (2021-10 → 2026-08).
Uso interno de soporte: juntar ejemplos reales por tipo de plantilla para calibrar el validador.
Solo se asigna tipo cuando el mensaje lo indicó explícitamente.

## RFCs con tipo de plantilla identificable (~40)

### Factura (normal)
| RFC | Nota | Fecha |
|---|---|---|
| TLM160318IH4 | Coma en razón social | 2021-11-12 |
| MDI081111HF8 | Espacios en Folio / filas vacías | 2021-11-08 |
| PRO130117RW0 | Precio vacío, `$` en montos, folios repetidos | 2021-11-06 |
| RCC171023313 | Recibos, IVA 0 | 2021-11-06 |
| CRA1802015H6 | `$` en montos | 2021-11-06 |
| CDO1907221M4 | "Archivo no válido" / codificación | 2025-05 / 2026-01 |

### Factura con Descuento
| RFC | Nota | Fecha |
|---|---|---|
| BDS2302216Q2 | Descuento no respeta monto (192095.69→.70) | 2025-07-28 |
| JME210302SL4 | Descuento IEPS, ~1700 facturas; clave 01010101 | 2021-11-23 |

### Factura IVA Exento
| RFC | Nota | Fecha |
|---|---|---|
| IBA030129JK9 | No aparece la opción en masiva | 2025-02-25 |
| ART180426H22 | "Este proceso necesita atención" | 2025-11-20 |

### Factura Global
| RFC | Nota | Fecha |
|---|---|---|
| CPS061020M34 | Global con IVA; salto de folios | 2025-10 / 11 |
| APV110517574 | Error "Año no es el año en curso" | 2025-10-23 |
| SNH121106AM9 | Mismo error de año | 2025-10-23 |
| YST190517SW9 | Factura Global | 2025-10-23 |
| EOPC780403V67 | No puede subir archivo | 2025-10-10 |
| UOCE670910HI1 | Error del PAC | 2023-03-06 |
| CSO180718BU0 | Global con RFC específico (no genérico) | 2023-06-19 |
| CAU110412176 | Público general; 8,533 conceptos (PDF no genera) | 2023-03 |

### Factura Global + No. Identificación (requieren IVA)
| RFC | Nota | Fecha |
|---|---|---|
| RQU220503HS8 | Global con No.Identificación que necesita IVA | 2025-12-03 |
| LEX2106188U7 | Global con No.Identificación con IVA | 2026-02-03 |

### Factura Cuenta Predial
| RFC | Nota | Fecha |
|---|---|---|
| BMS200224CM6 | Notación científica "+14" en el predial | 2026-07-21 |
| CIN010904D31 | Solicitud plantilla predial (arrendamiento) | 2024-04-09 |

### Factura No. Identificación / SKU
| RFC | Nota | Fecha |
|---|---|---|
| RIV201113R23 | SKU + No.Identificación + No.Pedimento; error ObjetoImpuesto | 2025-05-12 |

### Nota de Crédito
| RFC | Nota | Fecha |
|---|---|---|
| AKA060427QP2 | Nu México; proceso trabado | 2025-12-09 |
| NBS180822UT3 | Nu; cancelación masiva 5000–10000 | 2021-12 / 2022-03 |
| GUMS950220CS4 | "0/1 proceso terminado"; folios repetidos | 2022-04-19 |

### Complemento de Pago (incl. multimoneda USD/MXN)
| RFC | Nota | Fecha |
|---|---|---|
| CAHM530529431 | **Multimoneda** USD/MXN; monto 1990→100 | 2026-06-30 |
| MTR120831P20 | 1 factura 2 impuestos; EquivalenciaDR / MonedaDR | 2026-04-18 |
| SHO131128HX1 | "suma ImpPagado fuera de límite"; signos `+` | 2024-04-17 |
| KLD160622J8A | ~500 renglones; no procesa (caracter) | 2024-04-04 |
| BLI180227F23 | Error 502 (sí timbró) | 2026-02-24 |
| MASG9010157W4 | Unió 6 pagos en 1 | 2024-11-29 |

### Retenciones 2.0 (Plataformas / Intereses)
| RFC | Nota | Fecha |
|---|---|---|
| UTL1005258F2 | Plataformas; Reten20116 (Ñ en nombre) | 2024-05 / 2025-05 |
| SIR110328IS0 | Cabify/EasyTaxi; no descarga archivo de error | 2023-09-07 |
| BBE230822RB1 | Plataformas; error TotalIVA / FormaPagoServ 01 | 2024-07-08 |
| VLO221104D12 | Retención de IVA | 2025-10-23 |
| GPA2103231H4 | Soporte Invisible; no descarga | 2022-10 |
| RIS120316SH9 | Bazaya/Linio; consumo de folios | 2023-06-05 |
| CFR150505IK2 | Sube 10, genera solo 1 | 2021-11-16 |

### Cancelación masiva (proceso, no plantilla)
MPT1612066I0, CFF921009N30, CAR0707147X9, APN15060884A, JAC0503309L8, CON150216982, FMA120905UA6.

---

## RFCs sin tipo de plantilla identificable (~135–150)
La mayoría del canal son peticiones de "destrabar proceso", "folios repetidos", lentitud o
"no encuentro el error", sin decir el tipo de plantilla. Incluye los casos de Ñ/acentos
(TIN201118Q1A, NOFE550414IY8, GME131105SX0, GPF180815387, DBE201202GG0, PRE140722U30, CMH2304211P5).
Ver el volcado completo en el resultado del análisis del canal.

## Recomendación
Para calibrar el validador por tipo, pedir a estos clientes (o rescatar de sus tickets)
1 archivo real por cada tipo: Global (APV110517574 / YST190517SW9), Cuenta Predial (BMS200224CM6),
Complemento multimoneda (CAHM530529431), Retenciones (BBE230822RB1), Nota de Crédito (GUMS950220CS4).
