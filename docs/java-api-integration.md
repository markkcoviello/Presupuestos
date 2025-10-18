# 🚀 API Java Spring Boot para Jasper Reports + Next.js

## 📋 Requisitos Previos

### Software necesario:
- **Java 17+** (JDK)
- **Maven 3.6+**
- **IDE recomendado**: IntelliJ IDEA o Eclipse
- **PostgreSQL/MySQL** (base de datos)

---

## 🏗️ Paso 1: Crear Proyecto Spring Boot

### Opción A: Usar Spring Initializr (Web)
1. **Ir a**: https://start.spring.io/
2. **Configurar**:
   - Project: Maven
   - Language: Java
   - Spring Boot: 3.2.0
   - Group: `com.constru-fe`
   - Artifact: `report-api`
   - Name: `report-api`
   - Packaging: Jar
   - Java: 17

3. **Dependencias**:
   - Spring Web
   - Spring Data JPA
   - PostgreSQL Driver / MySQL Driver
   - Spring Boot DevTools

4. **Generate Project** → Descargar ZIP

### Opción B: Crear manualmente
```bash
# Crear estructura de directorios
mkdir constru-fe-report-api
cd constru-fe-report-api
mkdir -p src/main/java/com/constru/fe/reportapi
mkdir -p src/main/resources
mkdir -p src/test/java
```

---

## 📦 Paso 2: Configurar Dependencias Maven

### `pom.xml` completo:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>
    
    <groupId>com.constru-fe</groupId>
    <artifactId>report-api</artifactId>
    <version>1.0.0</version>
    <name>CONSTRU-FE Report API</name>
    <description>API para generar reportes de presupuestos CONSTRU-FE</description>
    
    <properties>
        <java.version>17</java.version>
        <jasper.version>6.21.3</jasper.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <!-- Base de Datos -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Jasper Reports -->
        <dependency>
            <groupId>net.sf.jasperreports</groupId>
            <artifactId>jasperreports</artifactId>
            <version>${jasper.version}</version>
        </dependency>
        
        <dependency>
            <groupId>net.sf.jasperreports</groupId>
            <artifactId>jasperreports-fonts</artifactId>
            <version>${jasper.version}</version>
        </dependency>
        
        <!-- Utilidades -->
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-lang3</artifactId>
        </dependency>
        
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>
        
        <!-- Desarrollo -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## ⚙️ Paso 3: Configurar Aplicación

### `src/main/resources/application.yml`:
```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  application:
    name: constru-fe-report-api
  
  datasource:
    url: jdbc:postgresql://localhost:5432/constru_fe
    username: postgres
    password: your_password
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect

# Configuración de reportes
reporting:
  templates:
    path: classpath:reports/
    logo-path: classpath:reports/logo-constru-fe.png
  
  cors:
    allowed-origins: http://localhost:3000
    allowed-methods: GET,POST,PUT,DELETE,OPTIONS
    allowed-headers: "*"
    allow-credentials: true

logging:
  level:
    com.constru.fe: DEBUG
    net.sf.jasperreports: INFO
```

---

## 🏛️ Paso 4: Crear Entidades

### `Budget.java`:
```java
package com.constru.fe.reportapi.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "budgets")
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "folio", unique = true, nullable = false)
    private String folio;
    
    @Column(name = "description", nullable = false)
    private String description;
    
    @Column(name = "date", nullable = false)
    private LocalDateTime date;
    
    @Column(name = "subtotal", nullable = false)
    private BigDecimal subtotal;
    
    @Column(name = "iva_amount", nullable = false)
    private BigDecimal ivaAmount;
    
    @Column(name = "total", nullable = false)
    private BigDecimal total;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private Recipient recipient;
    
    @OneToMany(mappedBy = "budget", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Concept> concepts;
    
    // Constructores, getters y setters
    public Budget() {}
    
    // Getters y setters...
}
```

### `Concept.java`:
```java
package com.constru.fe.reportapi.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "concepts")
public class Concept {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    
    @Column(name = "description", nullable = false)
    private String description;
    
    @Column(name = "unit", nullable = false)
    private String unit;
    
    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;
    
    @Column(name = "total", nullable = false)
    private BigDecimal total;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "budget_id", nullable = false)
    private Budget budget;
    
    // Constructores, getters y setters
    public Concept() {}
    
    // Getters y setters...
}
```

---

## 📄 Paso 5: Crear DTOs (Data Transfer Objects)

### `ReportRequest.java`:
```java
package com.constru.fe.reportapi.dto;

import java.util.List;

public class ReportRequest {
    private String budgetId;
    private String reportType;
    private ReportData data;
    
    public static class ReportData {
        private String empresaNombre;
        private String empresaRfc;
        private String empresaDireccion;
        private String empresaTelefono;
        private String empresaCelular;
        private String empresaEmail;
        private String clienteNombre;
        private String presupuestoFolio;
        private String presupuestoFecha;
        private String presupuestoDescripcion;
        private String presupuestoSubtotal;
        private String presupuestoIva;
        private String presupuestoTotal;
        private String ingenieroNombre;
        private String ingenieroCargo;
        private String ingenieroCelular;
        private String ingenieroTelefono;
        private String ingenieroEmail;
        private List<ConceptData> conceptos;
        
        // Getters y setters...
    }
    
    public static class ConceptData {
        private Integer cantidad;
        private String concepto;
        private String unidad;
        private String precioUnitario;
        private String importe;
        
        // Getters y setters...
    }
    
    // Getters y setters...
}
```

---

## 🗄️ Paso 6: Crear Repositorios

### `BudgetRepository.java`:
```java
package com.constru.fe.reportapi.repository;

import com.constru.fe.reportapi.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    
    @Query("SELECT b FROM Budget b JOIN FETCH b.client JOIN FETCH b.recipient JOIN FETCH b.concepts WHERE b.id = :id")
    Optional<Budget> findByIdWithDetails(@Param("id") Long id);
    
    @Query("SELECT b FROM Budget b JOIN FETCH b.client JOIN FETCH b.recipient JOIN FETCH b.concepts WHERE b.folio = :folio")
    Optional<Budget> findByFolioWithDetails(@Param("folio") String folio);
}
```

---

## 📊 Paso 7: Crear Servicio de Reportes

### `ReportService.java`:
```java
package com.constru.fe.reportapi.service;

import com.constru.fe.reportapi.dto.ReportRequest;
import com.constru.fe.reportapi.model.Budget;
import com.constru.fe.reportapi.repository.BudgetRepository;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@Service
public class ReportService {
    
    @Value("${reporting.templates.path}")
    private String templatesPath;
    
    @Value("${reporting.templates.logo-path}")
    private String logoPath;
    
    private final BudgetRepository budgetRepository;
    
    public ReportService(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }
    
    public byte[] generateBudgetPDF(String budgetId) throws Exception {
        // Buscar presupuesto con todos los detalles
        Budget budget = budgetRepository.findByIdWithDetails(Long.parseLong(budgetId))
            .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado"));
        
        // Cargar plantilla Jasper
        InputStream reportStream = new ClassPathResource("reports/PresupuestoCONSTRUFE.jasper").getInputStream();
        JasperReport jasperReport = (JasperReport) JRLoader.loadObject(reportStream);
        
        // Preparar parámetros
        Map<String, Object> parameters = prepareParameters(budget);
        
        // Crear fuente de datos para conceptos
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(budget.getConcepts());
        
        // Generar reporte
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);
        
        // Exportar a PDF
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        JasperExportManager.exportReportToPdfStream(jasperPrint, outputStream);
        
        return outputStream.toByteArray();
    }
    
    public byte[] generateBudgetPDFFromRequest(ReportRequest request) throws Exception {
        // Cargar plantilla Jasper
        InputStream reportStream = new ClassPathResource("reports/PresupuestoCONSTRUFE.jasper").getInputStream();
        JasperReport jasperReport = (JasperReport) JRLoader.loadObject(reportStream);
        
        // Preparar parámetros desde el request
        Map<String, Object> parameters = prepareParametersFromRequest(request);
        
        // Crear fuente de datos para conceptos
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(request.getData().getConceptos());
        
        // Generar reporte
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);
        
        // Exportar a PDF
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        JasperExportManager.exportReportToPdfStream(jasperPrint, outputStream);
        
        return outputStream.toByteArray();
    }
    
    private Map<String, Object> prepareParameters(Budget budget) throws Exception {
        Map<String, Object> parameters = new HashMap<>();
        
        // Logo
        ClassPathResource logoResource = new ClassPathResource("reports/logo-constru-fe.png");
        parameters.put("LOGO_PATH", logoResource.getURL().getPath());
        
        // Empresa
        parameters.put("EMPRESA_NOMBRE", "CONSTRU-FE");
        parameters.put("EMPRESA_RFC", "GOTM5611245W5");
        parameters.put("EMPRESA_DIRECCION", "Tulipán #22, Col. 10 de Mayo, C.P. 80270 - Culiacán de Rosales, Culiacán, Sinaloa");
        parameters.put("EMPRESA_TELEFONO", "(667)718 3885");
        parameters.put("EMPRESA_CELULAR", "(667)154 4098");
        parameters.put("EMPRESA_EMAIL", "constru_fe@hotmail.com");
        
        // Cliente y presupuesto
        parameters.put("CLIENTE_NOMBRE", budget.getRecipient().getName());
        parameters.put("PRESUPUESTO_FOLIO", budget.getFolio());
        parameters.put("PRESUPUESTO_FECHA", budget.getDate().toString());
        parameters.put("PRESUPUESTO_DESCRIPCION", budget.getDescription());
        parameters.put("PRESUPUESTO_SUBTOTAL", budget.getSubtotal());
        parameters.put("PRESUPUESTO_IVA", budget.getIvaAmount());
        parameters.put("PRESUPUESTO_TOTAL", budget.getTotal());
        
        // Ingeniero
        parameters.put("INGENIERO_NOMBRE", "Ing. Francisco José Coviello Marcano");
        parameters.put("INGENIERO_CARGO", "Director General");
        parameters.put("INGENIERO_CELULAR", "(667)154 4098");
        parameters.put("INGENIERO_TELEFONO", "(667)718 3885");
        parameters.put("INGENIERO_EMAIL", "constru_fe@hotmail.com");
        
        return parameters;
    }
    
    private Map<String, Object> prepareParametersFromRequest(ReportRequest request) throws Exception {
        Map<String, Object> parameters = new HashMap<>();
        ReportRequest.ReportData data = request.getData();
        
        // Logo
        ClassPathResource logoResource = new ClassPathResource("reports/logo-constru-fe.png");
        parameters.put("LOGO_PATH", logoResource.getURL().getPath());
        
        // Empresa
        parameters.put("EMPRESA_NOMBRE", data.getEmpresaNombre());
        parameters.put("EMPRESA_RFC", data.getEmpresaRfc());
        parameters.put("EMPRESA_DIRECCION", data.getEmpresaDireccion());
        parameters.put("EMPRESA_TELEFONO", data.getEmpresaTelefono());
        parameters.put("EMPRESA_CELULAR", data.getEmpresaCelular());
        parameters.put("EMPRESA_EMAIL", data.getEmpresaEmail());
        
        // Cliente y presupuesto
        parameters.put("CLIENTE_NOMBRE", data.getClienteNombre());
        parameters.put("PRESUPUESTO_FOLIO", data.getPresupuestoFolio());
        parameters.put("PRESUPUESTO_FECHA", data.getPresupuestoFecha());
        parameters.put("PRESUPUESTO_DESCRIPCION", data.getPresupuestoDescripcion());
        parameters.put("PRESUPUESTO_SUBTOTAL", new java.math.BigDecimal(data.getPresupuestoSubtotal()));
        parameters.put("PRESUPUESTO_IVA", new java.math.BigDecimal(data.getPresupuestoIva()));
        parameters.put("PRESUPUESTO_TOTAL", new java.math.BigDecimal(data.getPresupuestoTotal()));
        
        // Ingeniero
        parameters.put("INGENIERO_NOMBRE", data.getIngenieroNombre());
        parameters.put("INGENIERO_CARGO", data.getIngenieroCargo());
        parameters.put("INGENIERO_CELULAR", data.getIngenieroCelular());
        parameters.put("INGENIERO_TELEFONO", data.getIngenieroTelefono());
        parameters.put("INGENIERO_EMAIL", data.getIngenieroEmail());
        
        return parameters;
    }
}
```

---

## 🌐 Paso 8: Crear Controlador REST

### `ReportController.java`:
```java
package com.constru.fe.reportapi.controller;

import com.constru.fe.reportapi.dto.ReportRequest;
import com.constru.fe.reportapi.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = "${reporting.cors.allowed-origins}")
public class ReportController {
    
    private final ReportService reportService;
    
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }
    
    @PostMapping("/budget-pdf")
    public ResponseEntity<byte[]> generateBudgetPDF(@RequestBody ReportRequest request) {
        try {
            byte[] pdfBytes = reportService.generateBudgetPDFFromRequest(request);
            
            String filename = "PRESUPUESTO_" + request.getData().getPresupuestoFolio() + "_" + 
                            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(pdfBytes.length);
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/budget-pdf/{budgetId}")
    public ResponseEntity<byte[]> generateBudgetPDFById(@PathVariable String budgetId) {
        try {
            byte[] pdfBytes = reportService.generateBudgetPDF(budgetId);
            
            String filename = "PRESUPUESTO_" + budgetId + "_" + 
                            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(pdfBytes.length);
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("CONSTRU-FE Report API is running!");
    }
}
```

---

## 🚀 Paso 9: Clase Principal

### `ReportApiApplication.java`:
```java
package com.constru.fe.reportapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;

@SpringBootApplication
@CrossOrigin(origins = "*")
public class ReportApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReportApiApplication.class, args);
    }
}
```

---

## 📁 Paso 10: Estructura Final del Proyecto

```
constru-fe-report-api/
├── src/
│   ├── main/
│   │   ├── java/com/constru/fe/reportapi/
│   │   │   ├── ReportApiApplication.java
│   │   │   ├── controller/
│   │   │   │   └── ReportController.java
│   │   │   ├── service/
│   │   │   │   └── ReportService.java
│   │   │   ├── repository/
│   │   │   │   └── BudgetRepository.java
│   │   │   ├── model/
│   │   │   │   ├── Budget.java
│   │   │   │   ├── Concept.java
│   │   │   │   ├── Client.java
│   │   │   │   └── Recipient.java
│   │   │   └── dto/
│   │   │       └── ReportRequest.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── reports/
│   │           ├── PresupuestoCONSTRUFE.jrxml
│   │           ├── PresupuestoCONSTRUFE.jasper
│   │           └── logo-constru-fe.png
│   └── test/
├── pom.xml
└── README.md
```

---

## 🔧 Paso 11: Compilar y Ejecutar

### Compilar el proyecto:
```bash
# En la raíz del proyecto
mvn clean compile
```

### Ejecutar la API:
```bash
mvn spring-boot:run
```

### Verificar que funciona:
```bash
curl http://localhost:8080/api/reports/health
```

---

## 🔗 Paso 12: Integrar con Next.js

### Modificar el frontend para usar la nueva API:

```typescript
// src/lib/api.ts
const API_BASE_URL = 'http://localhost:8080/api';

export const generateBudgetPDF = async (budget: any, client: any, project: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/budget-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        budgetId: budget.id,
        reportType: 'budget',
        data: {
          empresaNombre: 'CONSTRU-FE',
          empresaRfc: 'GOTM5611245W5',
          empresaDireccion: 'Tulipán #22, Col. 10 de Mayo, C.P. 80270 - Culiacán de Rosales, Culiacán, Sinaloa',
          empresaTelefono: '(667)718 3885',
          empresaCelular: '(667)154 4098',
          empresaEmail: 'constru_fe@hotmail.com',
          clienteNombre: client?.name || 'CLIENTE',
          presupuestoFolio: budget.folio,
          presupuestoFecha: new Date().toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          presupuestoDescripcion: project?.description || 'PRESUPUESTO DE CONSTRUCCIÓN',
          presupuestoSubtotal: budget.subtotal.toString(),
          presupuestoIva: budget.tax.toString(),
          presupuestoTotal: budget.total.toString(),
          ingenieroNombre: 'Ing. Francisco José Coviello Marcano',
          ingenieroCargo: 'Director General',
          ingenieroCelular: '(667)154 4098',
          ingenieroTelefono: '(667)718 3885',
          ingenieroEmail: 'constru_fe@hotmail.com',
          conceptos: budget.concepts.map((concept: any) => ({
            cantidad: concept.quantity,
            concepto: concept.description,
            unidad: concept.unit || 'SERVICIO',
            precioUnitario: concept.unitPrice.toString(),
            importe: concept.total.toString()
          }))
        }
      })
    });

    if (!response.ok) {
      throw new Error('Error generating PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRESUPUESTO_${budget.folio}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
```

---

## ✅ Verificación Final

### Checklist:
- [ ] Proyecto Spring Boot creado
- [ ] Dependencias Jasper Reports configuradas
- [ ] Plantilla .jrxml copiada a resources/reports/
- [ ] Logo CONSTRU-FE copiado a resources/reports/
- [ ] API compilada y ejecutándose
- [ ] Endpoint /reports/health respondiendo
- [ ] Integración con Next.js funcionando

### Probar la integración completa:
1. **Iniciar API Java**: `mvn spring-boot:run`
2. **Iniciar Next.js**: `npm run dev`
3. **Crear presupuesto en la web**
4. **Hacer clic en descargar PDF**
5. **Verificar PDF generado con logo CONSTRU-FE**

¡Listo! Ahora tienes una solución profesional con Jasper Reports integrada con tu sistema Next.js.