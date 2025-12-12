const { poolPromise, sql } = require('../db/connection');

async function login(req, res) {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username and password are required' 
    });
  }

  try {
    const pool = await poolPromise;
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
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
}

module.exports = { login };

