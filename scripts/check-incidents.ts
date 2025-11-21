import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

import { db } from '../lib/db';
import { incidents } from '../lib/db/schema';

async function checkIncidents() {
  try {
    console.log('Checking incidents in database...\n');
    
    const allIncidents = await db.select().from(incidents);
    
    console.log(`Total incidents: ${allIncidents.length}\n`);
    
    if (allIncidents.length > 0) {
      console.log('Incidents:');
      allIncidents.forEach((incident, index) => {
        console.log(`\n${index + 1}. ${incident.title}`);
        console.log(`   ID: ${incident.id}`);
        console.log(`   User ID: ${incident.userId}`);
        console.log(`   Reported By: ${incident.reportedBy}`);
        console.log(`   Status: ${incident.status}`);
        console.log(`   Severity: ${incident.severity}`);
      });
    } else {
      console.log('No incidents found in database.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking incidents:', error);
    process.exit(1);
  }
}

checkIncidents();
