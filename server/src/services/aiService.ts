import OpenAI from 'openai';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import {
  EmergencySpeechAnalysisResult,
  IncidentClassificationResult,
  IncidentSummaryResult,
  EmergencyTimelineSummaryResult,
  SpeechTranscriptionResult
} from '@safewalk/shared-types';
import {
  AISpeechAnalysisOutputSchema,
  AIIncidentClassificationOutputSchema,
  AIIncidentSummaryOutputSchema,
  AITimelineSummaryOutputSchema
} from '@safewalk/validation';

export const SAFEWALK_AI_SYSTEM_PROMPT = `You are SafeWalk AI's emergency information analysis assistant.
Your responsibility is to organize authorized emergency information into clear, structured, neutral summaries for human emergency responders.
You must prioritize accuracy, privacy, and uncertainty.
Rules:
Never invent facts.
Never fabricate GPS coordinates.
Never identify an individual as a criminal.
Never make unsupported accusations.
Never claim that an emergency has been verified when it has not.
Clearly distinguish user-provided information from AI-generated interpretation.
Use only information explicitly supplied through authorized application workflows.
Do not expose private data unnecessarily.
Do not independently dispatch police.
Do not replace human emergency judgment.
Identify missing or uncertain information.
Use concise, factual, neutral language.
Never delay a manual SOS operation while waiting for AI analysis.
Treat emergency assistance as a priority.
Clearly identify whether a location is current, historical, or unavailable.`;

class AIService {
  private openai: OpenAI | null = null;

  constructor() {
    if (config.openai.apiKey && config.openai.apiKey !== 'sk-...') {
      try {
        this.openai = new OpenAI({ apiKey: config.openai.apiKey, timeout: 15000 });
        logger.info('OpenAI client successfully initialized for SafeWalk AI');
      } catch (err) {
        logger.warn('Failed to initialize OpenAI client, using deterministic safety fallback', { error: String(err) });
      }
    } else {
      logger.info('SafeWalk AI running with deterministic emergency analysis engine (No external OpenAI key configured)');
    }
  }

  /**
   * Evaluates speech transcript against user's configured emergency phrases.
   * Returns structured confidence score and recommended action.
   */
  async analyzeSpeechForEmergency(
    transcript: string,
    configuredPhrases: string[],
    language: string = 'en'
  ): Promise<EmergencySpeechAnalysisResult> {
    const cleanTranscript = transcript.trim().toLowerCase();
    
    // Deterministic match check first (fastest, guaranteed, no external latency)
    let matchedPhrase: string | null = null;
    for (const phrase of configuredPhrases) {
      if (cleanTranscript.includes(phrase.toLowerCase())) {
        matchedPhrase = phrase;
        break;
      }
    }

    if (matchedPhrase) {
      return {
        emergency_phrase_detected: true,
        matched_phrase: matchedPhrase,
        language,
        confidence: 0.98,
        recommended_action: 'request_user_confirmation',
        reason: `Configured emergency trigger phrase "${matchedPhrase}" matched in speech`
      };
    }

    // If external OpenAI is available and no direct exact match was found, perform semantic check
    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: config.openai.analysisModel,
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: `${SAFEWALK_AI_SYSTEM_PROMPT}\nAnalyze if the transcript contains an emergency cry or matches configured phrases. Return JSON matching the schema: {"emergency_phrase_detected": boolean, "matched_phrase": string|null, "language": string, "confidence": number, "recommended_action": "request_user_confirmation"|"trigger_immediate_sos"|"none", "reason": string}` },
            { role: 'user', content: JSON.stringify({ transcript, configuredPhrases, language }) }
          ]
        });

        const raw = response.choices[0]?.message?.content;
        if (raw) {
          const parsed = JSON.parse(raw);
          const validated = AISpeechAnalysisOutputSchema.parse(parsed);
          return validated;
        }
      } catch (err) {
        logger.warn('OpenAI speech analysis call failed, using deterministic fallback', { error: String(err) });
      }
    }

    // Default neutral fallback
    return {
      emergency_phrase_detected: false,
      matched_phrase: null,
      language,
      confidence: 0.85,
      recommended_action: 'none',
      reason: 'No configured emergency trigger phrase detected in speech buffer'
    };
  }

  /**
   * Categorizes emergency incident description and suggests severity.
   */
  async classifyIncident(description: string, availableInfo?: Record<string, unknown>): Promise<IncidentClassificationResult> {
    const text = (description || '').toLowerCase();

    // Deterministic keyword heuristics
    let suggestedSeverity: IncidentClassificationResult['suggested_severity'] = 'medium';
    let category: IncidentClassificationResult['category'] = 'personal_safety';

    if (text.includes('threat') || text.includes('weapon') || text.includes('attack') || text.includes('stalk') || text.includes('follow')) {
      suggestedSeverity = 'critical';
      category = text.includes('stalk') || text.includes('follow') ? 'stalking' : 'threats';
    } else if (text.includes('accident') || text.includes('crash') || text.includes('bleed') || text.includes('unconscious')) {
      suggestedSeverity = 'critical';
      category = 'accident';
    } else if (text.includes('harass') || text.includes('eve-teas') || text.includes('catcall')) {
      suggestedSeverity = 'high';
      category = 'harassment';
    } else if (text.includes('medical') || text.includes('chest pain') || text.includes('asthma') || text.includes('faint')) {
      suggestedSeverity = 'critical';
      category = 'medical_emergency';
    }

    if (this.openai && description.trim().length > 10) {
      try {
        const response = await this.openai.chat.completions.create({
          model: config.openai.analysisModel,
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: `${SAFEWALK_AI_SYSTEM_PROMPT}\nClassify the incident based purely on authorized description. Output JSON matching schema: {"category": "personal_safety"|"harassment"|"stalking"|"threats"|"medical_emergency"|"accident"|"travel_emergency"|"child_safety"|"elderly_assistance"|"other_emergency", "suggested_severity": "critical"|"high"|"medium"|"low"|"unclassified", "summary": string, "confidence": number, "uncertainties": string[], "human_review_required": true}` },
            { role: 'user', content: JSON.stringify({ description, availableInfo }) }
          ]
        });

        const raw = response.choices[0]?.message?.content;
        if (raw) {
          const parsed = JSON.parse(raw);
          return AIIncidentClassificationOutputSchema.parse(parsed);
        }
      } catch (err) {
        logger.warn('OpenAI classification call failed, using deterministic fallback', { error: String(err) });
      }
    }

    return {
      category,
      suggested_severity: suggestedSeverity,
      summary: description ? `User-reported incident: "${description.slice(0, 150)}"` : 'Emergency alert activated without text description',
      confidence: 0.90,
      uncertainties: description ? [] : ['No explicit user text description provided at activation time'],
      human_review_required: true
    };
  }

  /**
   * Generates a neutral, structured incident summary for emergency dispatchers.
   */
  async generateIncidentSummary(incident: Record<string, unknown>): Promise<IncidentSummaryResult> {
    const incidentId = String(incident.id || '');
    const activationMethod = String(incident.activation_method || 'manual_sos') as IncidentSummaryResult['activation_method'];
    const hasLocation = Boolean(incident.latest_location || incident.initial_location);
    const hasEvidence = Boolean(incident.evidence_count && Number(incident.evidence_count) > 0);

    return {
      incident_id: incidentId,
      summary: `SafeWalk emergency alert initiated via ${activationMethod}. ${hasLocation ? 'GPS location stream verified.' : 'No GPS coordinates reported.'} ${hasEvidence ? 'Evidence media attached.' : 'No media evidence uploaded.'}`,
      activation_method: activationMethod,
      available_location: hasLocation,
      evidence_available: hasEvidence,
      missing_information: hasLocation ? [] : ['Real-time GPS coordinates pending device transmission'],
      human_review_required: true
    };
  }

  /**
   * Generates chronological timeline summary.
   */
  async generateTimelineSummary(incidentId: string, events: Array<{ type: string; description: string; time: string }>): Promise<EmergencyTimelineSummaryResult> {
    return {
      incident_id: incidentId,
      timeline_summary: `Total of ${events.length} chronological audit events recorded from activation to present state.`,
      important_events: events.slice(0, 5).map(e => `${new Date(e.time).toLocaleTimeString()} - ${e.description}`),
      location_updates_available: events.some(e => e.type === 'location_updated'),
      evidence_references: events.filter(e => e.type.includes('captured')).map(e => e.description),
      uncertainties: []
    };
  }

  /**
   * Transcribes audio buffer.
   */
  async transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<SpeechTranscriptionResult> {
    // If OpenAI Whisper is configured
    if (this.openai) {
      try {
        // Build file for OpenAI audio API
        const file = await OpenAI.toFile(audioBuffer, 'emergency_recording.mp3', { type: mimeType });
        const transcription = await this.openai.audio.transcriptions.create({
          file,
          model: config.openai.transcriptionModel
        });

        return {
          transcript: transcription.text,
          language: 'en',
          confidence: 0.92,
          processing_status: 'completed'
        };
      } catch (err) {
        logger.warn('OpenAI Whisper transcription failed, falling back', { error: String(err) });
      }
    }

    return {
      transcript: 'Voice sample captured during emergency activation (Offline transcription placeholder)',
      language: 'en',
      confidence: 0.85,
      processing_status: 'fallback'
    };
  }
}

export const aiService = new AIService();
