// Test script for the generic stored procedure endpoint
const fetch = require('node-fetch');

async function testGenericEndpoint() {
  try {
    console.log('Testing generic stored procedure endpoint...');
    
    const response = await fetch('http://localhost:3001/order/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        procedure: 'proc_getlogcuttingsumyear',
        parameters: {
          year: 2024
        }
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success! Generic endpoint is working');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Error:', data);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testGenericEndpoint();