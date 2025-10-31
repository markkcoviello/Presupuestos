'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, Save, FileText, Users, UserPlus, Calculator, Download, Search, Filter, Edit, ChevronUp, ChevronDown, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Toaster } from 'sonner'

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
}

interface Recipient {
  id: string
  clientId: string
  name: string
  email?: string
  phone?: string
  position?: string
}

interface ConceptItem {
  id: string
  type: 'title' | 'concept'
  key?: string
  title?: string
  description?: string
  unit?: string
  quantity?: number
  unitPrice?: number
  total?: number
}

interface Budget {
  id: string
  folio: string
  clientId: string
  recipientId: string
  date: string
  description?: string
  concepts: ConceptItem[]
  subtotal: number
  ivaPercentage: number
  ivaAmount: number
  total: number
  status: string
  createdAt: string
  updatedAt: string
  client?: {
    id: string
    name: string
    email?: string
  }
  recipient?: {
    id: string
    name: string
    email?: string
    position?: string
  }
}

export default function PresupuestosApp() {
  const [clients, setClients] = useState<Client[]>([])
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedRecipient, setSelectedRecipient] = useState('')
  const [budgetDate, setBudgetDate] = useState(new Date().toISOString().split('T')[0])
  const [budgetDescription, setBudgetDescription] = useState('')
  const [concepts, setConcepts] = useState<ConceptItem[]>([])
  const [ivaPercentage, setIvaPercentage] = useState(16)
  
  // Edit mode state
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingBudgetFolio, setEditingBudgetFolio] = useState<string | null>(null)
  
  // Client form
  const [clientForm, setClientForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [recipientForm, setRecipientForm] = useState({ clientId: '', name: '', email: '', phone: '', position: '' })
  
  // Dialog states
  const [clientDialogOpen, setClientDialogOpen] = useState(false)
  const [recipientDialogOpen, setRecipientDialogOpen] = useState(false)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')

  // Function to format currency as MXN
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  // Initialize
  useEffect(() => {
    loadData()
    
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: Add new concept
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        addConcept('concept')
      }
      // Ctrl/Cmd + T: Add new title
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault()
        addConcept('title')
      }
      // Ctrl/Cmd + S: Save budget
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveBudget()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const loadData = async () => {
    try {
      await Promise.all([
        loadClients(),
        loadRecipients(),
        loadBudgets()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error al cargar los datos iniciales')
    } finally {
      setLoading(false)
    }
  }

  // Load data functions
  const loadClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const loadRecipients = async () => {
    try {
      const response = await fetch('/api/recipients')
      if (response.ok) {
        const data = await response.json()
        setRecipients(data)
      }
    } catch (error) {
      console.error('Error loading recipients:', error)
    }
  }

  const loadBudgets = async () => {
    try {
      const response = await fetch('/api/budgets')
      if (response.ok) {
        const data = await response.json()
        setBudgets(data)
      }
    } catch (error) {
      console.error('Error loading budgets:', error)
    }
  }

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = concepts.reduce((sum, concept) => {
      if (concept.type === 'concept' && concept.total) {
        return sum + concept.total
      }
      return sum
    }, 0)
    
    const ivaAmount = subtotal * (ivaPercentage / 100)
    const total = subtotal + ivaAmount
    
    return { subtotal, ivaAmount, total }
  }

  const { subtotal, ivaAmount, total } = calculateTotals()

  // Add concept
  const addConcept = (type: 'title' | 'concept') => {
    const nextKey = generateNextKey(type)
    const newConcept: ConceptItem = {
      id: Date.now().toString(),
      type,
      key: nextKey,
      ...(type === 'title' ? { title: '' } : { description: '', unit: '', quantity: 1, unitPrice: 0, total: 0 })
    }
    setConcepts(prev => [...prev, newConcept])
  }

  // Generate next consecutive key
  const generateNextKey = (type: 'title' | 'concept'): string => {
    const existingConcepts = concepts.filter(c => c.type === type)
    const highestNumber = existingConcepts.reduce((max, concept) => {
      if (concept.key) {
        const match = concept.key.match(/\d+/)
        if (match) {
          return Math.max(max, parseInt(match[0]))
        }
      }
      return max
    }, 0)
    
    const prefix = type === 'title' ? 'T' : 'C'
    const nextNumber = highestNumber + 1
    return `${prefix}${nextNumber.toString().padStart(2, '0')}`
  }

  // Update concept with key validation
  const updateConceptWithKeyValidation = (id: string, field: string, value: any) => {
    // The key field is now completely editable without format restrictions
    updateConcept(id, field, value)
  }

  // Auto-resize textarea function
  const autoResizeTextarea = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto'
    element.style.height = element.scrollHeight + 'px'
  }

  // Update concept
  const updateConcept = (id: string, field: string, value: any) => {
    setConcepts(prev => prev.map(concept => {
      if (concept.id === id) {
        const updated = { ...concept, [field]: value }
        
        if (concept.type === 'concept' && (field === 'quantity' || field === 'unitPrice')) {
          const quantity = field === 'quantity' ? value : concept.quantity || 0
          const unitPrice = field === 'unitPrice' ? value : concept.unitPrice || 0
          updated.total = quantity * unitPrice
        }
        
        return updated
      }
      return concept
    }))
  }

  // Remove concept
  const removeConcept = (id: string) => {
    setConcepts(prev => prev.filter(concept => concept.id !== id))
  }

  // Move concept up
  const moveConceptUp = (id: string) => {
    setConcepts(prev => {
      const index = prev.findIndex(concept => concept.id === id)
      if (index > 0) {
        const newConcepts = [...prev]
        ;[newConcepts[index], newConcepts[index - 1]] = [newConcepts[index - 1], newConcepts[index]]
        return newConcepts
      }
      return prev
    })
  }

  // Move concept down
  const moveConceptDown = (id: string) => {
    setConcepts(prev => {
      const index = prev.findIndex(concept => concept.id === id)
      if (index < prev.length - 1) {
        const newConcepts = [...prev]
        ;[newConcepts[index], newConcepts[index + 1]] = [newConcepts[index + 1], newConcepts[index]]
        return newConcepts
      }
      return prev
    })
  }

  // Add client
  const addClient = async () => {
    if (!clientForm.name) {
      toast.error('El nombre del cliente es requerido')
      return
    }
    
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientForm),
      })
      
      if (response.ok) {
        const newClient = await response.json()
        setClients(prev => [...prev, newClient])
        setClientForm({ name: '', email: '', phone: '', address: '' })
        setClientDialogOpen(false)
        toast.success('Cliente agregado exitosamente')
      }
    } catch (error) {
      toast.error('Error al agregar cliente')
    }
  }

  // Add recipient
  const addRecipient = async () => {
    if (!recipientForm.clientId || !recipientForm.name) {
      toast.error('El cliente y nombre del destinatario son requeridos')
      return
    }
    
    try {
      const response = await fetch('/api/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipientForm),
      })
      
      if (response.ok) {
        const newRecipient = await response.json()
        setRecipients(prev => [...prev, newRecipient])
        setRecipientForm({ clientId: '', name: '', email: '', phone: '', position: '' })
        setRecipientDialogOpen(false)
        toast.success('Destinatario agregado exitosamente')
      }
    } catch (error) {
      toast.error('Error al agregar destinatario')
    }
  }

  // Get current user (for now, use default admin user)
  const getCurrentUserId = () => {
    return 'cmgu135hv0000s3vtcgwscvc9' // Default admin user
  }

  // Clear budget form
  const clearBudgetForm = () => {
    setSelectedClient('')
    setSelectedRecipient('')
    setBudgetDate(new Date().toISOString().split('T')[0])
    setBudgetDescription('')
    setConcepts([])
    setIvaPercentage(16)
    setEditingBudgetId(null)
    setIsEditMode(false)
    setEditingBudgetFolio(null)
  }

  // Save budget (create or update)
  const saveBudget = async () => {
    if (!selectedClient || !selectedRecipient || concepts.length === 0) {
      toast.error('Complete todos los campos requeridos')
      return
    }
    
    try {
      const budgetData = {
        clientId: selectedClient,
        recipientId: selectedRecipient,
        date: budgetDate,
        description: budgetDescription,
        concepts,
        subtotal,
        ivaPercentage,
        ivaAmount,
        total
      }
      
      let response
      let successMessage
      
      if (isEditMode && editingBudgetId) {
        // Update existing budget - KEEP THE SAME FOLIO
        response = await fetch(`/api/budgets/${editingBudgetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(budgetData),
        })
        successMessage = `Presupuesto actualizado exitosamente - Folio mantenido`
      } else {
        // Create new budget - GENERATE NEW FOLIO
        response = await fetch('/api/budgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...budgetData,
            userId: getCurrentUserId()
          }),
        })
        successMessage = `Presupuesto guardado exitosamente - Nuevo folio generado`
      }
      
      if (response.ok) {
        const savedBudget = await response.json()
        toast.success(`${successMessage} - Folio: ${savedBudget.folio}`)
        loadBudgets()
        
        // Reset form
        clearBudgetForm()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Error al guardar presupuesto')
      }
    } catch (error) {
      toast.error('Error al guardar presupuesto')
    }
  }

  // Download PDF
  const downloadPDF = async (budget: Budget) => {
    try {
      const response = await fetch('/api/reports/budget-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgetId: budget.id }),
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        
        // Crear nombre del archivo: folio-descripción
        const description = budget.description || 'SinDescripcion'
        const cleanDescription = description
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '_')
          .substring(0, 50)
        
        a.download = `${budget.folio}-${cleanDescription}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast.success('PDF CONSTRU-FE descargado exitosamente')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        toast.error(errorData.error || 'Error al descargar PDF')
      }
    } catch (error) {
      toast.error('Error al descargar PDF')
    }
  }

  // Reuse budget - load data into form without creating new record
  const reuseBudget = async (budget: Budget) => {
    try {
      // Get the original budget data
      const response = await fetch(`/api/budgets/${budget.id}`)
      
      if (response.ok) {
        const budgetData = await response.json()
        
        // Load the budget data into the form WITHOUT creating a new record
        setSelectedClient(budgetData.clientId)
        setSelectedRecipient(budgetData.recipientId)
        setBudgetDate(new Date().toISOString().split('T')[0]) // Use current date
        setBudgetDescription(`${budgetData.description || ''} (COPIA)`) // Mark as copy
        setConcepts(budgetData.concepts || [])
        setIvaPercentage(budgetData.ivaPercentage)
        
        // Clear edit mode - this is a new budget based on existing one
        setEditingBudgetId(null)
        setIsEditMode(false)
        
        // Switch to create tab
        const createTab = document.querySelector('[value="create"]') as HTMLElement
        createTab?.click()
        
        toast.success(`Presupuesto ${budgetData.folio} cargado como nueva base`)
        
        // Reload budgets list to show latest data
        loadBudgets()
      } else {
        toast.error('Error al cargar presupuesto para reutilizar')
      }
    } catch (error) {
      toast.error('Error al reutilizar presupuesto')
    }
  }

  // Load budget for editing in create form
  const loadBudgetForEditing = async (budget: Budget) => {
    try {
      const response = await fetch(`/api/budgets/${budget.id}`)
      
      if (response.ok) {
        const budgetData = await response.json()
        
        // Clear form first to avoid conflicts
        clearBudgetForm()
        
        // Load the budget data into the form
        setSelectedClient(budgetData.clientId)
        setSelectedRecipient(budgetData.recipientId)
        setBudgetDate(budgetData.date)
        setBudgetDescription(budgetData.description || '')
        setConcepts(budgetData.concepts || [])
        setIvaPercentage(budgetData.ivaPercentage)
        
        // Set edit mode - this is crucial for proper folio handling
        setEditingBudgetId(budgetData.id)
        setIsEditMode(true)
        setEditingBudgetFolio(budgetData.folio)
        
        // Switch to create tab
        const createTab = document.querySelector('[value="create"]') as HTMLElement
        createTab?.click()
        
        toast.success(`Editando presupuesto ${budgetData.folio} - Folio mantendrá igual`)
      } else {
        toast.error('Error al cargar presupuesto')
      }
    } catch (error) {
      toast.error('Error al cargar presupuesto')
    }
  }

  // Filter budgets
  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (budget.client && budget.client.name && budget.client.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || budget.status === statusFilter
    const matchesClient = clientFilter === 'all' || budget.clientId === clientFilter
    
    return matchesSearch && matchesStatus && matchesClient
  })

  // Filter recipients by selected client
  const filteredRecipients = recipients.filter(r => r.clientId === selectedClient)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 font-medium">Cargando sistema CONSTRU-FE...</p>
          <p className="text-sm text-gray-500 mt-2">Por favor espere un momento</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white font-bold text-xl">CF</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CONSTRU-FE</h1>
                <p className="text-sm text-gray-500">Sistema de Presupuestos Profesional</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Presupuestos</p>
                <p className="text-lg font-semibold text-gray-900">{budgets.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Clientes</p>
                <p className="text-lg font-semibold text-gray-900">{clients.length}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="budgets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="budgets" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Presupuestos
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Calculator className="w-4 h-4 mr-2" />
              Crear Presupuesto
            </TabsTrigger>
            <TabsTrigger value="clients" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Clientes
            </TabsTrigger>
          </TabsList>

          {/* Tabla de Presupuestos */}
          <TabsContent value="budgets" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <FileText className="w-6 h-6 text-red-600" />
                  Listado de Presupuestos
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Gestiona y filtra todos tus presupuestos de manera eficiente
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {/* Filtros */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por folio, descripción o cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48 h-12">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="cancelled">Cancelados</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className="w-48 h-12">
                      <SelectValue placeholder="Cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los clientes</SelectItem>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tabla */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="font-semibold text-gray-700">Folio</TableHead>
                          <TableHead className="font-semibold text-gray-700">Cliente</TableHead>
                          <TableHead className="font-semibold text-gray-700">Destinatario</TableHead>
                          <TableHead className="font-semibold text-gray-700">Fecha</TableHead>
                          <TableHead className="font-semibold text-gray-700">Descripción</TableHead>
                          <TableHead className="font-semibold text-gray-700">Total</TableHead>
                          <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-center">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBudgets.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                              <p className="text-lg font-medium">No se encontraron presupuestos</p>
                              <p className="text-sm">Intenta ajustar los filtros o crea un nuevo presupuesto</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredBudgets.map((budget) => (
                            <TableRow key={budget.id} className="hover:bg-gray-50 transition-colors">
                              <TableCell className="font-medium text-red-600">{budget.folio}</TableCell>
                              <TableCell className="font-medium">{clients.find(c => c.id === budget.clientId)?.name}</TableCell>
                              <TableCell>{recipients.find(r => r.id === budget.recipientId)?.name}</TableCell>
                              <TableCell>{budget.date}</TableCell>
                              <TableCell className="max-w-xs truncate" title={budget.description}>
                                {budget.description || 'Sin descripción'}
                              </TableCell>
                              <TableCell className="font-semibold text-green-600">{formatCurrency(budget.total)}</TableCell>
                              <TableCell>
                                <Badge variant={budget.status === 'active' ? 'default' : 'secondary'} className="px-3 py-1">
                                  {budget.status === 'active' ? 'Activo' : budget.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => loadBudgetForEditing(budget)}
                                    title="Editar presupuesto"
                                    className="hover:bg-blue-50 hover:border-blue-300"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => reuseBudget(budget)}
                                    title="Reutilizar presupuesto"
                                    className="hover:bg-green-50 hover:border-green-300"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <a
                                    href={`/api/download-report/${budget.id}`}
                                    title="Descargar PDF"
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 hover:bg-red-50 hover:border-red-300" // <-- Clases de ShadCN/UI para que se vea como botón "outline" "sm" + tus clases hover
                                    target="_blank"
                                    download
                                  >
                                    <Download className="h-4 w-4" />
                                  </a>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crear Presupuesto */}
          <TabsContent value="create" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <Calculator className="w-6 h-6 text-red-600" />
                      {isEditMode ? `Editar Presupuesto` : 'Crear Nuevo Presupuesto'}
                      {isEditMode && (
                        <>
                          <Badge variant="outline" className="ml-2 border-red-300 text-red-600">
                            Modo Edición
                          </Badge>
                          <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 border-blue-300">
                            Folio: {editingBudgetFolio || 'Cargando...'}
                          </Badge>
                        </>
                      )}
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-2">
                      {isEditMode 
                        ? 'Modifica los datos del presupuesto. El folio se mantendrá igual.'
                        : 'Completa el formulario para crear un nuevo presupuesto'
                      }
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={clearBudgetForm}
                    className="flex items-center gap-2 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Presupuesto
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Información General */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client" className="text-sm font-medium text-gray-700">Cliente *</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="recipient" className="text-sm font-medium text-gray-700">Destinatario *</Label>
                    <Select value={selectedRecipient} onValueChange={setSelectedRecipient} disabled={!selectedClient}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleccionar destinatario" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredRecipients.map(recipient => (
                          <SelectItem key={recipient.id} value={recipient.id}>
                            {recipient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium text-gray-700">Fecha *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={budgetDate}
                      onChange={(e) => setBudgetDate(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="iva" className="text-sm font-medium text-gray-700">IVA (%)</Label>
                    <Input
                      id="iva"
                      type="number"
                      value={ivaPercentage}
                      onChange={(e) => setIvaPercentage(Number(e.target.value))}
                      className="h-11"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Descripción del presupuesto..."
                    value={budgetDescription}
                    onChange={(e) => setBudgetDescription(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                {/* Conceptos */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-gray-700">Conceptos del Presupuesto</Label>
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Atajos: <kbd className="px-1 py-0.5 bg-white rounded border">Ctrl+N</kbd> Concepto • <kbd className="px-1 py-0.5 bg-white rounded border">Ctrl+T</kbd> Título • <kbd className="px-1 py-0.5 bg-white rounded border">Ctrl+S</kbd> Guardar
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addConcept('title')}
                        className="hover:bg-blue-50 border-blue-200 text-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Agregar Título
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => addConcept('concept')}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Agregar Concepto
                      </Button>
                    </div>
                  </div>

                  {concepts.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                      <Calculator className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-xl font-semibold text-gray-500 mb-2">No hay conceptos agregados</p>
                      <p className="text-sm text-gray-400 mb-4">Comienza agregando títulos y conceptos para tu presupuesto</p>
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => addConcept('title')} className="hover:bg-blue-50">
                          <Plus className="w-4 h-4 mr-1" />
                          Primer Título
                        </Button>
                        <Button size="sm" onClick={() => addConcept('concept')} className="bg-red-600 hover:bg-red-700">
                          <Plus className="w-4 h-4 mr-1" />
                          Primer Concepto
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="max-h-80 overflow-y-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <th className="px-3 py-2 w-24">Clave</th>
                              <th className="px-3 py-2 w-20">Tipo</th>
                              <th className="px-3 py-2 min-w-[200px] flex-1">Descripción</th>
                              <th className="px-3 py-2 w-20">Unidad</th>
                              <th className="px-3 py-2 w-20">Cantidad</th>
                              <th className="px-3 py-2 w-24">P. Unitario</th>
                              <th className="px-3 py-2 w-24">Total</th>
                              <th className="px-3 py-2 w-24">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {concepts.map((concept, index) => (
                              <tr key={concept.id} className="hover:bg-gray-50 transition-colors text-sm align-top">
                                <td className="px-3 py-2 align-middle">
                                  <Input
                                    value={concept.key || ''}
                                    onChange={(e) => updateConceptWithKeyValidation(concept.id, 'key', e.target.value)}
                                    className="h-8 text-xs font-mono text-center bg-gray-50 border-gray-300 w-full"
                                    placeholder="CIM01"
                                    title="Clave completamente editable (ej: CIM01, OBRA-001, CONCEPTO-A, etc.)"
                                  />
                                </td>
                                <td className="px-3 py-2 align-middle">
                                  <Badge 
                                    variant={concept.type === 'title' ? 'secondary' : 'default'} 
                                    className="text-xs px-2 py-1"
                                  >
                                    {concept.type === 'title' ? 'TÍTULO' : 'CONCEPTO'}
                                  </Badge>
                                </td>
                                <td className="px-3 py-2 min-w-[200px] align-top">
                                  {concept.type === 'title' ? (
                                    <Textarea
                                      placeholder="Título del concepto..."
                                      value={concept.title || ''}
                                      onChange={(e) => {
                                        updateConcept(concept.id, 'title', e.target.value)
                                        const target = e.target
                                        setTimeout(() => autoResizeTextarea(target), 0)
                                      }}
                                      className="text-sm font-medium bg-blue-50 border-blue-200 min-w-[180px] w-full resize-none overflow-hidden"
                                      style={{minWidth: '200px', minHeight: '32px'}}
                                      rows={1}
                                      ref={(el) => {
                                        if (el) {
                                          setTimeout(() => autoResizeTextarea(el), 0)
                                        }
                                      }}
                                    />
                                  ) : (
                                    <Textarea
                                      placeholder="Descripción del concepto..."
                                      value={concept.description || ''}
                                      onChange={(e) => {
                                        updateConcept(concept.id, 'description', e.target.value)
                                        const target = e.target
                                        setTimeout(() => autoResizeTextarea(target), 0)
                                      }}
                                      className="text-sm min-w-[180px] w-full resize-none overflow-hidden"
                                      style={{minWidth: '200px', minHeight: '32px'}}
                                      rows={1}
                                      ref={(el) => {
                                        if (el) {
                                          setTimeout(() => autoResizeTextarea(el), 0)
                                        }
                                      }}
                                    />
                                  )}
                                </td>
                                <td className="px-3 py-2 align-middle">
                                  {concept.type === 'concept' ? (
                                    <Input
                                      placeholder="UND"
                                      value={concept.unit || ''}
                                      onChange={(e) => updateConcept(concept.id, 'unit', e.target.value)}
                                      className="h-8 text-sm text-center bg-gray-50 border-gray-300"
                                    />
                                  ) : (
                                    <div className="h-8 flex items-center justify-center text-gray-400">—</div>
                                  )}
                                </td>
                                <td className="px-3 py-2 align-middle">
                                  {concept.type === 'concept' ? (
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={concept.quantity || ''}
                                      onChange={(e) => updateConcept(concept.id, 'quantity', Number(e.target.value))}
                                      min="0"
                                      step="0.01"
                                      className="h-8 text-sm text-center bg-gray-50 border-gray-300"
                                    />
                                  ) : (
                                    <div className="h-8 flex items-center justify-center text-gray-400">—</div>
                                  )}
                                </td>
                                <td className="px-3 py-2 align-middle">
                                  {concept.type === 'concept' ? (
                                    <Input
                                      type="number"
                                      placeholder="0.00"
                                      value={concept.unitPrice || ''}
                                      onChange={(e) => updateConcept(concept.id, 'unitPrice', Number(e.target.value))}
                                      min="0"
                                      step="0.01"
                                      className="h-8 text-sm text-right bg-gray-50 border-gray-300"
                                    />
                                  ) : (
                                    <div className="h-8 flex items-center justify-center text-gray-400">—</div>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-right align-middle">
                                  {concept.type === 'concept' ? (
                                    <span className="font-semibold text-green-600 text-sm">
                                      {formatCurrency(concept.total || 0)}
                                    </span>
                                  ) : (
                                    <div className="h-8 flex items-center justify-center text-gray-400">—</div>
                                  )}
                                </td>
                                <td className="px-3 py-2 align-middle">
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => moveConceptUp(concept.id)}
                                      disabled={index === 0}
                                      className="h-6 w-6 p-0 hover:bg-gray-100"
                                      title="Subir"
                                    >
                                      <ChevronUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => moveConceptDown(concept.id)}
                                      disabled={index === concepts.length - 1}
                                      className="h-6 w-6 p-0 hover:bg-gray-100"
                                      title="Bajar"
                                    >
                                      <ChevronDown className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => removeConcept(concept.id)}
                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      title="Eliminar"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Estadísticas rápidas */}
                  {concepts.length > 0 && (
                    <div className="flex items-center justify-between text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span>Total conceptos: <strong>{concepts.filter(c => c.type === 'concept').length}</strong></span>
                        <span>Total títulos: <strong>{concepts.filter(c => c.type === 'title').length}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Subtotal:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(subtotal)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Resumen Mejorado */}
                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-red-800 mb-2">Resumen del Presupuesto</h3>
                      <p className="text-sm text-red-600">Detalles financieros del presupuesto actual</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-red-600 mb-1">Folio estimado</p>
                      <p className="text-2xl font-bold text-red-700">
                        {String(Math.max(...budgets.map(b => parseInt(b.folio) || 0), 0) + 1).padStart(4, '0')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                      <p className="text-2xl font-bold text-gray-800">{formatCurrency(subtotal)}</p>
                      <p className="text-xs text-gray-500 mt-1">{concepts.filter(c => c.type === 'concept').length} conceptos</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">IVA ({ivaPercentage}%)</p>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(ivaAmount)}</p>
                      <p className="text-xs text-gray-500 mt-1">Impuesto incluido</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-center text-white">
                      <p className="text-sm text-green-100 mb-1">TOTAL</p>
                      <p className="text-3xl font-bold">{formatCurrency(total)}</p>
                      <p className="text-xs text-green-100 mt-1">Monto final</p>
                    </div>
                  </div>

                  {concepts.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-red-200">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex gap-6">
                          <span className="text-gray-600">
                            <strong>{concepts.filter(c => c.type === 'concept').length}</strong> conceptos • 
                            <strong> {concepts.filter(c => c.type === 'title').length}</strong> títulos
                          </span>
                          <span className="text-gray-600">
                            Fecha: <strong>{budgetDate}</strong>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-600">Cliente: </span>
                          <span className="font-semibold text-red-700">
                            {clients.find(c => c.id === selectedClient)?.name || 'No seleccionado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones de acción mejorados */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">¿Listo para guardar?</p>
                    <p className="text-xs">Revisa que todos los datos estén correctos antes de guardar</p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={clearBudgetForm}
                      className="px-6 hover:bg-gray-100"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Limpiar Formulario
                    </Button>
                    <Button
                      onClick={saveBudget}
                      disabled={!selectedClient || !selectedRecipient || concepts.length === 0}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-6 shadow-lg"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isEditMode ? 'Actualizar Presupuesto' : 'Guardar Presupuesto'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clientes */}
          <TabsContent value="clients" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Clientes */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <Users className="w-6 h-6 text-blue-600" />
                        Clientes
                      </CardTitle>
                      <CardDescription className="text-gray-600 mt-2">
                        Gestiona los clientes de tu empresa
                      </CardDescription>
                    </div>
                    <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Agregar Cliente
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
                          <DialogDescription>
                            Completa los datos del nuevo cliente
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="client-name">Nombre *</Label>
                            <Input
                              id="client-name"
                              value={clientForm.name}
                              onChange={(e) => setClientForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Nombre del cliente"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="client-email">Email</Label>
                            <Input
                              id="client-email"
                              type="email"
                              value={clientForm.email}
                              onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="email@ejemplo.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="client-phone">Teléfono</Label>
                            <Input
                              id="client-phone"
                              value={clientForm.phone}
                              onChange={(e) => setClientForm(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="+52 (667) 123-4567"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="client-address">Dirección</Label>
                            <Textarea
                              id="client-address"
                              value={clientForm.address}
                              onChange={(e) => setClientForm(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="Dirección completa"
                              className="min-h-[80px] resize-none"
                            />
                          </div>
                          <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setClientDialogOpen(false)}>
                              Cancelar
                            </Button>
                            <Button onClick={addClient} className="bg-blue-600 hover:bg-blue-700">
                              Agregar Cliente
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {clients.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium text-gray-500">No hay clientes registrados</p>
                      <p className="text-sm text-gray-400">Agrega tu primer cliente para comenzar</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {clients.map(client => (
                        <div key={client.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <h4 className="font-semibold text-lg">{client.name}</h4>
                          {client.email && <p className="text-sm text-gray-600">{client.email}</p>}
                          {client.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
                          {client.address && <p className="text-sm text-gray-500">{client.address}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Destinatarios */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <Users className="w-6 h-6 text-green-600" />
                        Destinatarios
                      </CardTitle>
                      <CardDescription className="text-gray-600 mt-2">
                        Gestiona los destinatarios por cliente
                      </CardDescription>
                    </div>
                    <Dialog open={recipientDialogOpen} onOpenChange={setRecipientDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Agregar Destinatario
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Agregar Nuevo Destinatario</DialogTitle>
                          <DialogDescription>
                            Completa los datos del nuevo destinatario
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="recipient-client">Cliente *</Label>
                            <Select value={recipientForm.clientId} onValueChange={(value) => setRecipientForm(prev => ({ ...prev, clientId: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar cliente" />
                              </SelectTrigger>
                              <SelectContent>
                                {clients.map(client => (
                                  <SelectItem key={client.id} value={client.id}>
                                    {client.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="recipient-name">Nombre *</Label>
                            <Input
                              id="recipient-name"
                              value={recipientForm.name}
                              onChange={(e) => setRecipientForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Nombre del destinatario"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="recipient-email">Email</Label>
                            <Input
                              id="recipient-email"
                              type="email"
                              value={recipientForm.email}
                              onChange={(e) => setRecipientForm(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="email@ejemplo.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="recipient-phone">Teléfono</Label>
                            <Input
                              id="recipient-phone"
                              value={recipientForm.phone}
                              onChange={(e) => setRecipientForm(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="+52 (667) 123-4567"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="recipient-position">Puesto</Label>
                            <Input
                              id="recipient-position"
                              value={recipientForm.position}
                              onChange={(e) => setRecipientForm(prev => ({ ...prev, position: e.target.value }))}
                              placeholder="Gerente, Encargado, etc."
                            />
                          </div>
                          <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setRecipientDialogOpen(false)}>
                              Cancelar
                            </Button>
                            <Button onClick={addRecipient} className="bg-green-600 hover:bg-green-700">
                              Agregar Destinatario
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {recipients.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium text-gray-500">No hay destinatarios registrados</p>
                      <p className="text-sm text-gray-400">Agrega destinatarios para tus clientes</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {recipients.map(recipient => {
                        const client = clients.find(c => c.id === recipient.clientId)
                        return (
                          <div key={recipient.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <h4 className="font-semibold text-lg">{recipient.name}</h4>
                            {recipient.email && <p className="text-sm text-gray-600">{recipient.email}</p>}
                            {recipient.phone && <p className="text-sm text-gray-600">{recipient.phone}</p>}
                            {recipient.position && <p className="text-sm text-gray-500">{recipient.position}</p>}
                            {client && (
                              <Badge variant="outline" className="mt-2">
                                {client.name}
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Toaster />
    </div>
  )
}