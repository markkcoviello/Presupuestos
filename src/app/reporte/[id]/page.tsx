// --- CÓDIGO SIMPLIFICADO Y CORREGIDO para: src/app/reporte/[id]/page.tsx ---

import React from 'react';
import { db } from '@/lib/db'; 
import { notFound } from 'next/navigation';
import styles from './reporte.module.css';
import { Budget, Client, Recipient } from '@prisma/client';

/* --- Tipos de datos (sin cambios) --- */
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

/* --- Función para obtener los datos (sin cambios) --- */
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

/* --- Formateador de Moneda (sin cambios) --- */
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '';
  return value.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });
};

/* --- 4. El Componente del Reporte (SIMPLIFICADO) --- */
export default async function ReportePage({ params }: { params: { id: string } }) {
  const budget = await getBudgetData(params.id) as BudgetData;
  const concepts = budget.concepts as Concept[];
  
  // ¡YA NO NECESITAMOS LA LÓGICA DE SALTO DE PÁGINA!
  // El motor de PDF lo hará automáticamente gracias a @page.
  
  return (
    <main className={styles.reportPage}>
      <img 
        src="/membrete.png"
        className={styles.background} 
        alt="Membrete" 
      />
      <div className={styles.content}>
        
        <header className={styles.header}>
          <div className={styles.atencion}>
            <span className={styles.label}>ATENCIÓN</span>
            <span>{budget.client.name}</span>
          </div>
          <div className={styles.folio}>
            <div className={styles.folioLine}>
              <span>COTIZACIÓN</span>
              <span>{budget.folio}</span>
            </div>
            <div className={styles.dateLine}>
              <span>{new Date(budget.date).toLocaleDateString('es-MX', { timeZone: 'UTC' })}</span>
            </div>
          </div>
        </header>

        <section className={styles.description}>
          <span>{budget.description}</span>
        </section>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Concepto</th>
              <th>Unidad</th>
              <th>Cantidad</th>
              <th>P.U.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {/* Simplemente mapeamos los conceptos. Sin lógica extra. */}
            {concepts.map((concept) => (
              <React.Fragment key={concept.id}>
                {concept.type === 'title' ? (
                  <tr className={styles.titleRow}>
                    <td><b>{concept.key}</b></td>
                    <td colSpan={5}><b>{concept.title}</b></td>
                  </tr>
                ) : (
                  <tr className={styles.conceptRow}>
                    <td>{concept.key}</td>
                    <td>{concept.description}</td>
                    <td>{concept.unit}</td>
                    <td>{concept.quantity}</td>
                    <td>{formatCurrency(concept.unitPrice)}</td>
                    <td>{formatCurrency(concept.total)}</td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <footer className={styles.footer}>
          <div className={styles.totals}>
            <div>
              <span>Subtotal</span>
              <span>{formatCurrency(budget.subtotal)}</span>
            </div>
            <div>
              <span>I.V.A.16%</span>
              <span>{formatCurrency(budget.ivaAmount)}</span>
            </div>
            <div className={styles.grandTotal}>
              <span>TOTAL</span>
              <span>{formatCurrency(budget.total)}</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}