// Código NUEVO para: src/app/api/download-report/[id]/route.ts

import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { db } from '@/lib/db'; // 1. IMPORTAMOS LA BASE DE DATOS

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // --- 2. BUSCAMOS EL FOLIO Y LA DESCRIPCIÓN EN LA BD ---
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
  // --- FIN DE LA BÚSQUEDA ---

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();

  // Determina la URL base
const host = process.env.VERCEL_URL
  ? `https://presupuestos.vercel.app` // Reemplaza esto con tu URL de Vercel cuando la tengas, o usa VERCEL_URL si es un dominio automático
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

  await browser.close();

  // --- 3. CREAMOS EL NUEVO NOMBRE DE ARCHIVO ---
  // Limpiamos la descripción para que sea un nombre de archivo seguro
  const sanitizedDescription = (budget.description || 'sin-descripcion')
    .replace(/[\/\\?%*:|"<>]/g, '-') // Reemplaza caracteres inválidos
    .substring(0, 50); // Acortamos por si es muy larga

  const filename = `${budget.folio}-${sanitizedDescription}.pdf`;
  // --- FIN DE LA CREACIÓN DEL NOMBRE ---

  // 4. Enviamos el PDF con el nuevo nombre
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}