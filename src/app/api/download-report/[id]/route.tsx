import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import ReactDOMServer from 'react-dom/server';
// La importación de un componente React ahora funciona correctamente en un archivo .tsx
import PresupuestoPDF from '@/components/PresupuestoPDF';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const presupuesto = await prisma.budget.findUnique({
      where: { id: parseInt(id) },
      include: { conceptos: true },
    });

    if (!presupuesto) {
      return new NextResponse('Presupuesto no encontrado', { status: 404 });
    }

    // Ahora TypeScript entiende esta sintaxis JSX
    const html = ReactDOMServer.renderToString(
      <PresupuestoPDF presupuesto={presupuesto} />
    );

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Presupuesto - ${presupuesto.folio}</title>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    // --- PARÁMETROS CORREGIDOS PARA PDFSHIFT ---
    const pdfParams = {
      source: fullHtml,
      filename: `presupuesto-${presupuesto.folio}.pdf`,
      // MÁRGENES CORREGIDOS: Se usa un solo parámetro "margin" con el formato "top right bottom left".
      // Esto resuelve el error "Rogue field".
      margin: "25mm 20mm 25mm 20mm", 
      format: "A4",
      landscape: false,
      // IMPORTANTE: Forzar a PDFShift a usar los estilos de pantalla (@media screen) en lugar de los de impresión (@media print).
      // Esto es crucial para que la imagen de fondo y otros colores se rendericen correctamente.
      usePrintMedia: false, 
      auth: {
        api_key: process.env.PDFSHIFT_API_KEY,
      },
    };

    const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pdfParams),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error de PDFShift:', errorData);
      throw new Error(`Error al generar el PDF con PDFShift: ${errorData.message || JSON.stringify(errorData.errors)}`);
    }

    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pdfParams.filename}"`,
      },
    });

  } catch (error) {
    console.error('Error al generar el PDF:', error);
    return new NextResponse((error as Error).message, { status: 500 });
  }
}