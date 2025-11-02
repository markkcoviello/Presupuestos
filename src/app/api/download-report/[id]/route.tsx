// src/app/api/download-report/[id]/route.tsx

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generatePdfHtml } from '@/lib/pdf-generator';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  // --- VALIDACIÓN CORREGIDA PARA IDs DE TIPO STRING (CUID) ---
  // Verificamos que el 'id' exista y no sea una cadena vacía.
  if (!id || id.trim() === '') {
    console.error("Error: El parámetro 'id' no fue proporcionado o está vacío.");
    return new NextResponse('Falta el ID del presupuesto en la URL.', { status: 400 }); // 400 Bad Request
  }

  try {
    // --- CAMBIO CLAVE ---
    // Usamos el 'id' directamente como una cadena de texto, sin convertirlo a número.
    const presupuesto = await prisma.budget.findUnique({
      where: { id: id }, // Prisma espera el ID como string
      include: { conceptos: true },
    });

    if (!presupuesto) {
      return new NextResponse('Presupuesto no encontrado', { status: 404 });
    }

    const html = generatePdfHtml(presupuesto);

    const pdfParams = {
      source: html,
      filename: `presupuesto-${presupuesto.folio}.pdf`,
      margin: "25mm 20mm 25mm 20mm", 
      format: "A4",
      landscape: false,
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