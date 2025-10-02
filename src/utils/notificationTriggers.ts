import { createNotificationFromTemplate } from '@/lib/notifications/create';
import { createClient } from '@/lib/supabase/server';

/**
 * Check and create certificate expiry notifications
 */
export async function checkCertificateExpiryNotifications() {
  try {
    const supabase = await createClient();
    
    // Get certificates expiring soon (6 months, 3 months, 1 month, 2 weeks)
    const expiryTargets = [
      { days: 180, priority: 'low' as const },
      { days: 90, priority: 'medium' as const },
      { days: 30, priority: 'high' as const },
      { days: 14, priority: 'urgent' as const }
    ];

    for (const target of expiryTargets) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + target.days);
      
      const { data: certificates } = await supabase
        .from('certificates')
        .select('id, certificate_type, expiry_date, user_id')
        .lte('expiry_date', expiryDate.toISOString().split('T')[0])
        .gte('expiry_date', new Date().toISOString().split('T')[0]);

      if (certificates) {
        for (const cert of certificates) {
          const daysUntilExpiry = Math.ceil(
            (new Date(cert.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );

          await createNotificationFromTemplate(cert.user_id, 'certificate_expiry', {
            certificate_type: cert.certificate_type,
            expiry_date: cert.expiry_date,
            days_remaining: daysUntilExpiry,
            priority: target.priority,
            action_url: '/certificates',
            action_text: 'View Certificates'
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking certificate expiry notifications:', error);
  }
}

/**
 * Check and create travel reminder notifications
 */
export async function checkTravelReminderNotifications() {
  try {
    const supabase = await createClient();
    
    const reminderTargets = [
      { hours: 72, priority: 'medium' as const },
      { hours: 24, priority: 'high' as const },
      { hours: 3, priority: 'urgent' as const }
    ];

    for (const target of reminderTargets) {
      const reminderTime = new Date();
      reminderTime.setHours(reminderTime.getHours() + target.hours);
      
      const { data: travels } = await supabase
        .from('travel_schedule')
        .select('id, user_id, departure_date, departure_time, departure_location, travel_type')
        .eq('date', reminderTime.toISOString().split('T')[0])
        .eq('hour', reminderTime.getHours());

      if (travels) {
        for (const travel of travels) {
          await createNotificationFromTemplate(travel.user_id, 'travel_reminder', {
            travel_type: travel.travel_type || 'Travel',
            departure_date: travel.departure_date,
            departure_time: travel.departure_time,
            departure_location: travel.departure_location,
            hours_until: target.hours,
            priority: target.priority,
            action_url: '/dashboard',
            action_text: 'View Schedule'
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking travel reminder notifications:', error);
  }
}

/**
 * Check and create circular acknowledgment reminders
 */
export async function checkCircularReminderNotifications() {
  try {
    const supabase = await createClient();
    
    // Get unacknowledged circulars older than 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const { data: unacknowledgedCirculars } = await supabase
      .from('circulars')
      .select(`
        id,
        title,
        created_at,
        circular_acknowledgments!left(
          user_id,
          acknowledged_at
        )
      `)
      .eq('requires_acknowledgment', true)
      .lt('created_at', threeDaysAgo.toISOString());

    if (unacknowledgedCirculars) {
      for (const circular of unacknowledgedCirculars) {
        const acknowledgedUsers = circular.circular_acknowledgments
          ?.map(ack => ack.user_id) || [];

        // Get all users who haven't acknowledged this circular
        const { data: users } = await supabase
          .from('profiles')
          .select('id')
          .not('id', 'in', `(${acknowledgedUsers.join(',')})`);

        if (users) {
          for (const user of users) {
            const daysOverdue = Math.floor(
              (new Date().getTime() - new Date(circular.created_at).getTime()) / (1000 * 60 * 60 * 24)
            );

            await createNotificationFromTemplate(user.id, 'new_circular', {
              circular_title: circular.title,
              days_overdue: daysOverdue,
              priority: daysOverdue > 7 ? 'urgent' : 'high',
              action_url: `/circulars/${circular.id}`,
              action_text: 'Review Circular'
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking circular reminder notifications:', error);
  }
}

/**
 * Check and create sign-off reminder notifications
 */
export async function checkSignOffReminderNotifications() {
  try {
    const supabase = await createClient();
    
    // Get all active crew members
    const { data: crewMembers } = await supabase
      .from('profiles')
      .select('id, rank, vessel_id')
      .eq('employment_status', 'active');

    if (crewMembers) {
      for (const crew of crewMembers) {
        // Check if they haven't completed sign-off in the past week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const { data: recentSignOff } = await supabase
          .from('signoff_checklists')
          .select('id')
          .eq('user_id', crew.id)
          .gte('completed_at', oneWeekAgo.toISOString())
          .single();

        if (!recentSignOff) {
          const vesselName = crew.vessel_id ? 
            await getVesselName(crew.vessel_id) : 'the vessel';

          await createNotificationFromTemplate(crew.id, 'signoff_reminder', {
            vessel_name: vesselName,
            priority: 'medium',
            action_url: '/signoff',
            action_text: 'Complete Sign-off'
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking sign-off reminder notifications:', error);
  }
}

/**
 * Helper function to get vessel name
 */
async function getVesselName(vesselId: string): Promise<string> {
  try {
    const supabase = await createClient();
    const { data: vessel } = await supabase
      .from('vessels')
      .select('name')
      .eq('id', vesselId)
      .single();
    
    return vessel?.name || 'the vessel';
  } catch (error) {
    console.error('Error getting vessel name:', error);
    return 'the vessel';
  }
}

/**
 * Run all notification checks
 */
export async function runAllNotificationChecks() {
  try {
    console.log('Starting notification checks...');
    
    await Promise.all([
      checkCertificateExpiryNotifications(),
      checkTravelReminderNotifications(),
      checkCircularReminderNotifications(),
      checkSignOffReminderNotifications()
    ]);
    
    console.log('All notification checks completed.');
  } catch (error) {

  }
}

/**
 * Create notification for new circular publication
 */
export async function notifyNewCircular(circularId: string) {
  try {
    const supabase = await createClient();
    
    // Get circular details
    const { data: circular } = await supabase
      .from('circulars')
      .select('title, requires_acknowledgment')
      .eq('id', circularId)
      .single();

    if (!circular) return;

    // Get all active users
    const { data: users } = await supabase
      .from('profiles')
      .select('id')
      .eq('employment_status', 'active');

    if (users) {
      for (const user of users) {
        await createNotificationFromTemplate(user.id, 'new_circular', {
          circular_title: circular.title,
          requires_acknowledgment: circular.requires_acknowledgment,
          priority: circular.requires_acknowledgment ? 'high' : 'medium',
          action_url: `/circulars/${circularId}`,
          action_text: circular.requires_acknowledgment ? 'Review & Acknowledge' : 'View Circular'
        });
      }
    }
  } catch (error) {
    console.error('Error notifying new circular:', error);
  }
}

/**
 * Create notification for document updates
 */
export async function notifyDocumentUpdate(
  userId: string, 
  documentName: string, 
  action: 'updated' | 'deleted' | 'shared'
) {
  try {
    await createNotificationFromTemplate(userId, 'document_update', {
      document_name: documentName,
      action: action,
      priority: 'low',
      action_url: '/documents',
      action_text: 'View Documents'
    });
  } catch (error) {
    console.error('Error notifying document update:', error);
  }
}
