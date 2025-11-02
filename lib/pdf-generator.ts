// lib/pdf-generator.ts

import fondoImage from '../public/fondo-presupuesto.png';

// La interfaz ahora se llama 'Item' para coincidir con Prisma
interface Item {
  codigo: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

interface Presupuesto {
  folio: string;
  description: string;
  subtotal: number;
  iva: number;
  total: number;
  items: Item[]; // <-- IMPORTANTE: Usamos 'items'
}

export function generatePdfHtml(presupuesto: Presupuesto): string {
  const formattedDate = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Presupuesto - ${presupuesto.folio}</title>
        <style>
          @page { margin: 0; size: A4; }
          body { margin: 0; font-family: 'Helvetica Neue', 'Arial', sans-serif; font-size: 12px; color: #333; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .page-wrapper { width: 100vw; height: 100vh; background-image: url(${fondoImage.src}); background-size: cover; background-position: center; background-repeat: no-repeat; position: relative; display: flex; flex-direction: column; justify-content: space-between; }
          .header { padding: 30px 50px 10px 50px; text-align: right; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; color: #0056b3; }
          .header p { margin: 4px 0; font-size: 14px; color: #555; }
          .content { padding: 10px 50px; flex-grow: 1; }
          .footer { padding: 10px 50px 30px 50px; text-align: right; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; background-color: rgba(255, 255, 255, 0.85); }
          th, td { border: 1px solid #ccc; padding: 10px; text-align: left; vertical-align: top; }
          th { background-color: #f2f2f2; font-weight: bold; font-size: 11px; }
          .concepto-descripcion { white-space: pre-wrap; max-width: 400px; font-size: 11px; }
          .codigo { width: 10%; }
          .unidad { width: 10%; }
          .cantidad { width: 10%; text-align: center; }
          .pu, .total { width: 15%; text-align: right; }
          .totales { margin-top: 20px; text-align: right; background-color: rgba(255, 255, 255, 0.9); padding: 10px; border: 1px solid #ccc; }
          .totales p { margin: 5px 0; font-size: 14px; }
          .totales .total { font-weight: bold; font-size: 18px; color: #0056b3; }
        </style>
      </head>
      <body>
        <div class="page-wrapper">
          <div class="header">
            <h1>Bebidas Mundiales</h1>
            <p><strong>COTIZACIÓN ${presupuesto.folio}</strong></p>
            <p>${presupuesto.description}</p>
            <p>${formattedDate}</p>
          </div>
          <div class="content">
            <table>
              <thead>
                <tr>
                  <th class="codigo">Código</th>
                  <th>Concepto</th>
                  <th class="unidad">Unidad</th>
                  <th class="cantidad">Cantidad</th>
                  <th class="pu">P.U.</th>
                  <th class="total">Total</th>
                </tr>
              </thead>
              <tbody>
                ${presupuesto.items.map(item => `
                  <tr>
                    <td>${item.codigo}</td>
                    <td class="concepto-descripcion">${item.descripcion}</td>
                    <td>${item.unidad}</td>
                    <td>${item.cantidad}</td>
                    <td>$${item.precioUnitario.toFixed(2)}</td>
                    <td>$${item.total.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="footer">
            <div class="totales">
              <p>Subtotal: $${presupuesto.subtotal.toFixed(2)}</p>
              <p>I.V.A. 16%: $${presupuesto.iva.toFixed(2)}</p>
              <p class="total">TOTAL: $${presupuesto.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}