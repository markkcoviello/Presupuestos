// Función para generar folio automático
export const generateFolio = async (): Promise<string> => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  
  // Formato: PRES-YYYYMMDD-NNNN
  const prefix = `PRES-${year}${month}${day}`
  
  // En un caso real, aquí consultarías la base de datos para obtener el siguiente número
  // Por ahora, usaremos un timestamp corto
  const sequence = String(Date.now()).slice(-4)
  
  return `${prefix}-${sequence}`
}

// Función para preparar datos para reporteador externo
export const prepareBudgetDataForReporting = (budget: any, client: any, recipient: any) => {
  return {
    // Información del presupuesto
    budget: {
      folio: budget.folio,
      date: budget.date,
      description: budget.description,
      subtotal: budget.subtotal,
      ivaPercentage: budget.ivaPercentage,
      ivaAmount: budget.ivaAmount,
      total: budget.total,
      status: budget.status,
      createdAt: budget.createdAt
    },
    
    // Información del cliente
    client: {
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address
    },
    
    // Información del destinatario
    recipient: {
      name: recipient.name,
      email: recipient.email,
      phone: recipient.phone,
      position: recipient.position
    },
    
    // Conceptos formateados
    concepts: budget.concepts.map((concept: any, index: number) => ({
      lineNumber: index + 1,
      type: concept.type,
      title: concept.title,
      description: concept.description,
      unit: concept.unit,
      quantity: concept.quantity,
      unitPrice: concept.unitPrice,
      total: concept.total
    })),
    
    // Empresa
    company: {
      name: 'CONSTRU-FE',
      slogan: 'CONSTRUIRLO ES POSIBLE',
      contactPerson: 'MARICELA GONZALEZ TOLOSA',
      rfc: 'GOTM5611245W5',
      address: 'Tulipán #22, Col. 10 de Mayo, C.P. 80270',
      city: 'Culiacán de Rosales, Culiacán, Sinaloa.',
      phone: '(667)154 4098',
      tel: '(667)718 3885',
      signatory: {
        name: 'Ing. Francisco José Coviello Marcano',
        position: 'Director General',
        cell: '(667)154 4098',
        tel: '(667)718 3885',
        email: 'constru_fe@hotmail.com'
      }
    }
  }
}

// Función para generar nombre de archivo personalizado
export const generateBudgetFileName = (budget: any, client: any): string => {
  const description = budget.description || 'Presupuesto'
  const clientName = client.name.replace(/\s+/g, '_')
  const date = new Date(budget.date).toISOString().split('T')[0]
  const folio = budget.folio
  
  // Limpiar la descripción para el nombre de archivo
  const cleanDescription = description
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50)
  
  return `${folio}_${cleanDescription}_${clientName}_${date}.pdf`
}