const { poolPromise, sql, getConnection } = require('../db/connection');

async function login(req, res) {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username and password are required' 
    });
  }

  try {
    // Use getConnection for better error handling
    const pool = await getConnection();
    
    if (!pool) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database service unavailable. Please try again later.' 
      });
    }

    const result = await pool.request()
      .input('username', sql.VarChar(50), username)
      .input('password', sql.VarChar(100), password)
      .query(`
        SELECT USER_ID, USERNAME, ROLE, IS_ACTIVE 
        FROM tb_m_user_report 
        WHERE USERNAME = @username 
        AND PASSWORD = @password 
        AND IS_ACTIVE = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    const user = result.recordset[0];
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      user: {
        userId: user.USER_ID,
        username: user.USERNAME,
        role: user.ROLE
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    
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
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

module.exports = { login };

