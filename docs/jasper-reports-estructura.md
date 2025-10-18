# 📊 ESTRUCTURA COMPLETA PARA JASPER REPORTS - CONSTRU-FE

## 🗄️ **ESQUEMA DE BASE DE DATOS**

### **Tabla Principal: `budgets`**
```sql
CREATE TABLE budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    folio VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    date DATETIME NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    ivaAmount DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    clientId INTEGER NOT NULL,
    recipientId INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clientId) REFERENCES clients(id),
    FOREIGN KEY (recipientId) REFERENCES recipients(id)
);
```

**Campos importantes para Jasper:**
- `id` - ID del presupuesto
- `folio` - Número de folio (ej: "5796")
- `description` - Descripción del proyecto
- `date` - Fecha del presupuesto
- `subtotal` - Subtotal sin IVA
- `ivaAmount` - Monto del IVA (16%)
- `total` - Total con IVA

---

### **Tabla: `clients`**
```sql
CREATE TABLE clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Campos para Jasper:**
- `name` - Nombre del cliente
- `email` - Email del cliente
- `phone` - Teléfono del cliente
- `address` - Dirección del cliente

---

### **Tabla: `recipients`**
```sql
CREATE TABLE recipients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Campos para Jasper:**
- `name` - Nombre del destinatario (ATENCIÓN)
- `email` - Email del destinatario
- `phone` - Teléfono del destinatario
- `address` - Dirección del destinatario

---

### **Tabla: `concepts`**
```sql
CREATE TABLE concepts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    budgetId INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    description TEXT NOT NULL,
    unit VARCHAR(50) DEFAULT 'SERVICIO',
    unitPrice DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) DEFAULT 'concept',
    title VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budgetId) REFERENCES budgets(id) ON DELETE CASCADE
);
```

**Campos para Jasper:**
- `quantity` - Cantidad
- `description` - Descripción del concepto
- `unit` - Unidad (SERVICIO, PIEZA, M2, etc.)
- `unitPrice` - Precio unitario
- `total` - Importe total (quantity * unitPrice)
- `type` - Tipo ('concept' o 'title')
- `title` - Título si es tipo 'title'

---

## 🔗 **RELACIONES ENTRE TABLAS**

```
clients (1) ←→ (N) budgets (1) ←→ (N) concepts
              ↑
              |
          recipients (1)
```

---

## 📋 **CONSULTA SQL PARA JASPER REPORTS**

### **Consulta Principal para el Reporte:**
```sql
SELECT 
    b.id as budget_id,
    b.folio,
    b.description as budget_description,
    b.date as budget_date,
    b.subtotal,
    b.ivaAmount,
    b.total,
    b.createdAt as budget_created,
    
    c.id as client_id,
    c.name as client_name,
    c.email as client_email,
    c.phone as client_phone,
    c.address as client_address,
    
    r.id as recipient_id,
    r.name as recipient_name,
    r.email as recipient_email,
    r.phone as recipient_phone,
    r.address as recipient_address,
    
    co.id as concept_id,
    co.quantity,
    co.description as concept_description,
    co.unit,
    co.unitPrice,
    co.total as concept_total,
    co.type as concept_type,
    co.title as concept_title
    
FROM budgets b
LEFT JOIN clients c ON b.clientId = c.id
LEFT JOIN recipients r ON b.recipientId = r.id
LEFT JOIN concepts co ON b.id = co.budgetId
WHERE b.id = $P{BUDGET_ID}
ORDER BY co.id
```

---

## 🎯 **PARÁMETROS PARA JASPER REPORTS**

### **Parámetros de Entrada:**
```xml
<parameter name="BUDGET_ID" class="java.lang.Long"/>
<parameter name="EMPRESA_NOMBRE" class="java.lang.String"/>
<parameter name="EMPRESA_RFC" class="java.lang.String"/>
<parameter name="EMPRESA_DIRECCION" class="java.lang.String"/>
<parameter name="EMPRESA_CIUDAD" class="java.lang.String"/>
<parameter name="EMPRESA_TELEFONO" class="java.lang.String"/>
<parameter name="EMPRESA_CELULAR" class="java.lang.String"/>
<parameter name="EMPRESA_EMAIL" class="java.lang.String"/>
<parameter name="EMPRESA_SLOGAN" class="java.lang.String"/>
<parameter name="INGENIERO_NOMBRE" class="java.lang.String"/>
<parameter name="INGENIERO_CARGO" class="java.lang.String"/>
<parameter name="INGENIERO_CELULAR" class="java.lang.String"/>
<parameter name="INGENIERO_TELEFONO" class="java.lang.String"/>
<parameter name="INGENIERO_EMAIL" class="java.lang.String"/>
<parameter name="LOGO_PATH" class="java.lang.String"/>
```

---

## 📊 **CAMPOS (FIELDS) PARA JASPER REPORTS**

### **Campos del Presupuesto:**
```xml
<field name="budget_id" class="java.lang.Long"/>
<field name="folio" class="java.lang.String"/>
<field name="budget_description" class="java.lang.String"/>
<field name="budget_date" class="java.sql.Timestamp"/>
<field name="subtotal" class="java.math.BigDecimal"/>
<field name="ivaAmount" class="java.math.BigDecimal"/>
<field name="total" class="java.math.BigDecimal"/>
<field name="budget_created" class="java.sql.Timestamp"/>
```

### **Campos del Cliente:**
```xml
<field name="client_id" class="java.lang.Long"/>
<field name="client_name" class="java.lang.String"/>
<field name="client_email" class="java.lang.String"/>
<field name="client_phone" class="java.lang.String"/>
<field name="client_address" class="java.lang.String"/>
```

### **Campos del Destinatario:**
```xml
<field name="recipient_id" class="java.lang.Long"/>
<field name="recipient_name" class="java.lang.String"/>
<field name="recipient_email" class="java.lang.String"/>
<field name="recipient_phone" class="java.lang.String"/>
<field name="recipient_address" class="java.lang.String"/>
```

### **Campos de Conceptos:**
```xml
<field name="concept_id" class="java.lang.Long"/>
<field name="quantity" class="java.lang.Integer"/>
<field name="concept_description" class="java.lang.String"/>
<field name="unit" class="java.lang.String"/>
<field name="unitPrice" class="java.math.BigDecimal"/>
<field name="concept_total" class="java.math.BigDecimal"/>
<field name="concept_type" class="java.lang.String"/>
<field name="concept_title" class="java.lang.String"/>
```

---

## 🏗️ **VARIABLES PARA CÁLCULOS**

### **Variables Automáticas:**
```xml
<variable name="SUBTOTAL_TOTAL" class="java.math.BigDecimal" calculation="Sum">
    <variableExpression><![CDATA[$F{concept_total}]]></variableExpression>
</variable>

<variable name="IVA_CALCULADO" class="java.math.BigDecimal">
    <variableExpression><![CDATA[$V{SUBTOTAL_TOTAL}.multiply(new BigDecimal(0.16))]]></variableExpression>
</variable>

<variable name="TOTAL_FINAL" class="java.math.BigDecimal">
    <variableExpression><![CDATA[$V{SUBTOTAL_TOTAL}.add($V{IVA_CALCULADO})]]></variableExpression>
</variable>

<variable name="CONCEPT_COUNT" class="java.lang.Integer" calculation="Count">
    <variableExpression><![CDATA[$F{concept_id}]]></variableExpression>
</variable>
```

---

## 🎨 **GRUPOS PARA REPORTES**

### **Grupo por Presupuesto:**
```xml
<group name="BudgetGroup">
    <groupExpression><![CDATA[$F{budget_id}]]></groupExpression>
    <groupHeader>
        <band height="50">
            <!-- Encabezado del presupuesto -->
        </band>
    </groupHeader>
    <groupFooter>
        <band height="30">
            <!-- Totales del presupuesto -->
        </band>
    </groupFooter>
</group>
```

---

## 📄 **SECCIONES DEL REPORTE**

### **1. Title (Título)**
- Logo de CONSTRU-FE
- Nombre de la empresa
- Información de contacto

### **2. Page Header (Encabezado de página)**
- Fecha del presupuesto
- Título del proyecto
- Datos del destinatario
- Número de folio

### **3. Column Header (Encabezado de columnas)**
- CANTIDAD
- CONCEPTO
- UNIDAD
- P.U.
- IMPORTE

### **4. Detail (Detalle)**
- Lista de conceptos
- Filas con colores alternados

### **5. Column Footer (Pie de columnas)**
- Subtotal
- IVA (16%)
- Total

### **6. Page Footer (Pie de página)**
- Firma del ingeniero
- Número de página
- Pie de página de la empresa

---

## 🔧 **CONFIGURACIÓN DE CONEXIÓN**

### **JDBC Connection Settings:**
- **Driver**: org.sqlite.JDBC
- **URL**: jdbc:sqlite:./db/constru_fe.db
- **Username**: (vacío)
- **Password**: (vacío)

---

## 📝 **EJEMPLO DE DATOS PARA PRUEBA**

### **Datos de Prueba:**
```sql
-- Insertar cliente
INSERT INTO clients (name, email, phone, address) VALUES 
('COMPRAS ARCA CONTAL', 'compras@arca.com', '(667)123-4567', 'Dirección del cliente');

-- Insertar destinatario
INSERT INTO recipients (name, email, phone, address) VALUES 
('COMPRAS ARCA CONTAL', 'compras@arca.com', '(667)123-4567', 'Dirección del destinatario');

-- Insertar presupuesto
INSERT INTO budgets (folio, description, date, subtotal, ivaAmount, total, clientId, recipientId) VALUES 
('5796', 'INSTALACION DE VALVULA EN TUBERÍA EN CISTERNA', '2025-10-15', 4950.00, 792.00, 5742.00, 1, 1);

-- Insertar conceptos
INSERT INTO concepts (budgetId, quantity, description, unit, unitPrice, total) VALUES 
(1, 1, 'RETIRO DE TUBERÍA E INSTALACIÓN DE NIPLE, "T" Y VALVULA DE ACERO INOXIDABLE EN TUBERÍA DE 1/2" EN CISTERNA, INCLUYE MAT Y MO', 'SERVICIO', 4950.00, 4950.00);
```

---

## 🚀 **PASOS PARA CREAR EL REPORTE EN JASPER**

### **1. Crear Conexión a la Base de Datos**
1. **Database Connections → New Connection**
2. **Driver**: SQLite
3. **URL**: jdbc:sqlite:./db/constru_fe.db
4. **Test Connection**

### **2. Crear Reporte**
1. **File → New → Jasper Report**
2. **Template**: Blank A4
3. **Name**: PresupuestoCONSTRUFE
4. **Finish**

### **3. Configurar Query**
1. **Dataset and Query Dialog**
2. **SQL Query**: Pegar la consulta principal
3. **Read Fields**
4. **OK**

### **4. Diseñar el Reporte**
1. **Arrastrar campos** al diseño
2. **Configurar parámetros**
3. **Ajustar formato**
4. **Preview**

---

## 📥 **INTEGRACIÓN CON NEXT.JS**

### **API Endpoint:**
```
POST /api/reports/budget-pdf
Body: { budgetId: "123" }
Response: { success: true, data: {...} }
```

### **Formato de Respuesta:**
```json
{
  "success": true,
  "data": {
    "presupuesto": {
      "id": 1,
      "folio": "5796",
      "description": "INSTALACION DE VALVULA...",
      "date": "2025-10-15T00:00:00.000Z",
      "subtotal": 4950.00,
      "ivaAmount": 792.00,
      "total": 5742.00
    },
    "cliente": {
      "name": "COMPRAS ARCA CONTAL",
      "email": "compras@arca.com",
      "phone": "(667)123-4567"
    },
    "destinatario": {
      "name": "COMPRAS ARCA CONTAL",
      "email": "compras@arca.com",
      "phone": "(667)123-4567"
    },
    "conceptos": [
      {
        "quantity": 1,
        "description": "RETIRO DE TUBERÍA...",
        "unit": "SERVICIO",
        "unitPrice": 4950.00,
        "total": 4950.00
      }
    ],
    "empresa": {
      "nombre": "CONSTRU-FE",
      "rfc": "GOTM5611245W5",
      "direccion": "Tulipán #22, Col. 10 de Mayo, C.P. 80270",
      "ciudad": "Culiacán de Rosales, Culiacán, Sinaloa",
      "telefono": "(667)718 3885",
      "celular": "(667)154 4098",
      "email": "constru_fe@hotmail.com",
      "slogan": "CONSTRUIRLO ES POSIBLE"
    },
    "ingeniero": {
      "nombre": "Ing. Francisco José Coviello Marcano",
      "cargo": "Director General",
      "celular": "(667)154 4098",
      "telefono": "(667)718 3885",
      "email": "constru_fe@hotmail.com"
    }
  }
}
```

---

## ✅ **CHECKLIST FINAL**

### **Para tu Reporte Jasper:**
- [ ] Conexión a base de datos SQLite configurada
- [ ] Query SQL funcionando con todos los campos
- [ ] Parámetros definidos correctamente
- [ ] Campos (fields) mapeados
- [ ] Variables de cálculo configuradas
- [ ] Diseño responsive y profesional
- [ ] Logo CONSTRU-FE integrado
- [ ] Colores corporativos (rojo #DC2626, azul #3B82F6)
- [ ] Vista previa funcionando
- [ ] Exportación a PDF funcionando

### **Para la Integración:**
- [ ] API respondiendo datos correctos
- [ ] Formato JSON válido
- [ ] Todos los campos incluidos
- [ ] Tipos de datos correctos
- [ ] Fechas en formato ISO

¡Listo! Con esta estructura puedes crear tu reporte en Jasper Reports y conectarlo perfectamente con el sistema.