// --- CÓDIGO FINAL Y COMPLETO para: src/app/api/download-report/[id]/route.ts ---

import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

// --- Función para leer la imagen y convertirla a Base64 ---
// Esto "incrusta" la imagen en el PDF y evita errores de carga.
const getBackgroundImage = () => {
  try {
    const imagePath = path.resolve('./public', 'membrete.png'); // Asegúrate que el nombre en /public/ sea correcto
    const imageBuffer = fs.readFileSync(imagePath);
    return `data:image/png;base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    console.error("Error leyendo la imagen de fondo:", error);
    return ''; // Devuelve vacío si falla, para que no se rompa el PDF
  }
};

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

  // 2. Obtenemos la imagen de fondo incrustada
  const imageBase64 = getBackgroundImage();

  // 3. URL de la página "molde" que Puppeteer visitará
  const host = process.env.VERCEL_URL
    ? `https://presupuestos-seven.vercel.app` // Tu dominio real
    : 'http://localhost:3000';
  const url = `${host}/reporte/${id}`;

  try {
    // 4. Lanzamos el navegador robot
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    
    // 5. Visitamos la página "molde"
    await page.goto(url, {
      waitUntil: 'networkidle0',
    });

    // 6. ¡LA MAGIA! Esta es la plantilla del fondo que se repetirá
    const pageTemplate = `
      <style>
        html { -webkit-print-color-adjust: exact; }
        body { margin: 0; padding: 0; }
        img.background {
          position: absolute;
          top: 0;
          left: 0;
          width: 21.59cm;  /* Tamaño Carta */
          height: 27.94cm; /* Tamaño Carta */
          z-index: -1;
        }
      </style>
      <img class="background" src="${imageBase64}" />
    `;

    // 7. Generamos el PDF
    const pdfBuffer = await page.pdf({
      format: 'Letter',       // Tamaño Carta
      printBackground: true,  // Imprime el fondo
      
      // --- LA SOLUCIÓN A LOS MÁRGENES ---
      displayHeaderFooter: true, // ¡Activa la plantilla!
      headerTemplate: pageTemplate,  // Pone el fondo en el encabezado
      footerTemplate: "<div></div>", // Pie de página vacío (el fondo ya lo cubre)
      
      // ESTOS MÁRGENES COINCIDEN CON LOS QUE TE GUSTAN
      // Definen tu "área de escritura" en CADA página
      margin: {
        top: '3.5cm',
        bottom: '4cm',
        left: '2cm',
        right: '2cm',
      },
    });

    // 8. Cerramos el robot
    await browser.close();

    // 9. Creamos el nombre de archivo (corregido)
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

    // 10. Enviamos el PDF
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