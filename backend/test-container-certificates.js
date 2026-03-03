const sql = require('mssql');

const config = {
    user: 'starp',
    password: 'Udhim#2323',
    server: '103.127.31.218',
    port: 1433,
    database: 'star_ply',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        connectTimeout: 30000, 
        requestTimeout: 30000
    }
};

async function checkContainerCertificates() {
    const container = 'TXGU5472266';
    
    try {
        console.log('Connecting to database...');
        const pool = await sql.connect(config);
        console.log('Connected successfully\n');

        // Step 1: Get the order number and market
        console.log('=== STEP 1: Getting Order and Market Info ===');
        const orderQuery = `
            SELECT 
                s.ORDERNO,
                w.MARKET,
                w.Work_OrderNo,
                w.Client_Name as CONSIGNEE
            FROM tb_SUBORDERLIST_MASTER s
            LEFT JOIN tb_m_WORK_ORDER w ON s.ORDERNO = w.Work_OrderNo
            WHERE s.CONTAINER_NO = @container
        `;
        const orderResult = await pool.request()
            .input('container', sql.VarChar, container)
            .query(orderQuery);
        
        if (orderResult.recordset.length === 0) {
            console.log('❌ Container not found in database');
            return;
        }
        
        const orderInfo = orderResult.recordset[0];
        console.log('Order Info:', orderInfo);
        console.log('');

        // Step 2: Check market brand data
        console.log('=== STEP 2: Checking Market Brand Data ===');
        const marketQuery = `
            SELECT 
                MARKET,
                CE,
                MILLNO,
                FSCCERTIFICATENO,
                KOMOCERTIFICATENO,
                UKCANO,
                [STANDARD],
                EMISSION,
                -- Show what the procedure will return
                IIF(len(CE) < 2, MILLNO, CE) AS CERTIFICATE1,
                FSCCERTIFICATENO as CERTIFICATE2,
                IIF(len(KOMOCERTIFICATENO) < 2, UKCANO, KOMOCERTIFICATENO) AS CERTIFICATE3,
                IIF(len([STANDARD]) < 2, EMISSION, [STANDARD]) AS CERTIFICATE4
            FROM tb_m_order_marketBRAND 
            WHERE MARKET = @market
        `;
        const marketResult = await pool.request()
            .input('market', sql.VarChar, orderInfo.MARKET)
            .query(marketQuery);
        
        if (marketResult.recordset.length === 0) {
            console.log(`❌ No market brand data found for MARKET: ${orderInfo.MARKET}`);
        } else {
            console.log('Market Brand Data:');
            console.log(marketResult.recordset[0]);
            console.log('');
            
            console.log('=== CERTIFICATE VALUES (as they will appear) ===');
            const cert = marketResult.recordset[0];
            console.log('CERTIFICATE1:', cert.CERTIFICATE1 || '(empty)');
            console.log('CERTIFICATE2:', cert.CERTIFICATE2 || '(empty)');
            console.log('CERTIFICATE3:', cert.CERTIFICATE3 || '(empty)');
            console.log('CERTIFICATE4:', cert.CERTIFICATE4 || '(empty)');
        }

        await pool.close();
        console.log('\n✅ Query completed');
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

checkContainerCertificates();
