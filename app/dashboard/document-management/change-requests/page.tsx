import { redirect } from 'next/navigation';
import { createClient } from '@/lib/auth/server';
import { ChangeRequestsClient } from './ChangeRequestsClient';

export default async function ChangeRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Mock data for now - will be replaced with real database queries
  const changeRequests = [
    {
      id: '1',
      documentTitle: 'Update Safety Procedure Document',
      documentNumber: 'SP-0023',
      revision: '2.3',
      requestDate: '2025-10-15',
      requestedBy: 'John Smith',
      department: 'Safety',
      changeType: 'Update',
      reason: 'New regulations',
      description: 'Update procedures to comply with new safety regulations.',
      priority: 'high' as const,
      impactAssessment: 'Improved compliance and safety.',
      status: 'pending' as const,
    },
    {
      id: '2',
      documentTitle: 'Revise Training Material',
      documentNumber: 'TM-0101',
      revision: '1.1',
      requestDate: '2025-10-14',
      requestedBy: 'Jane Doe',
      department: 'HR',
      changeType: 'Revision',
      reason: 'Annual update',
      description: 'Revise training manual for new onboarding process.',
      priority: 'medium' as const,
      impactAssessment: 'Better onboarding experience.',
      status: 'approved' as const,
    },
    {
      id: '3',
      documentTitle: 'Add Compliance Section',
      documentNumber: 'ISO-9001',
      revision: '3.0',
      requestDate: '2025-10-12',
      requestedBy: 'Mike Johnson',
      department: 'Compliance',
      changeType: 'Addition',
      reason: 'ISO audit',
      description: 'Add compliance section for ISO-9001 requirements.',
      priority: 'low' as const,
      impactAssessment: 'Pass ISO audit.',
      status: 'rejected' as const,
    },
    {
      id: '4',
      documentTitle: 'Update Emergency Contacts',
      documentNumber: 'ERP-2025',
      revision: '2.0',
      requestDate: '2025-10-10',
      requestedBy: 'Sarah Williams',
      department: 'Operations',
      changeType: 'Update',
      reason: 'Staff changes',
      description: 'Update emergency contacts for new staff.',
      priority: 'high' as const,
      impactAssessment: 'Accurate emergency response.',
      status: 'in-review' as const,
    },
  ];

  return <ChangeRequestsClient changeRequests={changeRequests} />;
}
