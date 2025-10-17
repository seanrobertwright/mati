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
      title: 'Update Safety Procedure Document',
      documentName: 'Safety-Procedures-v2.3.pdf',
      requestedBy: 'John Smith',
      requestDate: '2025-10-15',
      status: 'pending' as const,
      priority: 'high' as const,
    },
    {
      id: '2',
      title: 'Revise Training Material',
      documentName: 'Employee-Training-Manual.pdf',
      requestedBy: 'Jane Doe',
      requestDate: '2025-10-14',
      status: 'approved' as const,
      priority: 'medium' as const,
    },
    {
      id: '3',
      title: 'Add Compliance Section',
      documentName: 'ISO-9001-Procedures.pdf',
      requestedBy: 'Mike Johnson',
      requestDate: '2025-10-12',
      status: 'rejected' as const,
      priority: 'low' as const,
    },
    {
      id: '4',
      title: 'Update Emergency Contacts',
      documentName: 'Emergency-Response-Plan.pdf',
      requestedBy: 'Sarah Williams',
      requestDate: '2025-10-10',
      status: 'in-review' as const,
      priority: 'high' as const,
    },
  ];

  return <ChangeRequestsClient changeRequests={changeRequests} />;
}
