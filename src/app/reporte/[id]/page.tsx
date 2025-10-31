// Código NUEVO Y COMPLETO para: src/app/reporte/[id]/page.tsx

import { db } from '@/lib/db'; 
import { notFound } from 'next/navigation';
import styles from './reporte.module.css'; // Usaremos este CSS

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

/* --- 2. Función para obtener los datos --- */
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

/* --- 4. El Componente del Reporte (El "Molde") --- */
export default async function ReportePage({ params }: { params: { id: string } }) {
  const budget = await getBudgetData(params.id);
  
  const concepts = budget.concepts as Concept[];

  return (
    // CONTENEDOR PRINCIPAL
    <main className={styles.reportPage}>

      {/* AQUÍ ESTÁ LA IMAGEN QUE VOLVIMOS A AGREGAR.
        Está FUERA del div de "content".
      */}
      <img 
        src="/membrete.png" // (Asegúrate que el nombre en /public/ sea correcto)
        className={styles.background} 
        alt="Membrete" 
      />

      {/* ESTE DIV ES SÓLO PARA EL CONTENIDO (TEXTO).
        Tiene el padding para que no choque con los bordes.
      */}
      <div className={styles.content}>
        
        {/* --- ENCABEZADO (CLIENTE, FOLIO, FECHA) --- */}
        <header className={styles.header}>
          <div className={styles.atencion}>
            <span className={styles.label}>ATENCIÓN</span>
            <span>{budget.client.name}</span>
          </div>
          <div className={styles.folio}>
            <div style={{ fontWeight: 'bold', fontSize: '11px' }}>
              <span>COTIZACIÓN</span>
              <span style={{ marginLeft: '10px' }}>{budget.folio}</span>
            </div>
            <div style={{ marginTop: '4px', fontSize: '12px' }}>
              <span>{new Date(budget.date).toLocaleDateString('es-MX', { timeZone: 'UTC' })}</span>
            </div>
          </div>
        </header>

        {/* --- DESCRIPCIÓN --- */}
        <section className={styles.description}>
          <span>{budget.description}</span>
        </section>

        {/* --- TABLA DE CONCEPTOS --- */}
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
            {concepts.map((concept) =>
              concept.type === 'title' ? (
                <tr key={concept.id} className={styles.titleRow}>
                  <td><b>{concept.key}</b></td>
                  <td colSpan={5}><b>{concept.title}</b></td>
                </tr>
              ) : (
                <tr key={concept.id} className={styles.conceptRow}>
                  <td>{concept.key}</td>
                  <td>{concept.description}</td>
                  <td>{concept.unit}</td>
                  <td>{concept.quantity}</td>
                  <td>{formatCurrency(concept.unitPrice)}</td>
                  <td>{formatCurrency(concept.total)}</td>
                </tr>
              )
            )}
          </tbody>
        </table>

        {/* --- TOTALES --- */}
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