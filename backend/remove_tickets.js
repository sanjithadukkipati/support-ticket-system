const pool = require('./config/db');

async function removeTicketsAndData() {
  console.log('🧹 Removing tickets TICK-3 and TICK-4 and associated comments...');

  // Target ticket IDs: 3 and 4 (or any tickets with subject matching 'uhbhsbcd' or 'Password reset link expired before arrival')
  const [targetTickets] = await pool.execute(
    "SELECT id, subject, user_id FROM tickets WHERE id IN (3, 4) OR subject LIKE '%uhbhsbcd%' OR subject LIKE '%Password reset link expired%'"
  );

  console.log('Found matching tickets to remove:', targetTickets);

  for (const t of targetTickets) {
    // Delete comments
    const [cRes] = await pool.execute('DELETE FROM ticket_comments WHERE ticket_id = ?', [t.id]);
    console.log(`Deleted comments for ticket TICK-${t.id}:`, cRes);

    // Delete ticket
    const [tRes] = await pool.execute('DELETE FROM tickets WHERE id = ?', [t.id]);
    console.log(`Deleted ticket TICK-${t.id}:`, tRes);
  }

  // Also remove user 'Bob Smith' (customer2@example.com) if no other tickets exist for him
  const [bob] = await pool.execute("SELECT id FROM users WHERE email = 'customer2@example.com'");
  if (bob && bob.length > 0) {
    const bobId = bob[0].id;
    const [bobTickets] = await pool.execute('SELECT id FROM tickets WHERE user_id = ?', [bobId]);
    if (bobTickets.length === 0) {
      const [uRes] = await pool.execute('DELETE FROM users WHERE id = ?', [bobId]);
      console.log(`Deleted user Bob Smith (customer2@example.com):`, uRes);
    }
  }

  // Verify remaining tickets
  const [remaining] = await pool.execute('SELECT id, subject, user_id FROM tickets');
  console.log('Remaining tickets in database:', remaining);

  console.log('✅ Removal completed successfully!');
}

removeTicketsAndData().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
