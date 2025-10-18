# 🔗 API DE INTEGRACIÓN JASPER REPORTS - CONSTRU-FE

## 📋 **ENDPOINTS DISPONIBLES**

### **1. Obtener Datos para Reporte Jasper**
```http
POST /api/reports/budget-pdf
Content-Type: application/json

{
  "budgetId": "123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "presupuesto": { ... },
    "cliente": { ... },
    "destinatario": { ... },
    "conceptos": [ ... ],
    "empresa": { ... },
    "ingeniero": { ... }
  },
  "message": "Data prepared for Jasper Reports"
}
```

---

## 🌐 **OPCIONES DE INTEGRACIÓN**

### **Opción 1: Jasper Reports Server (Recomendado)**
- **Ventajas**: Profesional, escalable, multiusuario
- **Requiere**: Servidor dedicado
- **Costo**: Community Edition (Gratis)

### **Opción 2: Java Spring Boot API**
- **Ventajas**: Control total, personalización completa
- **Requiere**: Conocimientos de Java
- **Costo**: Desarrollo propio

### **Opción 3: Python Flask/FastAPI**
- **Ventajas**: Simple, rápido de implementar
- **Requiere**: Python + JasperReports
- **Costo**: Desarrollo propio

---

## 🐍 **Opción 3: Python Flask API (Más Simple)**

### **Instalación de Dependencias:**
```bash
pip install flask jasperreports pyjniu
```

### **Código Python (`app.py`):**
```python
from flask import Flask, request, jsonify, send_file
import jasperreports
import os
from datetime import datetime

app = Flask(__name__)

@app.route('/api/reports/generate-pdf', methods=['POST'])
def generate_pdf():
    try:
        data = request.get_json()
        
        # Compilar el reporte Jasper
        jasper_file = "reports/PresupuestoCONSTRUFE.jasper"
        output_file = f"output/presupuesto_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        # Parámetros del reporte
        parameters = {
            "BUDGET_ID": data["presupuesto"]["id"],
            "EMPRESA_NOMBRE": data["empresa"]["nombre"],
            "EMPRESA_RFC": data["empresa"]["rfc"],
            "EMPRESA_DIRECCION": data["empresa"]["direccion"],
            "EMPRESA_CIUDAD": data["empresa"]["ciudad"],
            "EMPRESA_TELEFONO": data["empresa"]["telefono"],
            "EMPRESA_CELULAR": data["empresa"]["celular"],
            "EMPRESA_EMAIL": data["empresa"]["email"],
            "EMPRESA_SLOGAN": data["empresa"]["slogan"],
            "INGENIERO_NOMBRE": data["ingeniero"]["nombre"],
            "INGENIERO_CARGO": data["ingeniero"]["cargo"],
            "INGENIERO_CELULAR": data["ingeniero"]["celular"],
            "INGENIERO_TELEFONO": data["ingeniero"]["telefono"],
            "INGENIERO_EMAIL": data["ingeniero"]["email"],
            "LOGO_PATH": "reports/logo-constru-fe.png"
        }
        
        # Conexión a la base de datos
        conn = jasperreports.db(
            "org.sqlite.JDBC",
            "jdbc:sqlite:../db/constru_fe.db",
            "",
            ""
        )
        
        # Generar el reporte
        jasper_print = jasperreports.fill(
            jasper_file,
            parameters,
            conn
        )
        
        # Exportar a PDF
        jasperreports.export(
            jasper_print,
            output_file,
            "pdf"
        )
        
        return send_file(output_file, as_attachment=True)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

---

## ☕ **Opción 2: Java Spring Boot API**

### **Estructura del Proyecto Java:**
```
jasper-api/
├── src/
│   ├── main/
│   │   ├── java/com/constru/fe/
│   │   │   ├── JasperApiApplication.java
│   │   │   ├── controller/
│   │   │   │   └── ReportController.java
│   │   │   ├── service/
│   │   │   │   └── ReportService.java
│   │   │   └── model/
│   │   │       └── BudgetData.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── reports/
│   │           ├── PresupuestoCONSTRUFE.jrxml
│   │           ├── PresupuestoCONSTRUFE.jasper
│   │           └── logo-constru-fe.png
└── pom.xml
```

### **Controller Java:**
```java
@RestController
@RequestMapping("/api/reports")
public class ReportController {
    
    @Autowired
    private ReportService reportService;
    
    @PostMapping("/generate-pdf")
    public ResponseEntity<byte[]> generatePDF(@RequestBody Map<String, Object> data) {
        try {
            byte[] pdfBytes = reportService.generatePDF(data);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "presupuesto.pdf");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
```

---

## 🔧 **CONFIGURACIÓN DE NEXT.JS**

### **Modificar el Frontend para usar Jasper:**

```typescript
// src/lib/jasper-api.ts
const JASPER_API_URL = process.env.NEXT_PUBLIC_JASPER_API_URL || 'http://localhost:5000';

export interface JasperBudgetData {
  presupuesto: {
    id: number;
    folio: string;
    description: string;
    date: string;
    subtotal: number;
    ivaAmount: number;
    total: number;
  };
  cliente: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  destinatario: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  conceptos: Array<{
    quantity: number;
    description: string;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  empresa: {
    nombre: string;
    rfc: string;
    direccion: string;
    ciudad: string;
    telefono: string;
    celular: string;
    email: string;
    slogan: string;
  };
  ingeniero: {
    nombre: string;
    cargo: string;
    celular: string;
    telefono: string;
    email: string;
  };
}

export const generateJasperPDF = async (budgetId: string): Promise<void> => {
  try {
    // 1. Obtener datos del presupuesto
    const response = await fetch('/api/reports/budget-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budgetId })
    });
    
    if (!response.ok) {
      throw new Error('Error getting budget data');
    }
    
    const { data } = await response.json();
    
    // 2. Enviar a Jasper API
    const jasperResponse = await fetch(`${JASPER_API_URL}/api/reports/generate-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!jasperResponse.ok) {
      throw new Error('Error generating PDF with Jasper');
    }
    
    // 3. Descargar el PDF
    const blob = await jasperResponse.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRESUPUESTO_${data.presupuesto.folio}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
  } catch (error) {
    console.error('Error generating Jasper PDF:', error);
    throw error;
  }
};
```

### **Actualizar el Botón de Descarga:**

```typescript
// src/components/budget-actions.tsx
import { generateJasperPDF } from '@/lib/jasper-api';

export function BudgetActions({ budgetId }: { budgetId: string }) {
  const handleDownloadPDF = async () => {
    try {
      await generateJasperPDF(budgetId);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Mostrar error al usuario
    }
  };
  
  return (
    <Button onClick={handleDownloadPDF} variant="outline">
      <Download className="h-4 w-4 mr-2" />
      Descargar PDF
    </Button>
  );
}
```

---

## 📁 **ESTRUCTURA DE ARCHIVOS PARA GITHUB**

### **Repositorio GitHub:**
```
constru-fe-system/
├── frontend/                 # Next.js
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── jasper-reports/           # Tu reporte Jasper
│   ├── PresupuestoCONSTRUFE.jrxml
│   ├── PresupuestoCONSTRUFE.jasper
│   ├── logo-constru-fe.png
│   └── database/
│       └── constru_fe.db
├── api/                      # API Python/Java (opcional)
│   ├── app.py               # Python Flask
│   ├── requirements.txt
│   └── reports/
└── docs/
    ├── jasper-reports-estructura.md
    ├── jasper-integration-api.md
    └── README.md
```

---

## 🚀 **PASOS PARA SUBIR A GITHUB**

### **1. Preparar el Repositorio:**
```bash
# Crear repositorio
git init
git add .
git commit -m "Initial commit: CONSTRU-FE Budget System"

# Conectar a GitHub
git remote add origin https://github.com/tu-usuario/constru-fe-system.git
git push -u origin main
```

### **2. Subir el Reporte Jasper:**
```bash
# Agregar archivos de Jasper
git add jasper-reports/
git commit -m "Add Jasper Reports template"
git push origin main
```

### **3. Documentación:**
```bash
# Agregar documentación
git add docs/
git commit -m "Add documentation for Jasper integration"
git push origin main
```

---

## 🔧 **CONFIGURACIÓN AMBIENTE**

### **Variables de Entorno (.env.local):**
```env
# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_JASPER_API_URL=http://localhost:5000

# Base de datos
DATABASE_URL=file:./db/constru_fe.db
```

### **Docker Compose (Opcional):**
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_JASPER_API_URL=http://jasper-api:5000
    
  jasper-api:
    build: ./api
    ports:
      - "5000:5000"
    volumes:
      - ./jasper-reports:/app/reports
      - ./frontend/db:/app/db
```

---

## ✅ **FLUJO COMPLETO DE INTEGRACIÓN**

### **1. Usuario hace clic en "Descargar PDF"**
```
Next.js → API Interna → Jasper API → PDF Generado → Descarga
```

### **2. Flujo de Datos:**
```
1. Frontend solicita datos del presupuesto
2. API Next.js consulta SQLite y formatea datos
3. Datos se envían a Jasper API
4. Jasper compila el reporte con los datos
5. PDF se genera y devuelve al frontend
6. Navegador descarga el PDF
```

---

## 🧪 **PRUEBAS DE INTEGRACIÓN**

### **1. Probar API Interna:**
```bash
curl -X POST http://localhost:3000/api/reports/budget-pdf \
  -H "Content-Type: application/json" \
  -d '{"budgetId": "1"}'
```

### **2. Probar Jasper API:**
```bash
curl -X POST http://localhost:5000/api/reports/generate-pdf \
  -H "Content-Type: application/json" \
  -d @test-data.json
```

### **3. Probar Frontend:**
1. Abrir http://localhost:3000
2. Crear un presupuesto
3. Hacer clic en "Descargar PDF"
4. Verificar que se descargue el PDF

---

## 📞 **SOPORTE Y MANTENIMIENTO**

### **Monitoreo:**
- Logs de la API Next.js
- Logs de Jasper API
- Errores de generación de PDF

### **Actualizaciones:**
- Actualizar plantilla Jasper
- Actualizar API cuando cambie la BD
- Mantener documentación actualizada

---

## 🎯 **RESUMEN FINAL**

### **¿Qué tienes que hacer?**

1. **Crear tu reporte** en JasperSoft Studio con la estructura que te di
2. **Subir el reporte** (.jrxml y .jasper) a una carpeta en GitHub
3. **Elegir una opción de API** (Python Flask recomendado por simplicidad)
4. **Configurar la integración** en Next.js
5. **Probar el flujo completo**
6. **Subir todo a GitHub**

### **Lo que yo ya preparé:**
- ✅ API Next.js que entrega datos formateados
- ✅ Estructura completa de base de datos
- ✅ Documentación detallada
- ✅ Ejemplos de integración
- ✅ Sistema preparado para GitHub

**¿Quieres que te ayude con algún paso específico o tienes dudas sobre cómo proceder?**