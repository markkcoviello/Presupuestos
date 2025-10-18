# Guía de Importación de Presupuestos desde Excel

## Descripción General

El sistema de CONSTRU-FE ahora permite importar presupuestos desde archivos Excel o CSV, facilitando la carga masiva de datos y ahorrando tiempo en la creación manual de presupuestos.

## Características Principales

- ✅ Soporte para archivos `.xlsx`, `.xls` y `.csv`
- ✅ Validación automática de datos
- ✅ Creación automática de clientes y destinatarios
- ✅ Cálculo automático de totales (subtotal, IVA 16%, total)
- ✅ Generación automática de folio único
- ✅ Plantilla descargable para formato correcto
- ✅ Interfaz intuitiva con indicadores de progreso

## Formato del Archivo

### Columnas Requeridas

| Columna | Descripción | Ejemplo | Requerido |
|---------|-------------|---------|-----------|
| Tipo | Tipo de concepto ("concept" o "título") | concept | Sí |
| Clave | Código identificador del concepto | 001 | Sí |
| Descripción | Descripción del concepto o título | INSTALACIÓN DE VALVULA | Sí |
| Unidad | Unidad de medida (solo para conceptos) | SERVICIO | No |
| Cantidad | Cantidad (solo para conceptos) | 1 | No |
| Precio Unitario | Precio por unidad (solo para conceptos) | 4950.00 | No |
| Total | Total calculado (cantidad × precio unitario) | 4950.00 | No |

### Tipos de Concepto

1. **concept**: Conceptos normales con cantidad y precio
2. **título**: Títulos de sección (solo descripción, sin valores monetarios)

## Ejemplo de Formato

```csv
Tipo,Clave,Descripción,Unidad,Cantidad,Precio Unitario,Total
concept,001,INSTALACIÓN DE VALVULA EN TUBERÍA EN CISTERNA,SERVICIO,1,4950.00,4950.00
concept,002,MANO DE OBRA ESPECIALIZADA,SERVICIO,1,1500.00,1500.00
título,001,MATERIALES Y EQUIPO,,0,0,0
concept,003,VALVULA DE ACERO INOXIDABLE 1/2",PIEZA,1,2500.00,2500.00
concept,004,NIPLE DE 1/2" ROSCADO,PIEZA,2,150.00,300.00
concept,005,"T" DE CONEXIÓN DE 1/2",PIEZA,1,200.00,200.00
```

## Proceso de Importación

### 1. Descargar Plantilla

1. Ve a la sección "Crear Presupuesto"
2. Haz clic en el botón "Descargar Plantilla"
3. Guarda el archivo `plantilla_presupuesto.csv` en tu computadora

### 2. Preparar Datos

1. Abre la plantilla en Excel o tu editor de CSV preferido
2. Completa los datos siguiendo el formato especificado
3. Asegúrate de que todos los campos requeridos estén completos
4. Guarda el archivo

### 3. Importar Archivo

1. En la sección "Crear Presupuesto", haz clic en "Seleccionar archivo"
2. Elige tu archivo Excel o CSV
3. Haz clic en "Importar Presupuesto"
4. Espera a que se complete el proceso
5. El sistema te redirigirá automáticamente al presupuesto creado

## Validaciones Automáticas

El sistema valida automáticamente:

- ✅ Formato de archivo correcto
- ✅ Estructura de columnas requeridas
- ✅ Datos numéricos válidos
- ✅ Cantidades mayores a cero
- ✅ Precios unitarios no negativos
- ✅ Descripciones no vacías

## Comportamiento del Sistema

### Clientes y Destinatarios

- Si el cliente no existe, se crea automáticamente con los datos básicos
- Si el destinatario no existe, se crea asociado al cliente correspondiente
- Los nombres por defecto son "CLIENTE IMPORTADO" y "DESTINATARIO IMPORTADO"

### Cálculos

- **Subtotal**: Suma de todos los conceptos tipo "concept"
- **IVA**: 16% del subtotal (configurable)
- **Total**: Subtotal + IVA

### Folio

- Se genera automáticamente un folio único consecutivo
- Formato: 4 dígitos con ceros a la izquierda (0001, 0002, etc.)

## Mensajes de Error Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Tipo de archivo no válido" | Archivo no es .xlsx, .xls o .csv | Usa un formato compatible |
| "El archivo está vacío" | Archivo sin datos | Asegúrate de tener al menos una fila de datos |
| "Datos inválidos" | Estructura incorrecta | Verifica que todas las columnas requeridas estén presentes |
| "La descripción es requerida" | Campo vacío | Completa todas las descripciones |

## Mejores Prácticas

1. **Usa la plantilla**: Siempre descarga la plantilla actualizada
2. **Verifica datos**: Revisa que los valores numéricos sean correctos
3. **Sé consistente**: Usa el mismo formato para todos tus archivos
4. **Prueba primero**: Importa un archivo pequeño de prueba antes de lotes grandes
5. **Backup**: Mantén copias de seguridad de tus archivos originales

## Soporte Técnico

Si encuentras problemas durante la importación:

1. Verifica el formato de tu archivo
2. Revisa los mensajes de error específicos
3. Intenta con un archivo más simple
4. Contacta al administrador del sistema si el problema persiste

---

**Nota**: Esta función está diseñada para mejorar la eficiencia en la creación de presupuestos. Si necesitas importar datos complejos con clientes y destinatarios específicos, considera crearlos primero en el sistema y luego asociarlos durante la importación.