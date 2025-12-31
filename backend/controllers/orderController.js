const { poolPromise, sql } = require('../db/connection');

async function getOrderListByDate(req, res) {
  const { from_date, to_date } = req.body;
  
  if (!from_date || !to_date) {
    return res.status(400).json({ 
      success: false, 
      message: 'from_date and to_date are required' 
    });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('from_date', sql.Date, from_date)
      .input('to_date', sql.Date, to_date)
      .execute('proc_getcurrentorderlistdate');

    // result.recordsets will contain:
    // [0] = order list with delivery month
    // [1] = work order details
    res.json({ success: true, data: result.recordsets });
  } catch (err) {
    console.error('Error calling stored procedure:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Database error', 
      error: err.message 
    });
  }
}

async function getOrderListByDeliveryDate(req, res) {
  const { from_date, to_date } = req.body;
  
  if (!from_date || !to_date) {
    return res.status(400).json({ 
      success: false, 
      message: 'from_date and to_date are required' 
    });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('from_date', sql.Date, from_date)
      .input('to_date', sql.Date, to_date)
      .execute('proc_getcurrentorderlistdatedelivery');

    // result.recordsets will contain:
    // [0] = order list with delivery month
    // [1] = work order details
    res.json({ success: true, data: result.recordsets });
  } catch (err) {
    console.error('Error calling stored procedure:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Database error', 
      error: err.message 
    });
  }
}

async function getPendingOrders(req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .execute('proc_getpendingorders');

    // result.recordsets will contain:
    // [0] = detailed pending orders
    // [1] = summary by client and market (with GRAND TOTAL)
    res.json({ success: true, data: result.recordsets });
  } catch (err) {
    console.error('Error calling stored procedure:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Database error', 
      error: err.message 
    });
  }
}

async function getPendingSubOrders(req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .execute('proc_getorderlist_forsuborderAll');

    // result.recordsets will contain:
    // [0] = detailed pending sub orders
    // [1] = summary by work order (with GRAND TOTAL)
    res.json({ success: true, data: result.recordsets });
  } catch (err) {
    console.error('Error calling stored procedure:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Database error', 
      error: err.message 
    });
  }
}

async function getCurrentMonthSummary(req, res) {
  try {
    const pool = await poolPromise;
    
    // Call stored procedure without parameters - it calculates current month internally
    const result = await pool.request()
      .execute('proc_rp_summary_data_MTD_TD2');

    // result.recordsets will contain:
    // [0] = summary data with MTD and TD columns
    res.json({ success: true, data: result.recordsets });
  } catch (err) {
    console.error('Error calling stored procedure:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Database error', 
      error: err.message 
    });
  }
}

async function getDateWiseSummary(req, res) {
  const { from_date, to_date } = req.body;
  
  if (!from_date || !to_date) {
    return res.status(400).json({ 
      success: false, 
      message: 'from_date and to_date are required' 
    });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('fromdate', sql.Date, from_date)
      .input('todate', sql.Date, to_date)
      .execute('proc_rp_summary_data_MTD_TD');

    // result.recordsets will contain:
    // [0] = summary data with date range and TD columns
    res.json({ success: true, data: result.recordsets });
  } catch (err) {
    console.error('Error calling stored procedure:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Database error', 
      error: err.message 
    });
  }
}

async function getPlywoodDailyOperationsSummary(req, res) {
  const { from_date, to_date } = req.body;
  
  if (!from_date || !to_date) {
    return res.status(400).json({ 
      success: false, 
      message: 'from_date and to_date are required' 
    });
  }

  try {
    const { getConnection } = require('../db/connection');
    const pool = await getConnection();
    
    if (!pool) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database service unavailable. Please try again later.' 
      });
    }

    const result = await pool.request()
      .input('from_date', sql.Date, from_date)
      .input('to_date', sql.Date, to_date)
      .execute('proc_hotpressSummary2');

    // result.recordsets will contain:
    // [0] = detailed data by process, quality, thickness, etc.
    // [1] = summary by process with totals
    // [2] = grand totals
    res.json({ success: true, data: result.recordsets });
  } catch (err) {
    console.error('Error calling stored procedure:', err);
    
    // Check if it's a connection error
    if (err.message.includes('connection') || err.message.includes('timeout')) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database connection error. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Database error', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

// Generic stored procedure execution
async function executeStoredProcedure(req, res) {
  const { procedure, parameters = {} } = req.body;
  
  if (!procedure) {
    return res.status(400).json({ 
      success: false, 
      message: 'procedure name is required' 
    });
  }

  try {
    const pool = await poolPromise;
    const request = pool.request();
    
    // Add parameters dynamically
    Object.entries(parameters).forEach(([key, value]) => {
      // Auto-detect parameter type based on value
      if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value))) {
        request.input(key, sql.Date, value);
      } else if (typeof value === 'number') {
        if (Number.isInteger(value)) {
          request.input(key, sql.Int, value);
        } else {
          request.input(key, sql.Float, value);
        }
      } else if (typeof value === 'string') {
        request.input(key, sql.NVarChar, value);
      } else if (typeof value === 'boolean') {
        request.input(key, sql.Bit, value);
      } else {
        // Default to string for unknown types
        request.input(key, sql.NVarChar, String(value));
      }
    });

    const result = await request.execute(procedure);
    
    res.json({ 
      success: true, 
      data: result.recordsets,
      procedure: procedure,
      parameters: parameters
    });
  } catch (err) {
    console.error('Error executing stored procedure:', err);
    
    // Check if it's a connection error
    if (err.message.includes('connection') || err.message.includes('timeout')) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database connection error. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Database error', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      procedure: procedure
    });
  }
}

module.exports = { getOrderListByDate, getOrderListByDeliveryDate, getPendingOrders, getPendingSubOrders, getCurrentMonthSummary, getDateWiseSummary, getPlywoodDailyOperationsSummary, executeStoredProcedure };
