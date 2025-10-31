// --- CÓDIGO FINAL Y COMPLETO (con Base64) para: src/app/api/download-report/[id]/route.ts ---

import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { db } from '@/lib/db';
import fs from 'fs'; // <--- 1. IMPORTAMOS 'File System'
import path from 'path'; // <--- 2. IMPORTAMOS 'Path'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Obtenemos los datos del presupuesto
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

  // --- 3. LEEMOS LA IMAGEN DEL SERVIDOR ---
  // (Asegúrate de que tu imagen se llame 'membrete.png' y esté en la carpeta 'public/')
  const imagePath = path.resolve('./public', 'membrete.png');
  let imageBase64 = '';
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    // Convertimos la imagen a un string Base64
    imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    console.error("Error leyendo la imagen de fondo:", error);
    // Si falla, el PDF se generará sin fondo, pero no se "romperá"
  }
  // --- FIN DE LA LECTURA DE IMAGEN ---

  // URL de la página "molde" que Puppeteer visitará
  const host = process.env.VERCEL_URL
    ? `https://presupuestos-seven.vercel.app` // Tu dominio real
    : 'http://localhost:3000';
  const url = `${host}/reporte/${id}`;

  try {
    // Lanzamos el navegador robot
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    
    // Visitamos la página "molde"
    await page.goto(url, {
      waitUntil: 'networkidle0',
    });

    // 4. ¡LA MAGIA! (ACTUALIZADA)
    // Creamos la plantilla del fondo, ahora con la imagen Base64
    const pageTemplate = `
      <style>
        html { -webkit-print-color-adjust: exact; }
        body { margin: 0; padding: 0; }
        img.background {
          position: absolute;
          top: 0;
          left: 0;
          width: 21.59cm;
          height: 27.94cm;
          z-index: -1;
        }
      </style>
      <img class="background" src="${imageBase64}" /> `;

    // 6. Generamos el PDF (MÁRGENES Y FORMATO INTACTOS)
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: pageTemplate,
      footerTemplate: "<div></div>",
      margin: { // TUS MÁRGENES PERFECTOS (NO SE TOCAN)
        top: '3.5cm',
        bottom: '4cm',
        left: '2cm',
        right: '2cm',
      },
    });

    // 7. Cerramos el robot
    await browser.close();

    // 8. Creamos el nombre de archivo (corregido)
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

    // 9. Enviamos el PDF
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