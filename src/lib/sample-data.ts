// Este archivo es para demostrar la funcionalidad de generación de PDF
// Puedes usar estos datos de ejemplo para probar el sistema

export const sampleData = {
  client: {
    id: '1',
    name: 'CONSTRUCCIONES ARCA CONTAL',
    email: 'contacto@arcacontal.com',
    phone: '(667) 123 4567',
    address: 'Av. Principal #123, Culiacán, Sinaloa'
  },
  recipient: {
    id: '1',
    clientId: '1',
    name: 'COMPRAS ARCA CONTAL',
    email: 'compras@arcacontal.com',
    phone: '(667) 123 4568',
    position: 'Departamento de Compras'
  },
  budget: {
    id: '1',
    clientId: '1',
    recipientId: '1',
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
        type: 'title' as const,
        title: 'EQUIPO Y HERRAMIENTA'
      },
      {
        id: '4',
        type: 'concept' as const,
        description: 'RENTA DE EQUIPO ESPECIALIZADO PARA INSTALACIÓN',
        unit: 'DÍA',
        quantity: 1,
        unitPrice: 850,
        total: 850
      },
      {
        id: '5',
        type: 'concept' as const,
        description: 'HERRAMIENTA MENOR Y CONSUMIBLES',
        unit: 'GLOBAL',
        quantity: 1,
        unitPrice: 320,
        total: 320
      }
    ],
    subtotal: 6120,
    ivaPercentage: 16,
    ivaAmount: 979.20,
    total: 7099.20
  }
}

export const quoteNumber = '5796'