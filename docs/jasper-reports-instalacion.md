# 📋 Guía Completa: Jasper Reports para CONSTRU-FE

## 🚀 Paso 1: Instalación de Java (Requisito previo)

### Verificar si tienes Java instalado:
```bash
# Abrir terminal/cmd y ejecutar:
java -version
javac -version
```

### Si no tienes Java, descárgalo:
1. **Enlace oficial**: https://www.java.com/download/
2. **Versión recomendada**: Java 17 LTS
3. **Descargar**: "Windows Offline (64-bit)"
4. **Instalar**: Ejecutar el instalador → Siguiente → Siguiente → Instalar → Finalizar

---

## 📥 Paso 2: Descargar JasperSoft Studio

### Enlaces directos de descarga:
- **Página oficial**: https://community.jaspersoft.com/project/jaspersoft-studio
- **Descarga directa**: https://sourceforge.net/projects/jaspersoftstudiocommunity/files/

### Versión recomendada:
- **Archivo**: `TIBCOJaspersoftStudio-6.21.3-win32.x86_64.exe`
- **Tamaño**: ~300MB
- **Requisitos**: Windows 10/11, 2GB RAM, 500MB espacio

---

## 🔧 Paso 3: Instalación de JasperSoft Studio

### Pasos de instalación:
1. **Ejecutar el instalador descargado**
2. **Seleccionar idioma**: English (o español si está disponible)
3. **Aceptar términos de licencia**
4. **Elegir ruta de instalación**: `C:\Program Files\TIBCO\Jaspersoft Studio-6.21.3`
5. **Seleccionar componentes**: 
   - ✅ JasperSoft Studio
   - ✅ Sample Reports
   - ✅ Drivers JDBC (MySQL, PostgreSQL)
6. **Crear acceso directo** en el escritorio
7. **Finalizar instalación**

---

## 🎯 Paso 4: Configuración Inicial

### Primer inicio:
1. **Abrir JasperSoft Studio** desde el acceso directo
2. **Seleccionar workspace**: `C:\JaspersoftWorkspace`
3. **Esperar carga inicial** (puede tardar 1-2 minutos)

### Configurar idioma español:
1. **Help → Eclipse Marketplace**
2. **Buscar**: "Spanish Language Pack"
3. **Install → Restart**

---

## 🏗️ Paso 5: Crear Plantilla CONSTRU-FE

### 5.1 Nuevo Proyecto
1. **File → New → Project**
2. **Seleccionar**: "Jasper Report Project"
3. **Nombre del proyecto**: `CONSTRUFE_REPORTS`
4. **Finalizar**

### 5.2 Nueva Plantilla de Presupuesto
1. **File → New → Jasper Report**
2. **Template**: "Blank A4" (plantilla en blanco)
3. **Nombre**: `PresupuestoCONSTRUFE.jrxml`
4. **Finalizar**

---

## 🎨 Paso 6: Diseño de la Plantilla

### 6.1 Configurar página:
- **Orientation**: Portrait
- **Size**: A4 (210x297mm)
- **Margins**: 15mm todos los lados

### 6.2 Estructura de secciones:
```
Title:     Logo y título del presupuesto
Page Header: Fecha y folio
Column Header: Encabezados de tabla
Detail:     Conceptos del presupuesto
Column Footer: Subtotales
Page Footer: Firma y página
```

### 6.3 Parámetros del reporte:
```xml
<parameter name="LOGO_PATH" class="java.lang.String"/>
<parameter name="EMPRESA_NOMBRE" class="java.lang.String"/>
<parameter name="EMPRESA_RFC" class="java.lang.String"/>
<parameter name="CLIENTE_NOMBRE" class="java.lang.String"/>
<parameter name="PRESUPUESTO_FOLIO" class="java.lang.String"/>
<parameter name="PRESUPUESTO_FECHA" class="java.lang.String"/>
<parameter name="PRESUPUESTO_TOTAL" class="java.math.BigDecimal"/>
```

### 6.4 Campos de datos:
```xml
<field name="cantidad" class="java.lang.Integer"/>
<field name="concepto" class="java.lang.String"/>
<field name="unidad" class="java.lang.String"/>
<field name="precioUnitario" class="java.math.BigDecimal"/>
<field name="importe" class="java.math.BigDecimal"/>
```

---

## 🖼️ Paso 7: Diseño Visual

### 7.1 Logo CONSTRU-FE:
1. **Arrastrar componente "Image"** a la sección Title
2. **Expression**: `$P{LOGO_PATH}`
3. **Scale Image**: Retain Proportions
4. **Size**: 150px x 75px

### 7.2 Información de la empresa:
```
CONSTRU-FE
MARICELA GONZALEZ TOLOSA
RFC: GOTM5611245W5
Tulipán #22, Col. 10 de Mayo, C.P. 80270
Culiacán de Rosales, Culiacán, Sinaloa
CEL. (667)154 4098
TEL. (667)718 3885
```

### 7.3 Tabla de conceptos:
| Columna | Ancho | Alineación |
|---------|-------|------------|
| Cantidad | 40px | Center |
| Concepto | Auto | Left |
| Unidad | 50px | Center |
| P.U. | 60px | Right |
| Importe | 60px | Right |

### 7.4 Colores CONSTRU-FE:
- **Primario**: #DC2626 (Rojo)
- **Secundario**: #3B82F6 (Azul)
- **Texto**: #000000 (Negro)
- **Filo**: #F5F5F5 (Gris claro)

---

## 💾 Paso 8: Guardar y Compilar

### Guardar plantilla:
1. **File → Save** (Ctrl+S)
2. **Ubicación**: `C:\JaspersoftWorkspace\CONSTRUFE_REPORTS\`
3. **Nombre**: `PresupuestoCONSTRUFE.jrxml`

### Compilar plantilla:
1. **Right click sobre el archivo .jrxml**
2. **Compile Report**
3. **Se generará**: `PresupuestoCONSTRUFE.jasper`

---

## 🧪 Paso 9: Probar la Plantilla

### Vista previa:
1. **Right click sobre el archivo .jrxml**
2. **Preview**
3. **Seleccionar fuente de datos**: "Empty Data Source"
4. **Ingresar datos de prueba**

### Datos de prueba:
```
Folio: 5796
Fecha: 15/10/2025
Cliente: COMPRAS ARCA CONTAL
Concepto: RETIRO DE TUBERÍA E INSTALACIÓN DE NIPLE, "T" Y VÁLVULA DE ACERO INOXIDABLE
Cantidad: 1
Unidad: SERVICIO
P.U.: $4,950.00
Importe: $4,950.00
IVA: $792.00
Total: $5,742.00
```

---

## 🔗 Paso 10: Integración con Next.js

### 10.1 Crear API Java (Spring Boot):
```java
@RestController
@RequestMapping("/api/reports")
public class ReportController {
    
    @PostMapping("/generate-pdf")
    public ResponseEntity<byte[]> generatePDF(@RequestBody ReportRequest request) {
        try {
            // Cargar plantilla compilada
            JasperReport report = JasperCompileManager.compileReport(
                "path/to/PresupuestoCONSTRUFE.jrxml"
            );
            
            // Crear fuente de datos
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(
                request.getConceptos()
            );
            
            // Parámetros del reporte
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("LOGO_PATH", "path/to/logo.png");
            parameters.put("EMPRESA_NOMBRE", "CONSTRU-FE");
            // ... otros parámetros
            
            // Generar PDF
            JasperPrint print = JasperFillManager.fillReport(
                report, parameters, dataSource
            );
            
            byte[] pdfBytes = JasperExportManager.exportReportToPdf(print);
            
            return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=presupuesto.pdf")
                .body(pdfBytes);
                
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
```

### 10.2 Llamar desde Next.js:
```typescript
const generatePDF = async (budgetId: string) => {
  try {
    const response = await fetch('http://localhost:8080/api/reports/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budgetId })
    });
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presupuesto-${budgetId}.pdf`;
    a.click();
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
```

---

## ✅ Verificación Final

### Checklist de instalación:
- [ ] Java 17+ instalado
- [ ] JasperSoft Studio funcionando
- [ ] Plantilla CONSTRU-FE creada
- [ ] Logo configurado
- [ ] Tabla de conceptos diseñada
- [ ] Vista previa funcionando
- [ ] Archivo .jasper compilado

### Prueba final:
1. **Generar PDF de prueba**
2. **Verificar logo CONSTRU-FE**
3. **Validar formato de tabla**
4. **Confirmar cálculos de totales**
5. **Revisar firma del ingeniero**

---

## 🆘 Soporte y Recursos

### Enlaces útiles:
- **Documentación oficial**: https://community.jaspersoft.com/documentation
- **Foros de ayuda**: https://community.jaspersoft.com/forums
- **Tutoriales YouTube**: https://www.youtube.com/c/JaspersoftCommunity
- **Plantillas de ejemplo**: https://github.com/Jaspersoft/jasperreports-samples

### Problemas comunes:
- **Error de Java**: Reinstalar JDK 17+
- **Logo no aparece**: Verificar ruta del archivo
- **PDF en blanco**: Revisar conexión de datos
- **Memoria insuficiente**: Aumentar -Xmx2048m

---

## 📞 Contacto para Ayuda

Si tienes problemas durante la instalación:
1. **Revisa los logs de JasperSoft Studio**
2. **Verifica la versión de Java**
3. **Confirma espacio en disco**
4. **Reinicia el equipo si es necesario**

¿Necesitas ayuda con algún paso específico de la instalación?