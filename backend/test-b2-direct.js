import dotenv from 'dotenv';
dotenv.config();

const B2_API_URL = 'https://api.backblazeb2.com';

async function testB2Direct() {
  try {
    console.log('Testing B2 credentials...');
    
    const authResponse = await fetch(`${B2_API_URL}/b2api/v2/b2_authorize_account`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.B2_KEY_ID}:${process.env.B2_APPLICATION_KEY}`).toString('base64')}`,
      },
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      throw new Error(`Auth failed: ${authResponse.status} - ${errorText}`);
    }

    const authData = await authResponse.json();
    console.log('✅ B2 authorization successful');
    console.log('Account ID:', authData.accountId);
    
    // Test bucket access
    const bucketsResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_list_buckets`, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountId: authData.accountId }),
    });

    const bucketsData = await bucketsResponse.json();
    console.log('Buckets response:', bucketsData);
    const bucket = bucketsData.buckets?.find(b => b.bucketName === process.env.B2_BUCKET_NAME);
    
    if (bucket) {
      console.log('✅ Bucket found:', bucket.bucketName);
      console.log('Bucket ID:', bucket.bucketId);
    } else {
      console.log('❌ Bucket not found');
      console.log('Available buckets:', bucketsData.buckets.map(b => b.bucketName));
    }
    
  } catch (error) {
    console.error('❌ B2 test failed:', error.message);
  }
}

testB2Direct();