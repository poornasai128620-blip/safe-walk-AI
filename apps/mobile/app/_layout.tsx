import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#070B13',
          },
          headerTintColor: '#F8FAFC',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#070B13',
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ title: 'Safety Permissions' }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="sos" options={{ title: 'Emergency SOS', headerBackTitle: 'Back' }} />
        <Stack.Screen name="incident/[id]" options={{ title: 'Active Incident Telemetry', headerLeft: () => null }} />
        <Stack.Screen name="map" options={{ title: 'Live Location Tracking' }} />
        <Stack.Screen name="contacts" options={{ title: 'Trusted Contacts' }} />
        <Stack.Screen name="evidence" options={{ title: 'Evidence Locker' }} />
        <Stack.Screen name="voice-settings" options={{ title: 'AI Voice Activation' }} />
        <Stack.Screen name="permissions" options={{ title: 'Device Permissions' }} />
        <Stack.Screen name="notifications" options={{ title: 'Emergency Notifications' }} />
        <Stack.Screen name="profile" options={{ title: 'Safety Profile' }} />
        <Stack.Screen name="privacy" options={{ title: 'Privacy & Statutory Consents' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="help" options={{ title: '112 Emergency Help' }} />
      </Stack>
    </>
  );
}
