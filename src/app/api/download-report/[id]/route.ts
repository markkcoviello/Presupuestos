// src/app/api/download-report/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ReportePDF } from '@/components/ReportePDF'; // Importamos el nuevo componente
import { renderToBuffer } from '@react-pdf/renderer'; // Importamos el renderizador

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Obtenemos los datos (igual que antes)
  const budget = await db.budget.findUnique({
    where: { id: id },
    include: {
      client: true, 
      recipient: true,
    },
  });

  if (!budget) {
    return new NextResponse(JSON.stringify({ error: 'Presupuesto no encontrado' }), {
      status: 404,
    });
  }

  try {
    // 1. Renderizamos el componente PDF a un buffer
    const pdfBuffer = await renderToBuffer(<ReportePDF budget={budget} concepts={budget.concepts} />);

    // 2. Creamos el nombre del archivo
    const sanitize = (text: string) => {
      return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9 .-]/g, '_')
        .trim()
        .substring(0, 50);
    };
    const sanitizedDescription = sanitize(budget.description || 'sin-descripcion');
    const sanitizedFolio = sanitize(budget.folio);
    const filename = `${sanitizedFolio}-${sanitizedDescription}.pdf`;

    // 3. Enviamos el PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Error al generar el PDF con react-pdf:', error);
    return new NextResponse(JSON.stringify({ error: 'Error al generar el PDF' }), {
      status: 500,
    });
  }
}