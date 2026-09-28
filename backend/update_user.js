const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function updateCustomerUser() {
  const name = 'Dukkipati Sanjitha';
  const email = 'sanjithadukkipati06@gmail.com';
  const rawPass = 'sanjitha@123';

  const hash = await bcrypt.hash(rawPass, 10);

  // Check if user 1 exists or if email exists
  const [existing] = await pool.execute('SELECT id FROM users WHERE id = 1 OR LOWER(email) = ?', [email.toLowerCase()]);
  
  if (existing && existing.length > 0) {
    const targetId = existing[0].id;
    console.log(`Updating existing user ID ${targetId} to ${name} (${email})...`);
    await pool.execute(
      'UPDATE users SET name = ?, email = ?, password_hash = ?, role = ? WHERE id = ?',
      [name, email.toLowerCase(), hash, 'customer', targetId]
    );
  } else {
    console.log(`Inserting new user ${name} (${email})...`);
    await pool.execute(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [1, name, email.toLowerCase(), hash, 'customer']
    );
  }

  // Also check tickets for user_id = 1
  const [tickets] = await pool.execute('SELECT id, subject FROM tickets WHERE user_id = 1');
  console.log(`User ID 1 has ${tickets.length} tickets.`);

  console.log('✅ User updated successfully!');
}

updateCustomerUser().then(() => process.exit(0)).catch(err => {
  console.error('Error updating user:', err);
  process.exit(1);
});
