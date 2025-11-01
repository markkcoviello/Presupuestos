// --- CÓDIGO COMPLETO Y CORREGIDO para: src/app/reporte/[id]/page.tsx ---

import { db } from '@/lib/db'; 
import { notFound } from 'next/navigation';
import styles from './reporte.module.css'; 
import { Budget, Client, Recipient } from '@prisma/client';

/* --- (Tus tipos y funciones getBudgetData y formatCurrency se mantienen igual) --- */
type Concept = { /* ... */ };
type BudgetData = Budget & { /* ... */ };
async function getBudgetData(id: string) {
  const budget = await db.budget.findUnique({
    where: { id: id },
    include: {
      client: true, 
      recipient: true,
      // NO debe haber 'concepts: true' aquí
    },
  });

  if (!budget) {
    notFound(); // Si no lo encuentra, debería mostrar una página 404
  }
  return budget;
}

export default async function ReportePage({ params }: { params: { id: string } }) {
  const budget = await getBudgetData(params.id) as BudgetData; 
  const concepts = budget.concepts;

  return (
    <main className={styles.reportPage}>
      <img 
        src="/membrete.png" 
        className={styles.background} 
        alt="Membrete" 
      />
      <div className={styles.content}>
        
        {/* --- ENCABEZADO --- */}
        <header className={styles.header}>...</header>

        {/* --- DESCRIPCIÓN --- */}
        <section className={styles.description}>...</section>

        {/* --- TABLA DE CONCEPTOS --- */}
        <table className={styles.table}>...</table>

        {/* --- TOTALES --- */}
        <footer className={styles.footer}>...</footer>

        {/* --- EL ESPACIADOR YA NO ES NECESARIO, POR LO TANTO LO ELIMINAMOS --- */}
        {/* <div className={styles.pageBottomSpacer}></div> */}

      </div>
    </main>
  );
}