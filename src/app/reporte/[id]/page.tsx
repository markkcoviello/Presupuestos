// --- VERSIÓN DE PRUEBA para: src/app/reporte/[id]/page.tsx ---

export default function ReportePage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>¡Página de Reporte Encontrada!</h1>
      <p>El ID del presupuesto es: {params.id}</p>
      <button onClick={() => window.print()}>
        Imprimir Reporte
      </button>
    </div>
  );
}