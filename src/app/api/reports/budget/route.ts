import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { budgetId } = await request.json()
    
    if (!budgetId) {
      return NextResponse.json({ error: 'Budget ID is required' }, { status: 400 })
    }
    
    const budget = await db.budget.findUnique({
      where: { id: budgetId },
      include: {
        client: true,
        recipient: true
      }
    })
    
    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }
    
    // Generate HTML content for PDF
    const htmlContent = generateBudgetHTML(budget)
    
    // For now, return a simple text response with the HTML content
    // In a real implementation, you would use a PDF library like puppeteer
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="presupuesto-${budget.folio}.html"`
      }
    })
    
  } catch (error) {
    console.error('Error generating budget PDF:', error)
    return NextResponse.json({ error: 'Error generating PDF' }, { status: 500 })
  }
}

function generateBudgetHTML(budget: any): string {
  const concepts = budget.concepts as any[]
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presupuesto ${budget.folio}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #dc2626; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #dc2626; margin-bottom: 10px; }
        .company-info { color: #666; margin-bottom: 10px; }
        .document-title { font-size: 18px; font-weight: bold; margin: 20px 0; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .info-section { background: #f9f9f9; padding: 15px; border-radius: 5px; }
        .info-section h3 { margin: 0 0 10px 0; color: #333; }
        .info-section p { margin: 5px 0; }
        .concepts-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .concepts-table th, .concepts-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .concepts-table th { background: #f5f5f5; font-weight: bold; }
        .title-row { background: #f0f0f0; font-weight: bold; }
        .totals { text-align: right; margin: 20px 0; }
        .totals p { margin: 5px 0; }
        .total { font-size: 18px; font-weight: bold; color: #dc2626; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">CONSTRU-FE</div>
        <div class="company-info">Sistema de Presupuestos Profesionales</div>
        <div class="company-info">CONSTRUIRLO ES POSIBLE</div>
    </div>
    
    <div class="document-title">
        COTIZACIÓN ${budget.folio}
    </div>
    
    <div class="info-grid">
        <div class="info-section">
            <h3>CLIENTE</h3>
            <p><strong>${budget.client.name}</strong></p>
            ${budget.client.email ? `<p>Email: ${budget.client.email}</p>` : ''}
            ${budget.client.phone ? `<p>Tel: ${budget.client.phone}</p>` : ''}
            ${budget.client.address ? `<p>Dirección: ${budget.client.address}</p>` : ''}
        </div>
        
        <div class="info-section">
            <h3>DESTINATARIO</h3>
            <p><strong>${budget.recipient.name}</strong></p>
            ${budget.recipient.email ? `<p>Email: ${budget.recipient.email}</p>` : ''}
            ${budget.recipient.phone ? `<p>Tel: ${budget.recipient.phone}</p>` : ''}
            ${budget.recipient.position ? `<p>Puesto: ${budget.recipient.position}</p>` : ''}
        </div>
    </div>
    
    <div class="info-section">
        <h3>INFORMACIÓN DEL PRESUPUESTO</h3>
        <p><strong>Fecha:</strong> ${budget.date}</p>
        <p><strong>Descripción:</strong> ${budget.description || 'N/A'}</p>
    </div>
    
    <table class="concepts-table">
        <thead>
            <tr>
                <th>Clave</th>
                <th>Concepto</th>
                <th>Unidad</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Importe</th>
            </tr>
        </thead>
        <tbody>
            ${concepts.map(concept => {
                if (concept.type === 'title') {
                    return `<tr class="title-row">
                        <td>${concept.key || ''}</td>
                        <td colspan="5">${concept.title}</td>
                    </tr>`
                } else {
                    return `<tr>
                        <td class="text-center font-mono">${concept.key || ''}</td>
                        <td>${concept.description}</td>
                        <td>${concept.unit}</td>
                        <td>${concept.quantity}</td>
                        <td>$${concept.unitPrice?.toFixed(2)}</td>
                        <td>$${concept.total?.toFixed(2)}</td>
                    </tr>`
                }
            }).join('')}
        </tbody>
    </table>
    
    <div class="totals">
        <p>Subtotal: $${budget.subtotal.toFixed(2)}</p>
        <p>IVA (${budget.ivaPercentage}%): $${budget.ivaAmount.toFixed(2)}</p>
        <p class="total">Total: $${budget.total.toFixed(2)}</p>
    </div>
    
    <div class="footer">
        <p>Presupuesto generado el ${new Date().toLocaleDateString('es-MX')}</p>
        <p>CONSTRU-FE - Sistema de Presupuestos Profesionales</p>
    </div>
</body>
</html>
  `
}