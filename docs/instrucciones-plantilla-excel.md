# 📊 PLANTILLA EXCEL - PRESUPUESTOS CONSTRU-FE

## 📋 **DESCARGAR PLANTILLA**

### **Archivos de Plantilla:**
1. **`plantilla-presupuesto-constru-fe.csv`** - Conceptos y títulos
2. **`datos-generales-ejemplo.csv`** - Datos del presupuesto

### **Cómo Descargar:**
1. Haz clic derecho en los archivos
2. Selecciona "Guardar enlace como..."
3. Guarda en tu computadora
4. Abre con Excel o Google Sheets

---

## 🏗️ **ESTRUCTURA COMPLETA DE LA PLANTILLA**

### **Formato de Excel Recomendado:**

Crea un archivo de Excel con 3 hojas:

#### **HOJA 1: DATOS_GENERALES**
```
Columna A    Columna B         Columna C
DATO         VALOR             EJEMPLO
FOLIO        (dejar vacío)     AUTOMATICO
FECHA        15/10/2025        dd/mm/yyyy
DESCRIPCION  INSTALACION...    título del proyecto
NOMBRE_CLIENTE COMPRAS ARCA... razón social
EMAIL_CLIENTE compras@arca.com email@ejemplo.com
TELEFONO_CLIENTE (667)123-4567 (667)123-4567
DIRECCION_CLIENTE Tulipán #22... dirección completa
NOMBRE_DESTINATARIO DEPTO. COMPRAS persona o depto
EMAIL_DESTINATARIO compras@arca.com email@ejemplo.com
TELEFONO_DESTINATARIO (667)123-4567 (667)123-4567
CARGO_DESTINATARIO JEFE DE COMPRAS puesto del destinatario
```

#### **HOJA 2: CONCEPTOS**
```
TIPO      CLAVE   DESCRIPCIÓN                              UNIDAD    CANTIDAD  PRECIO UNITARIO  IMPORTE
Título    T01     MANO DE OBRA                                             
Concepto  C01     RETIRO DE TUBERÍA EXISTENTE           SERVICIO  1         500.00           500.00
Concepto  C02     INSTALACIÓN DE NIPLE Y TEE             SERVICIO  1         300.00           300.00
Concepto  C03     INSTALACIÓN DE VÁLVULA DE ACERO...     SERVICIO  1         4150.00          4150.00
Título    T02     MATERIALES                                               
Concepto  C04     NIPLE DE 1/2"                          PIEZA     2         150.00           300.00
Concepto  C05     TEE DE 1/2"                            PIEZA     1         200.00           200.00
Concepto  C06     VÁLVULA DE ACERO INOXIDABLE           PIEZA     1         3500.00          3500.00
Título    T03     HERRAMIENTA Y EQUIPO                                      
Concepto  C07     RENTA DE EQUIPO ESPECIALIZADO         SERVICIO  1         800.00           800.00
Concepto  C08     MATERIALES CONSUMIBLES                SERVICIO  1         200.00           200.00
```

#### **HOJA 3: INSTRUCCIONES**
```
INSTRUCCIONES DE USO
====================

1. DATOS_GENERALES:
   - FOLIO: Dejar vacío (se genera automáticamente)
   - FECHA: Usar formato dd/mm/yyyy
   - DESCRIPCIÓN: Título completo del proyecto
   - CLIENTE: Datos completos del cliente
   - DESTINATARIO: Persona que recibe el presupuesto

2. CONCEPTOS:
   - TIPO: Usar exactamente "Título" o "Concepto"
   - CLAVE: Autonumérico (T01, T02... C01, C02...)
   - DESCRIPCIÓN: Texto completo del concepto
   - UNIDAD: SERVICIO, PIEZA, M2, ML, KG, etc.
   - CANTIDAD: Número (ej: 1, 2, 5.5)
   - PRECIO UNITARIO: Moneda (ej: 1500.50)
   - IMPORTE: =CANTIDAD*PRECIO UNITARIO

3. REGLAS IMPORTANTES:
   - Los "Títulos" no tienen cantidad ni precios
   - Los "Conceptos" deben tener todos los datos
   - Las claves deben ser únicas
   - Usar punto decimal para centavos
   - No dejar filas en blanco entre conceptos

4. EJEMPLOS DE UNIDADES:
   - SERVICIO (trabajos)
   - PIEZA (artículos individuales)
   - M2 (metros cuadrados)
   - ML (metros lineales)
   - KG (kilogramos)
   - LITRO (líquidos)
   - JORNAL (días de trabajo)
   - HORA (tiempo)
```

---

## 📝 **EJEMPLOS PRÁCTICOS**

### **Ejemplo 1: Construcción de Muro**
```
TIPO      CLAVE   DESCRIPCIÓN                        UNIDAD    CANTIDAD  PRECIO UNITARIO  IMPORTE
Título    T01     PREPARACIÓN DEL TERRENO                           
Concepto  C01     LIMPIEZA Y DESPALME             M2        100       25.00            2500.00
Concepto  C02     TRAZO Y NIVELACIÓN              M2        100       15.00            1500.00
Título    T02     CIMENTACIÓN                                       
Concepto  C03     EXCAVACIÓN DE CIMENTACIÓN        M3        5         200.00           1000.00
Concepto  C04     CIMENTO Y ARENA                 M3        6         800.00           4800.00
Título    T03     MURO DE BLOQUE                                    
Concepto  C05     BLOQUE DE CONCRETO 6"           PIEZA     500       12.00            6000.00
Concepto  C06     CEMENTO                         BULTO     8         350.00           2800.00
Concepto  C07     ARENA                           M3        3         400.00           1200.00
```

### **Ejemplo 2: Instalación Eléctrica**
```
TIPO      CLAVE   DESCRIPCIÓN                        UNIDAD    CANTIDAD  PRECIO UNITARIO  IMPORTE
Título    T01     INSTALACIÓN ELÉCTRICA RESIDENCIAL                 
Concepto  C01     TUBO CONDUIT GALVANIZADO 1/2"     ML        50        35.00            1750.00
Concepto  C02     CABLE THW 12 AWG                  ML        100       8.50             850.00
Concepto  C03     CONTACTOS Y APAGADORES            PIEZA     10        120.00           1200.00
Concepto  C04     TABLERO ELECTRICO                PIEZA     1         2500.00          2500.00
Título    T02     MANO DE OBRA                                       
Concepto  C05     INSTALADOR ELECTRICISTA           HORA      16        150.00           2400.00
Concepto  C06     AYUDANTE GENERAL                 HORA      16        80.00            1280.00
```

---

## 🔧 **FORMATOS Y REGLAS**

### **Formatos de Celda en Excel:**
- **FECHA**: dd/mm/yyyy
- **CANTIDAD**: Número con decimales
- **PRECIO UNITARIO**: Moneda $#,##0.00
- **IMPORTE**: Moneda $#,##0.00
- **TEXTO**: General

### **Validaciones Importantes:**
1. **TIPO**: Debe ser exactamente "Título" o "Concepto"
2. **CLAVE**: No repetir claves
3. **UNIDAD**: Usar valores estándar
4. **CANTIDAD**: Mayor a cero
5. **PRECIO**: Mayor a cero

---

## 🚀 **PROCESO DE IMPORTACIÓN**

### **Pasos para Importar:**
1. **Descargar plantilla** de la web
2. **Llenar datos** en Excel
3. **Guardar como** .xlsx o .csv
4. **En el sistema**: Presupuestos → Importar Excel
5. **Seleccionar archivo** y cargar
6. **Revisar datos** antes de guardar
7. **Confirmar importación**

### **Validaciones del Sistema:**
- ✅ Formato de archivo válido
- ✅ Estructura de columnas correcta
- ✅ Datos obligatorios completos
- ✅ Cálculos automáticos correctos
- ✅ Cliente existente o nuevo
- ✅ Destinatario válido

---

## 📞 **SOPORTE**

### **Problemas Comunes:**
- **Error de formato**: Verificar que sea .xlsx o .csv
- **Columnas faltantes**: Usar plantilla original
- **Datos inválidos**: Revisar formatos de fecha y número
- **Cliente no encontrado**: El sistema creará uno nuevo

### **Contacto para Ayuda:**
- **Email**: constru_fe@hotmail.com
- **Teléfono**: (667)718 3885
- **Soporte técnico**: Disponible de 9:00 a 18:00 hrs

---

## 📄 **RESUMEN**

La plantilla Excel permite:
- ✅ Importación masiva de presupuestos
- ✅ Estructura organizada con títulos
- ✅ Cálculos automáticos
- ✅ Validación de datos
- ✅ Ahorro de tiempo significativo

**¡Listo para usar! Descarga la plantilla y comienza a crear presupuestos más rápido.**