import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { mobileApi } from '../services/api';

export default function HomeScreen() {
  const router = useRouter();
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>SafeWalk<Text style={styles.brandAccent}>.AI</Text></Text>
            <Text style={styles.brandSubtitle}>Personal Safety & 112 Response</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusPillText}>PROTECTED</Text>
          </View>
        </View>

        {/* Big Emergency SOS Button */}
        <View style={styles.sosContainer}>
          <TouchableOpacity
            style={styles.sosButton}
            activeOpacity={0.85}
            onPress={() => router.push('/sos')}
          >
            <View style={styles.sosInner}>
              <Text style={styles.sosText}>SOS</Text>
              <Text style={styles.sosSubtext}>PRESS TO ACTIVATE</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Safety Cards */}
        <View style={styles.cardContainer}>
          {/* AI Voice Trigger Card */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.push('/voice-settings')}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>AI Voice Emergency Trigger</Text>
              <Text style={voiceEnabled ? styles.tagActive : styles.tagInactive}>
                {voiceEnabled ? 'ACTIVE' : 'MUTED'}
              </Text>
            </View>
            <Text style={styles.cardDesc}>
              Listening for: "SafeWalk Emergency Help" or "Bachao"
            </Text>
          </TouchableOpacity>

          {/* Quick Actions Grid */}
          <View style={styles.grid}>
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => router.push('/map')}
            >
              <Text style={styles.gridItemTitle}>Live GPS Map</Text>
              <Text style={styles.gridItemSub}>±4m Accuracy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => router.push('/contacts')}
            >
              <Text style={styles.gridItemTitle}>Trusted Contacts</Text>
              <Text style={styles.gridItemSub}>2 Verified</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => router.push('/evidence')}
            >
              <Text style={styles.gridItemTitle}>Evidence Vault</Text>
              <Text style={styles.gridItemSub}>SHA-256 Vault</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => router.push('/help')}
            >
              <Text style={styles.gridItemTitle}>112 ERSS Help</Text>
              <Text style={styles.gridItemSub}>Direct Police Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Navigation Bar */}
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => router.push('/permissions')} style={styles.navLink}>
            <Text style={styles.navLinkText}>Permissions</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/privacy')} style={styles.navLink}>
            <Text style={styles.navLinkText}>Privacy & DPDP</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.navLink}>
            <Text style={styles.navLinkText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B13',
  },
  scroll: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 10,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  brandAccent: {
    color: '#EF4444',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusPillText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sosContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  sosButton: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 20,
    borderWidth: 8,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  sosInner: {
    alignItems: 'center',
  },
  sosText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  sosSubtext: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FEE2E2',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  cardContainer: {
    width: '100%',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  cardDesc: {
    fontSize: 11,
    color: '#06B6D4',
    fontFamily: 'monospace',
  },
  tagActive: {
    color: '#06B6D4',
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  tagInactive: {
    color: '#94A3B8',
    fontSize: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
  },
  gridItemTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F1F5F9',
  },
  gridItemSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 30,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  navLink: {
    padding: 6,
  },
  navLinkText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
