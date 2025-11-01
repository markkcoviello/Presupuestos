// --- CÓDIGO COMPLETO Y CORREGIDO para: src/app/reporte/[id]/page.tsx ---

import { db } from '@/lib/db'; 
import { notFound } from 'next/navigation';
import styles from './reporte.module.css'; 
import { Budget, Client, Recipient } from '@prisma/client';

/* --- (Tus tipos y funciones getBudgetData y formatCurrency se mantienen igual) --- */
type Concept = { /* ... */ };
type BudgetData = Budget & { /* ... */ };
async function getBudgetData(id: string) { /* ... */ }
const formatCurrency = (value: number | null | undefined) => { /* ... */ };

/* --- Componente del Reporte --- */
export default async function ReportePage({ params }: { params: { id: string } }) {
  const budget = await getBudgetData(params.id) as BudgetData; 
  const concepts = budget.concepts;

  return (
    <>
      {/* --- BOTÓN DE IMPRIMIR --- */}
      <div style={{ padding: '20px', textAlign: 'center', '@media print': { display: 'none' } }}>
        <button onClick={() => window.print()}>
          Imprimir Reporte
        </button>
      </div>

      {/* --- CONTENEDOR PRINCIPAL --- */}
      <main className={styles.reportPage}>
        <div className={styles.content}>
          
          {/* --- ENCABEZADO --- */}
          <header className={styles.header}>
            {/* ... (tu código del header va aquí sin cambios) ... */}
          </header>

          {/* --- DESCRIPCIÓN --- */}
          <section className={styles.description}>...</section>

          {/* --- TABLA DE CONCEPTOS --- */}
          <table className={styles.table}>...</table>

          {/* --- TOTALES --- */}
          <footer className={styles.footer}>...</footer>

        </div>
      </main>
    </>
  );
}