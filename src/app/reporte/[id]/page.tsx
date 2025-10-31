// src/app/reporte/[id]/page.tsx (VERSIÓN LIMPIA Y DEFINITIVA)

import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import styles from './reporte.module.css';
import { Budget, Client, Recipient } from '@prisma/client';

// ... (tus tipos Concept y BudgetData se mantienen igual) ...
type Concept = { /* ... */ };
type BudgetData = Budget & { /* ... */ };

async function getBudgetData(id: string) { /* ... */ }
const formatCurrency = (value: number | null | undefined) => { /* ... */ };

export default async function ReportePage({ params }: { params: { id: string } }) {
  const budget = await getBudgetData(params.id) as BudgetData;
  const concepts = budget.concepts as Concept[];

  return (
    <main className={styles.reportPage}>
      <img src="/membrete.png" className={styles.background} alt="Membrete" />
      <div className={styles.content}>
        
        {/* ... (Tu código de header, description y table va aquí sin cambios) ... */}
        <header className={styles.header}>...</header>
        <section className={styles.description}>...</section>
        <table className={styles.table}>...</table>
        <footer className={styles.footer}>...</footer>

        {/* --- ESTE ES EL ESPACIADOR CLAVE --- */}
        <div className={styles.pageBottomSpacer}></div>

      </div>
    </main>
  );
}