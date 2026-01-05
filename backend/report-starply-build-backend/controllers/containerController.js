const { poolPromise, sql } = require('../db/connection');

async function viewSticker(req, res) {
  const { container } = req.body;
  if (!container) {
    return res.status(400).json({ success: false, message: 'container is required' });
  }
  try {
    const pool = await poolPromise;
    // Request for stored procedure with input @container
    const result = await pool.request()
      .input('container', sql.VarChar(100), container)
      .execute('proc_loading_container_viewsticker');

    // result.recordsets will be an array of recordsets returned by the SP
    res.json({ success: true, data: result.recordsets });
  } catch (err) {
    console.error('Error calling stored procedure:', err);
    res.status(500).json({ success: false, message: 'Database error', error: err.message });
  }
}

async function viewPackingList(req, res) {
  const { container } = req.body;
  if (!container) {
    return res.status(400).json({ success: false, message: 'container is required' });
  }
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('container', sql.VarChar(100), container)
      .execute('proc_loading_container_viewPackingList');

    res.json({ success: true, data: result.recordsets });
  } catch (err) {
    console.error('Error calling stored procedure:', err);
    res.status(500).json({ success: false, message: 'Database error', error: err.message });
  }
}

module.exports = { viewSticker, viewPackingList };
