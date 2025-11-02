// --- CÓDIGO FINAL Y DEFINITIVO para: src/app/api/download-report/[id]/route.ts ---

import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; 

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const budget = await db.budget.findUnique({
    where: { id: id },
    select: {
      folio: true,
      description: true,
    },
  });

  if (!budget) {
    return new NextResponse(JSON.stringify({ error: 'Presupuesto no encontrado' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const host = process.env.VERCEL_URL
      ? `https://presupuestos-seven.vercel.app`
      : 'http://localhost:3000';
    const reportUrl = `${host}/reporte/${id}`;

    const response = await fetch(reportUrl);
    let htmlContent = await response.text();

    // --- Inyectamos la imagen en Base64 ---
    // Pega aquí tu código Base64 completo (el mismo que para <img>)
    const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA..."; // <-- PEGA TU CÓIGO LARGO AQUÍ

    htmlContent = htmlContent.replace(
      "background: url('/membrete.png')",
      `background: url('${base64Image}')`
    );

    // --- Llamamos a PDFShift con los márgenes correctos ---
    const pdfShiftResponse = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`api:${process.env.PDFSHIFT_API_KEY}`).toString('base64')}`,
      },
      body: JSON.stringify({
        source: htmlContent,
        format: 'Letter',
        landscape: false,
        // --- ¡AÑADIMOS LOS MÁRGENES AQUÍ! ---
        margin_top: '3.5cm',
        margin_bottom: '3cm',
        margin_left: '2cm',
        margin_right: '2cm',
      }),
    });

    if (!pdfShiftResponse.ok) {
      const errorData = await pdfShiftResponse.json();
      console.error('Error de PDFShift:', errorData);
      throw new Error('Error al generar el PDF con PDFShift');
    }

    const pdfBuffer = await pdfShiftResponse.arrayBuffer();

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

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Error al generar el PDF:', error);
    return new NextResponse(JSON.stringify({ error: 'Error al generar el PDF' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}