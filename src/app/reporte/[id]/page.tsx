// --- CÓDIGO FINAL Y COMPLETO para: src/app/reporte/[id]/page.tsx ---

import { db } from '@/lib/db'; 
import { notFound } from 'next/navigation';
import styles from './reporte.module.css'; 
import { Budget, Client, Recipient } from '@prisma/client';
import { db } from '@/lib/db'; 
import { notFound } from 'next/navigation';
import styles from './reporte.module.css'; 
import { Budget, Client, Recipient } from '@prisma/client';

/* --- 1. Definimos los tipos de datos --- */
type Concept = {
  id: string;
  key: string;
  type: 'title' | 'concept';
  title?: string;
  description?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  total: number;
};

type BudgetData = Budget & {
  client: Client;
  recipient: Recipient;
};

/* --- 2. FUNCIÓN PARA OBTENER LOS DATOS (¡ESTA ES LA PARTE FALTANTE!) --- */
async function getBudgetData(id: string) {
  const budget = await db.budget.findUnique({
    where: { id: id },
    include: {
      client: true, 
      recipient: true,
    },
  });

  if (!budget) {
    notFound();
  }
  return budget;
}

/* --- 3. Formateador de Moneda --- */
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '';
  return value.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });
};

/* --- 4. El Componente del Reporte --- */
export default async function ReportePage({ params }: { params: { id: string } }) {
  const budget = await getBudgetData(params.id) as BudgetData; // Aquí es donde se usa la función
  const concepts = budget.concepts as Concept[];

// ... (tus tipos de datos y funciones getBudgetData y formatCurrency se mantienen igual) ...

/* --- 4. El Componente del Reporte (El "Molde") --- */
export default async function ReportePage({ params }: { params: { id: string } }) {
  const budget = await getBudgetData(params.id) as BudgetData; 
  const concepts = budget.concepts as Concept[];

  return (
    <main className={styles.reportPage}>
      <img 
        src="/membrete.png" 
        className={styles.background} 
        alt="Membrete" 
      />
      <div className={styles.content}>
        
        {/* --- ENCABEZADO --- */}
        <header className={styles.header}>
          {/* ... (tu código del header) ... */}
        </header>

        {/* --- DESCRIPCIÓN --- */}
        <section className={styles.description}>
          {/* ... (tu código de la descripción) ... */}
        </section>

        {/* --- TABLA DE CONCEPTOS --- */}
        <table className={styles.table}>
          {/* ... (tu código de la tabla) ... */}
        </table>

        {/* --- TOTALES --- */}
        <footer className={styles.footer}>
          {/* ... (tu código del footer) ... */}
        </footer>

        {/* --- AQUÍ AGREGAMOS EL ESPACIADOR --- */}
        <div className={styles.pageBottomSpacer}></div>

      </div>
    </main>
  );
}