const fs = require('fs');
const FormData = require('form-data');

// Test the import functionality
async function testImport() {
  try {
    // Read the test CSV file
    const csvContent = fs.readFileSync('/home/z/my-project/test_import.csv');
    
    // Create form data
    const form = new FormData();
    form.append('file', csvContent, {
      filename: 'test_import.csv',
      contentType: 'text/csv'
    });
    
    console.log('Testing import API...');
    
    // Send request to import API
    const response = await fetch('http://127.0.0.1:3000/api/budgets/import', {
      method: 'POST',
      headers: {
        ...form.getHeaders()
      },
      body: form
    });
    
    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Import result:', result);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run test
testImport();