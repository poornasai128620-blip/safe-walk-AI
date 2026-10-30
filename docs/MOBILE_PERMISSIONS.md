# SafeWalk AI — Mobile Permissions Architecture

## 1. Operating System Sensor Restrictions
Modern mobile platforms (iOS and Android) enforce strict security sandboxes for background resource access.

| Permission | Android Spec | iOS Spec | SafeWalk Implementation |
|---|---|---|---|
| Geolocation | `ACCESS_FINE_LOCATION` | `NSLocationWhenInUseUsageDescription` | Foreground active tracking during SOS alerts |
| Microphone | `RECORD_AUDIO` | `NSMicrophoneUsageDescription` | Consented foreground 15s evidence buffer & voice triggers |
| Camera | `CAMERA` | `NSCameraUsageDescription` | Consented foreground emergency video stream |
| Notifications | `POST_NOTIFICATIONS` | Push capability | Delivery status updates and cancellation notices |
