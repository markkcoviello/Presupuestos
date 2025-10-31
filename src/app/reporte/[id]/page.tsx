// --- CÓDIGO FINAL Y COMPLETO para: src/app/reporte/[id]/page.tsx ---

import { db } from '@/lib/db'; 
import { notFound } from 'next/navigation';
import styles from './reporte.module.css'; 
import { Budget, Client, Recipient } from '@prisma/client';

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