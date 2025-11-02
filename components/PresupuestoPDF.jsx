import React from 'react';
import fondoImage from '../../public/fondo-presupuesto.png'; // Asegúrate que esta ruta y nombre de archivo son correctos

export default function PresupuestoPDF({ presupuesto }) {
  // Formatea la fecha al estilo español (día/mes/año)
  const formattedDate = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
        <title>Presupuesto - {presupuesto.folio}</title>
        <style>
          {/* --- ESTILOS CORREGIDOS PARA PDFSHIFT --- */}
          
          /* Forzar el renderizado de colores e imágenes de fondo al imprimir/generar PDF */
          @page {
            margin: 0; /* Los márgenes los controla PDFShift */
            size: A4;
          }
          
          body {
            margin: 0;
            font-family: 'Helvetica Neue', 'Arial', sans-serif;
            font-size: 12px;
            color: #333;
            /* Propiedades clave para que el fondo sea visible */
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Contenedor principal con la imagen de fondo */
          .page-wrapper {
            width: 100vw;
            height: 100vh;
            background-image: url({fondoImage});
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between; /* Distribuye header, main y footer */
          }

          .header {
            padding: 30px 50px 10px 50px;
            text-align: right;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
            color: #0056b3; /* Un color corporativo */
          }
          .header p {
            margin: 4px 0;
            font-size: 14px;
            color: #555;
          }

          .content {
            padding: 10px 50px;
            flex-grow: 1; /* Ocupa el espacio restante */
          }

          .footer {
            padding: 10px 50px 30px 50px;
            text-align: right;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background-color: rgba(255, 255, 255, 0.85); /* Fondo semitransparente para la tabla */
          }
          th, td {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
            font-size: 11px;
          }
          .concepto-descripcion {
            white-space: pre-wrap; /* Para que respete los saltos de línea del concepto */
            max-width: 400px;
            font-size: 11px;
          }
          .codigo {
            width: 10%;
          }
          .unidad {
            width: 10%;
          }
          .cantidad {
            width: 10%;
            text-align: center;
          }
          .pu, .total {
            width: 15%;
            text-align: right;
          }

          .totales {
            margin-top: 20px;
            text-align: right;
            background-color: rgba(255, 255, 255, 0.9);
            padding: 10px;
            border: 1px solid #ccc;
          }
          .totales p {
            margin: 5px 0;
            font-size: 14px;
          }
          .totales .total {
            font-weight: bold;
            font-size: 18px;
            color: #0056b3;
          }
        </style>
      </head>
      <body>
        {/* Usamos el nuevo contenedor con el fondo */}
        <div className="page-wrapper">
          <div className="header">
            <h1>Bebidas Mundiales</h1>
            <p><strong>COTIZACIÓN {presupuesto.folio}</strong></p>
            <p>{presupuesto.description}</p>
            <p>{formattedDate}</p>
          </div>

          <div className="content">
            <table>
              <thead>
                <tr>
                  <th className="codigo">Código</th>
                  <th>Concepto</th>
                  <th className="unidad">Unidad</th>
                  <th className="cantidad">Cantidad</th>
                  <th className="pu">P.U.</th>
                  <th className="total">Total</th>
                </tr>
              </thead>
              <tbody>
                {presupuesto.conceptos.map((concepto, index) => (
                  <tr key={index}>
                    <td>{concepto.codigo}</td>
                    <td className="concepto-descripcion">{concepto.descripcion}</td>
                    <td>{concepto.unidad}</td>
                    <td>{concepto.cantidad}</td>
                    <td>${concepto.precioUnitario.toFixed(2)}</td>
                    <td>${concepto.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="footer">
            <div className="totales">
              <p>Subtotal: ${presupuesto.subtotal.toFixed(2)}</p>
              <p>I.V.A. 16%: ${presupuesto.iva.toFixed(2)}</p>
              <p className="total">TOTAL: ${presupuesto.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}