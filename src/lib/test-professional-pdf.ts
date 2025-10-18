// Función de prueba para demostrar el nuevo PDF profesional
import { generateProfessionalPDF } from './professional-pdf'

export const testProfessionalPDF = () => {
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
        description: 'PRUEBA DE HERMETICIDAD Y FUNCIONAMIENTO DEL SISTEMA',
        unit: 'GLOBAL',
        quantity: 1,
        unitPrice: 850,
        total: 850
      },
      {
        id: '4',
        type: 'title' as const,
        title: 'EQUIPO Y HERRAMIENTA'
      },
      {
        id: '5',
        type: 'concept' as const,
        description: 'RENTA DE EQUIPO ESPECIALIZADO PARA INSTALACIÓN',
        unit: 'DÍA',
        quantity: 1,
        unitPrice: 650,
        total: 650
      },
      {
        id: '6',
        type: 'concept' as const,
        description: 'HERRAMIENTA MENOR Y CONSUMIBLES VARIOS',
        unit: 'GLOBAL',
        quantity: 1,
        unitPrice: 320,
        total: 320
      }
    ],
    subtotal: 6770,
    ivaPercentage: 16,
    ivaAmount: 1083.20,
    total: 7853.20
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
    console.log('Generando PDF profesional con logo y colores...')
    const success = generateProfessionalPDF(testBudget, testClient, testRecipient, '5796TEST')
    console.log('PDF profesional generado exitosamente:', success)
    return success
  } catch (error) {
    console.error('Error al generar PDF profesional:', error)
    return false
  }
}

// Exportar para poder usarla en la consola del navegador
if (typeof window !== 'undefined') {
  (window as any).testProfessionalPDF = testProfessionalPDF
}