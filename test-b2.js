// Test script for Backblaze B2 integration

const B2_KEY_ID = '0055bd16936cc670000000001';
const B2_APPLICATION_KEY = 'K005X90npU4rckiLK2vXE9BR2hsQ8L0';
const B2_API_URL = 'https://api.backblazeb2.com';

async function testB2Connection() {
  try {
    console.log('🔍 Testing Backblaze B2 connection...');
    
    // Test authorization
    const authResponse = await fetch(`${B2_API_URL}/b2api/v2/b2_authorize_account`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${B2_KEY_ID}:${B2_APPLICATION_KEY}`).toString('base64')}`,
      },
    });

    if (!authResponse.ok) {
      throw new Error(`Authorization failed: ${authResponse.statusText}`);
    }

    const authData = await authResponse.json();
    console.log('✅ B2 Authorization successful');
    console.log('📊 Account ID:', authData.accountId);
    console.log('🔗 API URL:', authData.apiUrl);
    console.log('📥 Download URL:', authData.downloadUrl);

    // Test bucket listing
    const bucketsResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_list_buckets`, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountId: authData.accountId }),
    });

    if (!bucketsResponse.ok) {
      throw new Error(`Bucket listing failed: ${bucketsResponse.statusText}`);
    }

    const bucketsData = await bucketsResponse.json();
    console.log('✅ Bucket listing successful');
    console.log('📁 Response:', JSON.stringify(bucketsData, null, 2));
    
    if (bucketsData.buckets) {
      console.log('📁 Available buckets:', bucketsData.buckets.map(b => b.bucketName));
    }
    
    const targetBucket = bucketsData.buckets.find(b => b.bucketName === 'cloudnote-pdfs');
    if (targetBucket) {
      console.log('✅ Target bucket "cloudnote-pdfs" found');
      console.log('🆔 Bucket ID:', targetBucket.bucketId);
    } else {
      console.log('⚠️ Target bucket "cloudnote-pdfs" not found');
      console.log('💡 Available buckets:', bucketsData.buckets.map(b => b.bucketName));
    }

    console.log('\n🎉 B2 integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ B2 test failed:', error.message);
    console.error('🔍 Full error:', error);
  }
}

testB2Connection();