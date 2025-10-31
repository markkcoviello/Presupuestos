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
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // <- this one doesn't works in Windows
        '--disable-gpu'
      ],
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

    // 4. Generamos el PDF con configuración mejorada
    const pdfBuffer = await page.pdf({
      format: 'Letter',       // Tamaño Carta
      printBackground: true,  // ¡Imprime el fondo!
      
      // Configuramos márgenes para asegurar espaciado consistente
      margin: {
        top: '0cm',
        right: '0cm',
        bottom: '0cm',
        left: '0cm',
      },
      
      // Opciones adicionales para mejorar el renderizado
      displayHeaderFooter: false,
      preferCSSPageSize: true,
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