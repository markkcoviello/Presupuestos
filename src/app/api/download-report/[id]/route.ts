// --- CÓDIGO FINAL Y COMPLETO para: src/app/api/download-report/[id]/route.ts ---

import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // 1. Obtenemos los datos del presupuesto
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

  // Definimos la URL base (tu dominio de Vercel)
  const host = process.env.VERCEL_URL
    ? `https://presupuestos-seven.vercel.app` // Tu dominio real
    : 'http://localhost:3000';
    
  // Esta es la URL de la página "molde" que Puppeteer visitará
  const url = `${host}/reporte/${id}`;
  
  // Esta es la URL de tu imagen de fondo
  const backgroundImageUrl = `${host}/membrete.png`; // Asegúrate que el nombre en /public/ sea correcto

  try {
    // 2. Lanzamos el navegador robot
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    
    // 3. Visitamos la página "molde"
    await page.goto(url, {
      waitUntil: 'networkidle0',
    });

    // 4. ¡LA MAGIA! Creamos la plantilla del fondo
    // Esta plantilla se inyectará en CADA página.
    const pageTemplate = `
      <style>
        html { -webkit-print-color-adjust: exact; } /* Forza la impresión de fondos */
        body { margin: 0; padding: 0; } /* Quita márgenes por defecto */
        img.background {
          position: absolute;
          top: 0;
          left: 0;
          width: 21.59cm;  /* Tamaño Carta */
          height: 27.94cm; /* Tamaño Carta */
          z-index: -1;
        }
      </style>
      <img class="background" src="${backgroundImageUrl}" />
    `;

    // 5. Generamos el PDF
    const pdfBuffer = await page.pdf({
      format: 'Letter',       // Tamaño Carta
      printBackground: true,  // Imprime el fondo
      
      // --- LA SOLUCIÓN A LOS MÁRGENES ---
      displayHeaderFooter: true, // ¡Activa la plantilla!
      headerTemplate: pageTemplate,  // Pone el fondo en el encabezado
      footerTemplate: "<div></div>", // Pie de página vacío (el fondo ya lo cubre)
      
      // Márgenes FÍSICOS del papel.
      // Aquí definimos tu "área de escritura"
      margin: {
        top: '3.5cm',     // Tu margen superior (donde termina el logo)
        bottom: '4cm',    // Tu margen inferior (donde empieza el footer de la imagen)
        left: '2cm',
        right: '2cm',
      },
    });

    // 6. Cerramos el robot
    await browser.close();

    // 7. Creamos el nombre de archivo (corregido)
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

    // 8. Enviamos el PDF
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
    if (browser) {
      await browser.close();
    }
  }
}