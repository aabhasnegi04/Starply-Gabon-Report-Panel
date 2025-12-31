const sql = require('mssql');

const config = {
    user: 'starp',
    password: 'Udhim#2323',
    server: '103.127.31.218',
    port: 1433,
    database: 'star_ply',
    options: {
        encrypt: false, // Disabled because connecting via IP address (TLS requires hostname)
        trustServerCertificate: true, // Change to true for local dev/self-signed certs
        connectTimeout: 30000, 
        requestTimeout: 30000, 
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        }
    }
};

let pool = null;
let connectionAttempts = 0;
const maxRetries = 3;

async function createConnection() {
    if (pool && pool.connected) {
        return pool;
    }

    try {
        connectionAttempts++;
        console.log(`Attempting database connection (attempt ${connectionAttempts}/${maxRetries})...`);
        
        pool = new sql.ConnectionPool(config);
        await pool.connect();
        
        console.log('✅ Connected to MSSQL successfully');
        connectionAttempts = 0; // Reset on successful connection
        return pool;
    } catch (err) {
        console.error(`❌ Database connection failed (attempt ${connectionAttempts}):`, err.message);
        
        if (connectionAttempts >= maxRetries) {
            console.error('🚫 Max connection attempts reached. Database unavailable.');
            throw new Error('Database connection failed after multiple attempts');
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        return createConnection();
    }
}

// Create a lazy connection promise
const poolPromise = createConnection().catch(err => {
    console.error('Initial database connection failed:', err.message);
    return null; // Return null instead of throwing to prevent server crash
});

module.exports = {
    sql, 
    poolPromise,
    getConnection: async () => {
        if (!pool || !pool.connected) {
            return await createConnection();
        }
        return pool;
    }
};
