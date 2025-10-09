// Test de conectividad con el backend
console.log('🔗 Probando conectividad con backend...');

// Probar endpoint de health
fetch('http://localhost:8080/health')
  .then(response => {
    console.log('✅ Health endpoint:', response.status, response.statusText);
    return response.json();
  })
  .then(data => {
    console.log('📊 Health data:', data);
  })
  .catch(error => {
    console.error('❌ Error en health:', error.message);
  });

// Probar CORS con OPTIONS
fetch('http://localhost:8080/auth/register', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:5173',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type'
  }
})
  .then(response => {
    console.log('✅ CORS preflight:', response.status, response.statusText);
    console.log('🔐 CORS headers:', {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
      'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
    });
  })
  .catch(error => {
    console.error('❌ Error en CORS preflight:', error.message);
  });