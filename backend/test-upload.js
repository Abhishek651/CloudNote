import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Create a test PDF buffer
const testPdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF');

async function testUpload() {
  try {
    const formData = new FormData();
    formData.append('pdf', testPdfContent, {
      filename: 'test.pdf',
      contentType: 'application/pdf'
    });

    console.log('Testing B2 upload...');
    const response = await fetch('http://localhost:5000/api/upload/b2', {
      method: 'POST',
      body: formData
    });

    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', result);
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testUpload();