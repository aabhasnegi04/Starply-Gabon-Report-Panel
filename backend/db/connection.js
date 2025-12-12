const sql = require('mssql');

const config = {
    user: 'starp',
    password: 'Udhim#2323',
    server: '103.127.31.218',
    port: 1433,
    database: 'star_ply',
    options: {
        encrypt: false, // Disabled because connecting via IP address (TLS requires hostname)
        trustServerCertificate: true // Change to true for local dev/self-signed certs
    }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed! Bad Config: ', err);
    // Don't throw - return a rejected promise instead
    return Promise.reject(err);
  });

module.exports = {
    sql, poolPromise
};
