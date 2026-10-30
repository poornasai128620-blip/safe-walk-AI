# SafeWalk AI — Privacy Framework & DPDP Act Compliance

## 1. Regulatory Context
SafeWalk AI is architected in accordance with India's Digital Personal Data Protection (DPDP) Act and international privacy-by-design standards.

## 2. Privacy Guarantees
- **No Background Tracking When Idle**: SafeWalk AI does not track GPS coordinates when no safety journey or SOS alert has been initiated.
- **Explicit Sensor Consents**: Microphone, camera, and location permissions require affirmative opt-in.
- **30-Day Auto Purge**: Non-investigative emergency recordings are automatically marked for deletion after 30 days.
- **Right to Erasure**: Complete account deletion purges user profile and sensitive contact references via `DELETE /api/v1/users/me`.
