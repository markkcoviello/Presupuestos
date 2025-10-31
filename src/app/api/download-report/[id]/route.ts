// Código NUEVO y CORREGIDO para: src/app/api/download-report/[id]/route.ts

import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core'; // <--- 1. Cambiado de 'puppeteer' a 'puppeteer-core'
import chromium from '@sparticuz/chromium'; // <--- 2. Importamos el cromo ligero
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // --- Buscamos el folio y la descripción en la BD ---
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

  let browser;

  try {
    // --- 3. Esta es la nueva forma de lanzar el navegador en Vercel ---
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    // --- Fin del nuevo código de lanzamiento ---

    const page = await browser.newPage();

    // Determinamos la URL base (tu dominio de Vercel)
    const host = process.env.VERCEL_URL
      ? `https://presupuestos-seven.vercel.app` // Tu dominio real
      : 'http://localhost:3000';
      
    const url = `${host}/reporte/${id}`;
    
    await page.goto(url, {
      waitUntil: 'networkidle0',
    });

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
    });

    // Creamos el nombre del archivo
    const sanitizedDescription = (budget.description || 'sin-descripcion')
      .replace(/[\/\\?%*:|"<>]/g, '-')
      .substring(0, 50);

    const filename = `${budget.folio}-${sanitizedDescription}.pdf`;

    // 4. Enviamos el PDF
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
  } finally {
    // 5. Cerramos el navegador (muy importante)
    if (browser) {
      await browser.close();
    }
  }
}