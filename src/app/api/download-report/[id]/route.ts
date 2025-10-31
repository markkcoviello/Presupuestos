// --- CÓDIGO FINAL Y COMPLETO para: src/app/api/download-report/[id]/route.ts ---

import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

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

    // 4. Generamos el PDF (Versión Simple)
    // Confiamos en el CSS (position:fixed) de la página para el fondo.
    const pdfBuffer = await page.pdf({
      format: 'Letter',       // Tamaño Carta
      printBackground: true,  // ¡Imprime el fondo!
      
      // Dejamos que el CSS de la página controle los márgenes
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
    });

    // 5. Cerramos el robot
    await browser.close();

    // 6. Creamos el nombre de archivo (corregido)
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

    // 7. Enviamos el PDF
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