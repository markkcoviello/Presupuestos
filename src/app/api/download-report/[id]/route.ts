// --- CÓDIGO ACTUALIZADO para: src/app/api/download-report/[id]/route.ts ---

import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
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

  let browser;

  const host = process.env.VERCEL_URL
    ? `https://presupuestos-seven.vercel.app` 
    : 'http://localhost:3000';
    
  const url = `${host}/reporte/${id}`;
  
  try {
    // Agregamos argumentos estándar para Vercel
    const browserArgs = [
      ...chromium.args,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--single-process'
    ];

    browser = await puppeteer.launch({
      args: browserArgs, // Usamos los args modificados
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    
    await page.goto(url, {
      waitUntil: 'networkidle2', // Cambiado de networkidle0 a networkidle2
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

    await browser.close();

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
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}