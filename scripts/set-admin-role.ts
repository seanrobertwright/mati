import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

import { createAdminClient } from '../lib/auth/admin';

async function setAdminRole() {
  try {
    const adminClient = createAdminClient();
    
    const targetEmail = 'seanrobertwright@gmail.com';
    
    console.log(`🔍 Looking for user: ${targetEmail}`);
    
    // Get all users
    const { data, error } = await adminClient.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error fetching users:', error);
      process.exit(1);
    }
    
    // Find the target user
    const user = data.users.find(u => u.email === targetEmail);
    
    if (!user) {
      console.error(`❌ User not found: ${targetEmail}`);
      console.log('Available users:', data.users.map(u => u.email));
      process.exit(1);
    }
    
    console.log(`✓ Found user: ${user.email} (ID: ${user.id})`);
    console.log(`  Current role: ${user.app_metadata?.role || 'none'}`);
    
    // Update user role to admin
    const { data: updateData, error: updateError } = await adminClient.auth.admin.updateUserById(
      user.id,
      {
        app_metadata: {
          ...user.app_metadata,
          role: 'admin',
        },
      }
    );
    
    if (updateError) {
      console.error('❌ Error updating user:', updateError);
      process.exit(1);
    }
    
    console.log(`✅ Successfully set ${targetEmail} as admin!`);
    console.log(`  New role: ${updateData.user.app_metadata?.role}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Script error:', error);
    process.exit(1);
  }
}

setAdminRole();
