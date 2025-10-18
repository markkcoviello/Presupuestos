# 🏗️ CONSTRU-FE - Sistema de Presupuestos

## 📋 **Descripción**

Sistema completo de gestión de presupuestos para CONSTRU-FE, empresa de construcción especializada en proyectos civiles y obras. El sistema permite crear, gestionar y exportar presupuestos profesionales con integración a Jasper Reports para generación de PDFs.

## 🚀 **Características Principales**

- ✅ **Gestión de Clientes y Destinatarios**
- ✅ **Creación de Presupuestos con Múltiples Conceptos**
- ✅ **Cálculos Automáticos (Subtotal, IVA 16%, Total)**
- ✅ **Integración con Jasper Reports para PDFs Profesionales**
- ✅ **Base de Datos SQLite Local**
- ✅ **Interfaz Moderna con Next.js y Tailwind CSS**
- ✅ **Diseño Responsivo**
- ✅ **Sistema de Folios Automáticos**

## 🛠️ **Tecnologías Utilizadas**

### **Frontend:**
- **Next.js 15** con App Router
- **TypeScript 5**
- **Tailwind CSS 4**
- **shadcn/ui** componentes
- **Zustand** para estado
- **Prisma** ORM

### **Backend:**
- **Next.js API Routes**
- **SQLite** base de datos
- **Prisma Client**

### **Reportes:**
- **JasperSoft Studio** para diseño de reportes
- **Jasper Reports Engine** para generación de PDFs
- **Python Flask** (API opcional para Jasper)

## 📁 **Estructura del Proyecto**

```
constru-fe/
├── src/
│   ├── app/                    # App Router Next.js
│   │   ├── api/               # API Routes
│   │   ├── budgets/           # Páginas de presupuestos
│   │   ├── clients/           # Páginas de clientes
│   │   └── globals.css
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes shadcn/ui
│   │   └── ...
│   ├── lib/                   # Utilidades
│   │   ├── db.ts             # Base de datos
│   │   └── ...
│   └── hooks/                 # Custom hooks
├── prisma/
│   ├── schema.prisma         # Esquema de BD
│   └── migrations/
├── public/                   # Archivos estáticos
├── docs/                     # Documentación
│   ├── jasper-reports-estructura.md
│   ├── jasper-integration-api.md
│   └── jasper-reports-instalacion.md
└── db/                       # Base de datos SQLite
```

## 🚀 **Instalación y Configuración**

### **Requisitos Previos:**
- Node.js 18+
- npm o yarn
- Java 17+ (para Jasper Reports)
- JasperSoft Studio

### **1. Clonar el Repositorio:**
```bash
git clone https://github.com/tu-usuario/constru-fe.git
cd constru-fe
```

### **2. Instalar Dependencias:**
```bash
npm install
```

### **3. Configurar Base de Datos:**
```bash
npx prisma generate
npx prisma db push
```

### **4. Iniciar Desarrollo:**
```bash
npm run dev
```

### **5. Abrir Aplicación:**
Visitar http://localhost:3000

## 📊 **Base de Datos**

### **Tablas Principales:**

#### **`budgets`** - Presupuestos
- `id` - Identificador único
- `folio` - Número de folio (ej: "5796")
- `description` - Descripción del proyecto
- `date` - Fecha del presupuesto
- `subtotal` - Subtotal sin IVA
- `ivaAmount` - Monto del IVA (16%)
- `total` - Total con IVA
- `clientId` - ID del cliente
- `recipientId` - ID del destinatario

#### **`clients`** - Clientes
- `id` - Identificador único
- `name` - Nombre del cliente
- `email` - Email
- `phone` - Teléfono
- `address` - Dirección

#### **`recipients`** - Destinatarios
- `id` - Identificador único
- `name` - Nombre del destinatario
- `email` - Email
- `phone` - Teléfono
- `address` - Dirección

#### **`concepts`** - Conceptos del Presupuesto
- `id` - Identificador único
- `budgetId` - ID del presupuesto
- `quantity` - Cantidad
- `description` - Descripción
- `unit` - Unidad (SERVICIO, PIEZA, etc.)
- `unitPrice` - Precio unitario
- `total` - Importe total

## 📄 **Generación de PDFs con Jasper Reports**

### **1. Diseñar el Reporte:**
1. Abrir JasperSoft Studio
2. Crear nuevo reporte "Blank A4"
3. Usar la consulta SQL de `docs/jasper-reports-estructura.md`
4. Diseñar el layout con logo CONSTRU-FE
5. Compilar y exportar como `.jasper`

### **2. Integrar con el Sistema:**
1. Colocar archivos `.jrxml` y `.jasper` en la carpeta de reportes
2. Configurar API de Jasper (Python Flask o Java Spring)
3. Actualizar variables de entorno
4. Probar integración

### **3. Flujo de Generación:**
```
Usuario → Next.js → API Datos → Jasper API → PDF → Descarga
```

## 🔧 **Configuración de Jasper Reports**

### **API Endpoints:**

#### **Obtener Datos del Presupuesto:**
```http
POST /api/reports/budget-pdf
Content-Type: application/json

{
  "budgetId": "123"
}
```

#### **Generar PDF (Jasper API):**
```http
POST /api/reports/generate-pdf
Content-Type: application/json

{
  "presupuesto": {...},
  "cliente": {...},
  "conceptos": [...],
  "empresa": {...},
  "ingeniero": {...}
}
```

## 🎨 **Diseño y Estilos**

### **Colores Corporativos CONSTRU-FE:**
- **Primario**: `#DC2626` (Rojo)
- **Secundario**: `#3B82F6` (Azul)
- **Texto**: `#000000` (Negro)
- **Fondo**: `#FFFFFF` (Blanco)

### **Componentes Principales:**
- **BudgetCard** - Tarjeta de presupuesto
- **ConceptTable** - Tabla de conceptos
- **ClientForm** - Formulario de cliente
- **BudgetActions** - Acciones del presupuesto

## 📱 **Uso de la Aplicación**

### **1. Gestión de Clientes:**
- Navegar a `/clients`
- Crear nuevo cliente
- Editar información existente
- Ver presupuestos asociados

### **2. Creación de Presupuestos:**
- Navegar a `/budgets`
- Hacer clic en "Nuevo Presupuesto"
- Seleccionar cliente y destinatario
- Agregar conceptos
- Revisar totales automáticos
- Guardar presupuesto

### **3. Generación de PDFs:**
- Abrir presupuesto existente
- Hacer clic en "Descargar PDF"
- Se genera PDF profesional con Jasper Reports
- Archivo se descarga automáticamente

## 🔄 **Flujo de Trabajo**

### **Crear Presupuesto:**
1. **Nuevo Presupuesto** → Datos básicos
2. **Seleccionar Cliente** → Existente o nuevo
3. **Agregar Conceptos** → Cantidad, descripción, precio
4. **Revisar Totales** → Subtotal, IVA, Total
5. **Guardar** → Se asigna folio automáticamente
6. **Exportar PDF** → Descargar reporte profesional

### **Gestión de Clientes:**
1. **Clientes** → Lista completa
2. **Nuevo Cliente** → Formulario de registro
3. **Editar** → Actualizar información
4. **Ver Presupuestos** → Historial completo

## 🚀 **Despliegue**

### **Opciones de Despliegue:**

#### **1. Vercel (Recomendado para Next.js):**
```bash
npm run build
vercel --prod
```

#### **2. Docker:**
```bash
docker build -t constru-fe .
docker run -p 3000:3000 constru-fe
```

#### **3. Servidor Propio:**
```bash
npm run build
npm run start
```

## 📊 **Monitoreo y Logs**

### **Logs de la Aplicación:**
```bash
# Ver logs de desarrollo
npm run dev

# Ver logs de producción
npm run start
```

### **Base de Datos:**
```bash
# Ver datos SQLite
sqlite3 db/constru_fe.db
.tables
SELECT * FROM budgets;
```

## 🛠️ **Mantenimiento**

### **Actualizaciones:**
1. **Dependencias**: `npm update`
2. **Base de datos**: `npx prisma db push`
3. **Reportes**: Actualizar plantillas Jasper

### **Respaldo:**
```bash
# Respaldo de base de datos
cp db/constru_fe.db backup/constru_fe_$(date +%Y%m%d).db

# Respaldo de reportes
cp -r reports/ backup/reports_$(date +%Y%m%d)/
```

## 🤝 **Contribución**

### **Flujo de Trabajo:**
1. Fork del repositorio
2. Crear rama de feature
3. Hacer cambios
4. Crear Pull Request
5. Revisión y merge

### **Estándares de Código:**
- Usar TypeScript para todo el código nuevo
- Seguir convenciones de ESLint
- Componentes reutilizables
- Comentarios descriptivos

## 📞 **Soporte y Contacto**

### **Documentación:**
- `docs/jasper-reports-estructura.md` - Estructura para Jasper
- `docs/jasper-integration-api.md` - Integración API
- `docs/jasper-reports-instalacion.md` - Guía de instalación

### **Contacto CONSTRU-FE:**
- **Email**: constru_fe@hotmail.com
- **Teléfono**: (667)718 3885
- **Celular**: (667)154 4098
- **Dirección**: Tulipán #22, Col. 10 de Mayo, C.P. 80270

### **Desarrollador:**
- **GitHub**: [Tu GitHub]
- **Email**: [Tu Email]

## 📄 **Licencia**

Este proyecto es propiedad de CONSTRU-FE y está licenciado bajo términos comerciales.

---

## 🎯 **Próximos Pasos**

### **Mejoras Planeadas:**
- [ ] Módulo de facturación
- [ ] Sistema de pagos
- [ ] Panel de estadísticas
- [ ] Aplicación móvil
- [ ] Integración con contabilidad

### **Reportes Adicionales:**
- [ ] Reporte de ventas mensual
- [ ] Reporte de clientes activos
- [ ] Reporte de proyectos por estado
- [ ] Reporte financiero

---

**¡Gracias por usar CONSTRU-FE Budget System! 🏗️**