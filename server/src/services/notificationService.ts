import { v4 as uuidv4 } from 'uuid';
import { dbStore } from '../repositories/store.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
import {
  EmergencyIncident,
  IncidentLocation,
  UserProfile,
  IncidentNotification,
  DeliveryStatus
} from '@safewalk/shared-types';

class NotificationService {
  /**
   * Dispatches emergency notifications to all verified trusted contacts for an active incident.
   */
  async notifyTrustedContacts(
    incident: EmergencyIncident,
    user: UserProfile,
    location?: IncidentLocation | null
  ): Promise<IncidentNotification[]> {
    const storedUser = dbStore.users.get(user.id);
    const contacts = storedUser?.contacts || [];

    if (contacts.length === 0) {
      logger.warn('No trusted emergency contacts configured for user', { userId: user.id, incidentId: incident.id });
      return [];
    }

    const liveTrackingUrl = `${config.webAppUrl}/dashboard/incidents/${incident.id}`;
    const notifications: IncidentNotification[] = [];

    for (const contact of contacts) {
      const notificationId = uuidv4();
      const attemptedAt = new Date().toISOString();
      let deliveryStatus: DeliveryStatus = 'delivered';
      let providerMessageId = `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Simulate real provider dispatch
      try {
        logger.info(`Emergency alert dispatched to trusted contact: ${contact.contact_name}`, {
          phone: contact.phone_number,
          email: contact.email,
          trackingUrl: liveTrackingUrl,
          location: location ? `${location.latitude}, ${location.longitude}` : 'Location pending'
        });
      } catch (err) {
        deliveryStatus = 'failed';
        providerMessageId = '';
        logger.error('Failed to dispatch emergency notification', { contactId: contact.id, error: String(err) });
      }

      const notifRecord: IncidentNotification = {
        id: notificationId,
        incident_id: incident.id,
        recipient_type: 'trusted_contact',
        recipient_reference: `${contact.contact_name} (${contact.phone_number})`,
        provider: 'mock',
        delivery_status: deliveryStatus,
        provider_message_id: providerMessageId,
        attempted_at: attemptedAt,
        delivered_at: deliveryStatus === 'delivered' ? new Date().toISOString() : null,
        error_code: null
      };

      notifications.push(notifRecord);

      // Save to store
      const incidentNotifs = dbStore.notifications.get(incident.id) || [];
      incidentNotifs.push(notifRecord);
      dbStore.notifications.set(incident.id, incidentNotifs);
    }

    // Add timeline event
    const timelineEvents = dbStore.timeline.get(incident.id) || [];
    timelineEvents.push({
      id: uuidv4(),
      incident_id: incident.id,
      event_type: 'contact_notified',
      event_description: `Emergency alert dispatched to ${contacts.length} trusted emergency contacts`,
      event_metadata: { contact_count: contacts.length },
      created_at: new Date().toISOString()
    });
    dbStore.timeline.set(incident.id, timelineEvents);

    return notifications;
  }

  /**
   * Sends cancellation notice to emergency contacts if incident was triggered by accident.
   */
  async notifyCancellation(incident: EmergencyIncident, user: UserProfile, reason?: string) {
    const storedUser = dbStore.users.get(user.id);
    const contacts = storedUser?.contacts || [];

    for (const contact of contacts) {
      logger.info(`Incident cancellation update sent to: ${contact.contact_name}`, {
        incidentId: incident.id,
        reason: reason || 'User verified safe / Accidental activation'
      });
    }

    // Record timeline item
    const timelineEvents = dbStore.timeline.get(incident.id) || [];
    timelineEvents.push({
      id: uuidv4(),
      incident_id: incident.id,
      event_type: 'cancelled',
      event_description: `SOS cancelled by user. Safe status confirmed. Reason: ${reason || 'Accidental activation'}`,
      event_metadata: { reason },
      created_at: new Date().toISOString()
    });
    dbStore.timeline.set(incident.id, timelineEvents);
  }
}

export const notificationService = new NotificationService();
