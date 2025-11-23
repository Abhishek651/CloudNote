import dotenv from 'dotenv';
import b2Service from './src/services/b2Service.js';
dotenv.config();

async function testB2Connection() {
  try {
    console.log('Testing B2 connection...');
    await b2Service.authorize();
    console.log('✅ B2 authorization successful');
    
    // Test upload with dummy data
    const testBuffer = Buffer.from('Test PDF content');
    const fileName = `test/test-${Date.now()}.pdf`;
    
    console.log('Testing file upload...');
    const uploadResult = await b2Service.uploadFile(testBuffer, fileName);
    console.log('✅ Upload successful:', uploadResult.fileName);
    
    console.log('Testing file download...');
    const downloadResult = await b2Service.downloadFile(fileName);
    console.log('✅ Download successful, size:', downloadResult.length);
    
    console.log('Testing file deletion...');
    await b2Service.deleteFile(fileName);
    console.log('✅ Delete successful');
    
    console.log('🎉 All B2 tests passed!');
  } catch (error) {
    console.error('❌ B2 test failed:', error.message);
  }
}

testB2Connection();