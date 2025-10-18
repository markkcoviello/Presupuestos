// Función de prueba para generar un PDF de ejemplo
import { generateBudgetPDFDirect } from './pdf-generator'

export const testPDFGeneration = () => {
  const testBudget = {
    id: 'test123',
    clientId: 'client1',
    recipientId: 'recipient1',
    date: '2025-01-15',
    description: 'INSTALACION DE VALVULA EN TUBERÍA EN CISTERNA',
    concepts: [
      {
        id: '1',
        type: 'title' as const,
        title: 'CIMENTACIÓN'
      },
      {
        id: '2',
        type: 'concept' as const,
        description: 'RETIRO DE TUBERÍA E INSTALACIÓN DE NIPLE, "T" Y VALVULA DE ACERO INOXIDABLE EN TUBERÍA DE 1/2" EN CISTERNA, INCLUYE MAT Y MO',
        unit: 'SERVICIO',
        quantity: 1,
        unitPrice: 4950,
        total: 4950
      },
      {
        id: '3',
        type: 'concept' as const,
        description: 'PRUEBA DE HERMETICIDAD Y FUNCIONAMIENTO',
        unit: 'GLOBAL',
        quantity: 1,
        unitPrice: 850,
        total: 850
      }
    ],
    subtotal: 5800,
    ivaPercentage: 16,
    ivaAmount: 928,
    total: 6728
  }

  const testClient = {
    id: 'client1',
    name: 'CONSTRUCCIONES ARCA CONTAL',
    email: 'contacto@arcacontal.com',
    phone: '(667) 123 4567',
    address: 'Av. Principal #123, Culiacán, Sinaloa'
  }

  const testRecipient = {
    id: 'recipient1',
    clientId: 'client1',
    name: 'COMPRAS ARCA CONTAL',
    email: 'compras@arcacontal.com',
    phone: '(667) 123 4568',
    position: 'Departamento de Compras'
  }

  try {
    console.log('Generando PDF de prueba...')
    const success = generateBudgetPDFDirect(testBudget, testClient, testRecipient, '5796TEST')
    console.log('PDF generado exitosamente:', success)
    return success
  } catch (error) {
    console.error('Error al generar PDF de prueba:', error)
    return false
  }
}

// Exportar para poder usarla en la consola del navegador
if (typeof window !== 'undefined') {
  (window as any).testPDFGeneration = testPDFGeneration
}