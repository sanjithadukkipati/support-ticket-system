const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function testHashes() {
  const [rows] = await pool.execute('SELECT * FROM users');
  console.log('Total users found in DB:', rows.length);
  for (const user of rows) {
    console.log(`User ID ${user.id} (${user.email}, role: ${user.role}):`);
    console.log('  Hash in DB:', user.password_hash);
    const testCustPass = await bcrypt.compare('password123', user.password_hash);
    const testAgentPass = await bcrypt.compare('agentpass123', user.password_hash);
    console.log('  Matches "password123"?', testCustPass);
    console.log('  Matches "agentpass123"?', testAgentPass);
  }
}

testHashes().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
