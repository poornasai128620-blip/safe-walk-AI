import {
  UserProfile,
  EmergencyIncident,
  IncidentLocation,
  EmergencyEvidence,
  TrustedContact,
  UserSafetySettings,
  UserConsent,
  IncidentDispatch,
  AuthorizedCamera,
  CameraAccessRequest,
  AuditLog,
  EmergencySpeechAnalysisResult,
  IncidentClassificationResult,
  IncidentSummaryResult
} from '@safewalk/shared-types';

const API_BASE = '/api/v1';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('safewalk_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('safewalk_token', token);
    } else {
      localStorage.removeItem('safewalk_token');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('safewalk_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    const currentToken = this.getToken();
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      let errorMessage = 'An unexpected API error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  }

  // ---------------------------------------------------------------------------
  // Auth & Profile
  // ---------------------------------------------------------------------------
  async login(email: string, password: string): Promise<{ token: string; user: UserProfile; safety_settings: UserSafetySettings }> {
    const res = await this.request<{ token: string; user: UserProfile; safety_settings: UserSafetySettings }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(res.token);
    return res;
  }

  async register(data: Record<string, unknown>): Promise<{ token: string; user: UserProfile }> {
    const res = await this.request<{ token: string; user: UserProfile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    this.setToken(res.token);
    return res;
  }

  async getMe(): Promise<{ user: UserProfile; safety_settings: UserSafetySettings; trusted_contacts: TrustedContact[]; consents: UserConsent[] }> {
    return this.request('/auth/me');
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  // ---------------------------------------------------------------------------
  // Incidents & SOS
  // ---------------------------------------------------------------------------
  async createIncident(data: {
    incident_category?: string;
    activation_method?: string;
    severity?: string;
    description?: string;
    initial_location?: { latitude: number; longitude: number; accuracy_meters?: number };
    idempotency_key?: string;
  }): Promise<{ incident: EmergencyIncident; latest_location?: IncidentLocation; dispatch?: IncidentDispatch }> {
    return this.request('/incidents', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getIncidents(): Promise<EmergencyIncident[]> {
    return this.request('/incidents');
  }

  async getIncident(id: string): Promise<EmergencyIncident & {
    location_history: IncidentLocation[];
    evidence: EmergencyEvidence[];
    dispatch: IncidentDispatch | null;
    nearby_cameras: Array<AuthorizedCamera & { distance_meters: number }>;
    cctv_requests: CameraAccessRequest[];
  }> {
    return this.request(`/incidents/${id}`);
  }

  async updateIncidentStatus(id: string, status: string, reason?: string): Promise<EmergencyIncident> {
    return this.request(`/incidents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason })
    });
  }

  async cancelIncident(id: string, reason?: string): Promise<{ message: string; incident: EmergencyIncident }> {
    return this.request(`/incidents/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async resolveIncident(id: string, notes?: string): Promise<{ message: string; incident: EmergencyIncident }> {
    return this.request(`/incidents/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution_notes: notes })
    });
  }

  // ---------------------------------------------------------------------------
  // GPS & Locations
  // ---------------------------------------------------------------------------
  async recordLocation(incidentId: string, location: { latitude: number; longitude: number; accuracy_meters?: number }): Promise<IncidentLocation> {
    return this.request(`/incidents/${incidentId}/location`, {
      method: 'POST',
      body: JSON.stringify(location)
    });
  }

  async getIncidentLocations(incidentId: string): Promise<IncidentLocation[]> {
    return this.request(`/incidents/${incidentId}/locations`);
  }

  // ---------------------------------------------------------------------------
  // Evidence
  // ---------------------------------------------------------------------------
  async getEvidenceUploadUrl(incidentId: string, evidenceType: string, mimeType: string, fileSize: number) {
    return this.request<{ upload_url: string; storage_path: string; evidence_id: string }>(`/incidents/${incidentId}/evidence/upload-url`, {
      method: 'POST',
      body: JSON.stringify({ evidence_type: evidenceType, mime_type: mimeType, file_size_bytes: fileSize })
    });
  }

  async completeEvidenceUpload(incidentId: string, data: { storage_path: string; evidence_type: string; mime_type: string; file_size_bytes: number; checksum?: string }) {
    return this.request<EmergencyEvidence>(`/incidents/${incidentId}/evidence/complete`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ---------------------------------------------------------------------------
  // AI Endpoints
  // ---------------------------------------------------------------------------
  async detectVoiceEmergency(transcript: string, language?: string): Promise<EmergencySpeechAnalysisResult> {
    return this.request('/ai/detect-voice-emergency', {
      method: 'POST',
      body: JSON.stringify({ transcript, language })
    });
  }

  async analyzeIncident(description: string): Promise<IncidentClassificationResult> {
    return this.request('/ai/analyze-incident', {
      method: 'POST',
      body: JSON.stringify({ description })
    });
  }

  async summarizeIncident(incidentId: string): Promise<IncidentSummaryResult> {
    return this.request('/ai/summarize-incident', {
      method: 'POST',
      body: JSON.stringify({ incident_id: incidentId })
    });
  }

  // ---------------------------------------------------------------------------
  // CCTV & 112 Dispatch
  // ---------------------------------------------------------------------------
  async getNearbyCameras(lat: number, lon: number, radiusMeters: number = 1000): Promise<Array<AuthorizedCamera & { distance_meters: number }>> {
    return this.request(`/cameras/nearby?latitude=${lat}&longitude=${lon}&radius_meters=${radiusMeters}`);
  }

  async getAuthorizedCameras(): Promise<AuthorizedCamera[]> {
    return this.request('/cameras');
  }

  async requestCCTVAccess(cameraId: string, incidentId: string, justification: string): Promise<CameraAccessRequest> {
    return this.request(`/cameras/${cameraId}/access-request`, {
      method: 'POST',
      body: JSON.stringify({ incident_id: incidentId, justification })
    });
  }

  async dispatch112(incidentId: string, integrationId?: string): Promise<IncidentDispatch> {
    return this.request(`/integrations/emergency/${integrationId || '11200000-0000-0000-0000-000000000112'}/dispatch`, {
      method: 'POST',
      body: JSON.stringify({ incident_id: incidentId })
    });
  }

  // ---------------------------------------------------------------------------
  // Dashboard & Audit
  // ---------------------------------------------------------------------------
  async getDashboardOverview(): Promise<{
    metrics: {
      total_incidents: number;
      active_incidents: number;
      critical_active: number;
      cameras_online: number;
      total_evidence_archived: number;
      erss_112_link_health: string;
      avg_dispatch_seconds: number;
    };
    category_breakdown: Record<string, number>;
    recent_active: Array<EmergencyIncident & { user_name: string; user_phone?: string }>;
  }> {
    return this.request('/dashboard/overview');
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return this.request('/dashboard/audit-logs');
  }

  // ---------------------------------------------------------------------------
  // Contacts & Settings
  // ---------------------------------------------------------------------------
  async getContacts(): Promise<TrustedContact[]> {
    return this.request('/contacts');
  }

  async addContact(data: Partial<TrustedContact>): Promise<TrustedContact> {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async deleteContact(id: string): Promise<void> {
    return this.request(`/contacts/${id}`, { method: 'DELETE' });
  }

  async getSafetySettings(): Promise<UserSafetySettings> {
    return this.request('/safety/settings');
  }

  async updateSafetySettings(data: Partial<UserSafetySettings>): Promise<UserSafetySettings> {
    return this.request('/safety/settings', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async getConsents(): Promise<UserConsent[]> {
    return this.request('/safety/consents');
  }

  async updateConsent(consentType: string, granted: boolean): Promise<UserConsent> {
    return this.request('/safety/consents', {
      method: 'POST',
      body: JSON.stringify({ consent_type: consentType, granted })
    });
  }
}

export const api = new ApiClient();
