// src/components/ReportePDF.tsx
import { 
  Page, 
  View, 
  Text, 
  Image, 
  Font,
  Document,
  StyleSheet 
} from '@react-pdf/renderer';

// Opcional: Registrar una fuente si necesitas una específica
// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap',
// });

// Definimos los estilos, igual que en CSS pero en JS
const styles = StyleSheet.create({
  page: {
    // Tamaño de la página
    size: 'LETTER',
    // La imagen de fondo se define aquí
    backgroundImage: '/membrete.png',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
  },
  contentLayer: {
    // Estos son los márgenes que querías. ¡Sencillo y directo!
    marginTop: 4.5 * 72, // 4.5 cm a puntos (1 cm ≈ 28.35 pt)
    marginRight: 2 * 72,
    marginBottom: 5 * 72,
    marginLeft: 2 * 72,
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 4,
  },
  table: {
    display: 'table',
    width: 'auto',
    marginBottom: 24,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '20%',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 8,
  },
  tableCol: {
    width: '20%',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
  },
  tableCellHeader: {
    margin: 'auto',
    marginHorizontal: 8,
    fontSize: 11,
    fontWeight: 'bold',
  },
  tableCell: {
    margin: 'auto',
    marginHorizontal: 8,
    fontSize: 11,
  },
  footer: {
    position: 'absolute',
    bottom: 5 * 72, // 5 cm desde el fondo
    right: 2 * 72,  // 2 cm desde la derecha
    left: 2 * 72,   // 2 cm desde la izquierda
    fontSize: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    borderTopStyle: 'solid',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  grandTotal: {
    fontWeight: 'bold',
    fontSize: 14,
  }
});

// Formateador de moneda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);
};

// El componente del Documento PDF
export const ReportePDF = ({ budget, concepts }: any) => (
  <Document>
    <Page size="LETTER" style={styles.page}>
      <View style={styles.contentLayer}>
        {/* --- ENCABEZADO --- */}
        <View style={styles.header}>
          <View>
            <Text style={styles.label}>ATENCIÓN</Text>
            <Text>{budget.client.name}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 11 }}>COTIZACIÓN {budget.folio}</Text>
            <Text style={{ fontSize: 12 }}>
              {new Date(budget.date).toLocaleDateString('es-MX', { timeZone: 'UTC' })}
            </Text>
          </View>
        </View>

        {/* --- DESCRIPCIÓN --- */}
        <Text style={{ marginBottom: 24 }}>{budget.description}</Text>

        {/* --- TABLA --- */}
        <View style={styles.table}>
          {/* Cabecera de la tabla */}
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Código</Text>
            </View>
            <View style={{...styles.tableColHeader, width: '40%'}}>
              <Text style={styles.tableCellHeader}>Concepto</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Unidad</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Cantidad</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>P.U.</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Total</Text>
            </View>
          </View>
          {/* Filas de la tabla */}
          {concepts.map((concept: any) => (
            <View style={styles.tableRow} key={concept.id}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{concept.key}</Text>
              </View>
              <View style={{...styles.tableCol, width: '40%'}}>
                <Text style={styles.tableCell}>{concept.description}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{concept.unit}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{concept.quantity}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{formatCurrency(concept.unitPrice)}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{formatCurrency(concept.total)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* --- FOOTER --- */}
      <View style={styles.footer}>
        <View style={{ width: 250 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>Subtotal</Text>
            <Text>{formatCurrency(budget.subtotal)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>I.V.A.16%</Text>
            <Text>{formatCurrency(budget.ivaAmount)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.grandTotal}>TOTAL</Text>
            <Text style={styles.grandTotal}>{formatCurrency(budget.total)}</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);