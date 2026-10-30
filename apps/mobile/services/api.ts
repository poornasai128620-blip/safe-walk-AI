import {
  UserProfile,
  EmergencyIncident,
  IncidentLocation,
  TrustedContact,
  UserSafetySettings,
  UserConsent
} from '@safewalk/shared-types';

const API_BASE_URL = 'http://localhost:3001/api/v1';

class MobileApiClient {
  private token: string = 'demo-user';

  setToken(t: string) {
    this.token = t;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...(options.headers as Record<string, string> || {})
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'API request failed' }));
      throw new Error(err.message || 'Mobile API Error');
    }

    return res.json() as Promise<T>;
  }

  async createSOS(category: string = 'personal_safety', location?: { latitude: number; longitude: number; accuracy_meters?: number }) {
    return this.request<{ incident: EmergencyIncident; latest_location?: IncidentLocation }>('/incidents', {
      method: 'POST',
      body: JSON.stringify({
        incident_category: category,
        activation_method: 'manual_sos',
        severity: 'critical',
        initial_location: location
      })
    });
  }

  async cancelIncident(id: string, reason?: string) {
    return this.request<{ message: string; incident: EmergencyIncident }>(`/incidents/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async getIncident(id: string) {
    return this.request<any>(`/incidents/${id}`);
  }

  async getContacts() {
    return this.request<TrustedContact[]>('/contacts');
  }

  async getSafetySettings() {
    return this.request<UserSafetySettings>('/safety/settings');
  }
}

export const mobileApi = new MobileApiClient();
