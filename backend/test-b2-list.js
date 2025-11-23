import dotenv from 'dotenv';
dotenv.config();

const B2_API_URL = 'https://api.backblazeb2.com';

async function listB2Files() {
  try {
    // Authorize
    const authResponse = await fetch(`${B2_API_URL}/b2api/v2/b2_authorize_account`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.B2_KEY_ID}:${process.env.B2_APPLICATION_KEY}`).toString('base64')}`,
      },
    });

    const authData = await authResponse.json();
    console.log('✅ B2 authorized');

    // List files
    const listResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_list_file_names`, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        bucketId: process.env.B2_BUCKET_ID,
        maxFileCount: 100
      }),
    });

    const listData = await listResponse.json();
    console.log('Files in bucket:');
    listData.files?.forEach(file => {
      console.log(`- ${file.fileName} (${file.size} bytes)`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listB2Files();