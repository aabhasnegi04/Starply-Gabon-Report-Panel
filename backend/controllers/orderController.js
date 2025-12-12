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

module.exports = { getOrderListByDate, getOrderListByDeliveryDate, getPendingOrders, getPendingSubOrders, getCurrentMonthSummary, getDateWiseSummary };
