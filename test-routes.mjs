/**
 * Test script to verify API routing
 */
const BASE_URL = 'https://sparkie-ai-exz4v.ondigitalocean.app';

async function testRoute(path, method = 'GET') {
  console.log(`\n${method} ${path}`);
  console.log('-'.repeat(50));

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const contentType = response.headers.get('content-type');
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${contentType}`);

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('Response (first 200 chars):', text.substring(0, 200));
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
}

async function main() {
  console.log('Testing Sparkie API Routes');
  console.log('='.repeat(60));

  // Test health endpoint
  await testRoute('/health');

  // Test API root
  await testRoute('/api/v1');

  // Test register endpoint (this should fail with proper JSON error, not HTML)
  await testRoute('/api/v1/auth/register', 'POST');

  console.log('\n' + '='.repeat(60));
  console.log('Tests complete');
}

main();
