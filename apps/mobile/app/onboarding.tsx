import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const router = useRouter();
  const [gpsGranted, setGpsGranted] = useState(true);
  const [micGranted, setMicGranted] = useState(true);
  const [notifGranted, setNotifGranted] = useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.heading}>Essential Emergency Permissions</Text>
      <Text style={styles.subheading}>
        SafeWalk AI only accesses sensors during actively initiated emergency situations in accordance with the Digital Personal Data Protection Act.
      </Text>

      <View style={styles.permList}>
        <View style={styles.permItem}>
          <View style={styles.permInfo}>
            <Text style={styles.permTitle}>Precise GPS Geolocation</Text>
            <Text style={styles.permDesc}>Required to transmit coordinates to 112 responders and trusted contacts during active SOS.</Text>
          </View>
          <TouchableOpacity
            style={gpsGranted ? styles.toggleOn : styles.toggleOff}
            onPress={() => setGpsGranted(!gpsGranted)}
          >
            <Text style={styles.toggleText}>{gpsGranted ? 'ALLOWED' : 'DENIED'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.permItem}>
          <View style={styles.permInfo}>
            <Text style={styles.permTitle}>Microphone Access</Text>
            <Text style={styles.permDesc}>Enables hands-free emergency voice trigger recognition and consented 15s audio evidence buffering.</Text>
          </View>
          <TouchableOpacity
            style={micGranted ? styles.toggleOn : styles.toggleOff}
            onPress={() => setMicGranted(!micGranted)}
          >
            <Text style={styles.toggleText}>{micGranted ? 'ALLOWED' : 'DENIED'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.permItem}>
          <View style={styles.permInfo}>
            <Text style={styles.permTitle}>Critical Push Notifications</Text>
            <Text style={styles.permDesc}>Alerts you when trusted contacts acknowledge your distress alert or when cancellation occurs.</Text>
          </View>
          <TouchableOpacity
            style={notifGranted ? styles.toggleOn : styles.toggleOff}
            onPress={() => setNotifGranted(!notifGranted)}
          >
            <Text style={styles.toggleText}>{notifGranted ? 'ALLOWED' : 'DENIED'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => router.replace('/home')}
      >
        <Text style={styles.doneButtonText}>COMPLETE SETUP & CONTINUE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B13',
  },
  scroll: {
    padding: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 24,
  },
  permList: {
    gap: 16,
    marginBottom: 32,
  },
  permItem: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permInfo: {
    flex: 1,
    marginRight: 12,
  },
  permTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  permDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  toggleOn: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleOff: {
    backgroundColor: '#1E293B',
    borderColor: '#475569',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  doneButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
