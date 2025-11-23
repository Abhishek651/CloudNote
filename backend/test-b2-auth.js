
import dotenv from 'dotenv';
dotenv.config();

const B2_API_URL = 'https://api.backblazeb2.com';

async function authorizeB2() {
  const authResponse = await fetch(`${B2_API_URL}/b2api/v2/b2_authorize_account`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.B2_KEY_ID}:${process.env.B2_APPLICATION_KEY}`).toString('base64')}`,
    },
  });

  if (!authResponse.ok) {
    throw new Error('B2 authorization failed');
  }

  return await authResponse.json();
}

async function testB2Auth() {
  try {
    console.log('Testing Backblaze B2 authorization...');
    const authData = await authorizeB2();
    console.log('B2 authorization successful!');
    console.log('Account ID:', authData.accountId);
    
    console.log('Listing buckets...');
    const bucketsResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_list_buckets`, {
        method: 'POST',
        headers: {
          'Authorization': authData.authorizationToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId: authData.accountId }),
      });
  
    const bucketsData = await bucketsResponse.json();
    const bucket = bucketsData.buckets.find(b => b.bucketName === process.env.B2_BUCKET_NAME);

    if (bucket) {
        console.log(`Bucket '${process.env.B2_BUCKET_NAME}' found.`);
    } else {
        console.error(`Bucket '${process.env.B2_BUCKET_NAME}' not found.`);
    }

  } catch (error) {
    console.error('B2 authorization test failed:', error.message);
  }
}

testB2Auth();
