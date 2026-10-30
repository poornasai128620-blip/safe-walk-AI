import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function MobilePrivacyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Statutory Privacy & Consent</Text>
      <Text style={styles.subtitle}>Digital Personal Data Protection (DPDP) Act Compliance Overview</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Minimization Principle</Text>
        <Text style={styles.cardText}>
          SafeWalk AI does not track your location in the background when no emergency journey or SOS is active. Coordinates are collected solely for dispatch purposes.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>30-Day Auto Purge Policy</Text>
        <Text style={styles.cardText}>
          All emergency audio and video recordings are automatically purged after 30 days unless formally requested by certified law enforcement.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070B13' },
  scroll: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 12, color: '#94A3B8', marginTop: 4, marginBottom: 20 },
  card: { backgroundColor: '#0F172A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1E293B', marginBottom: 12 },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#38BDF8', marginBottom: 6 },
  cardText: { fontSize: 11, color: '#CBD5E1', lineHeight: 17 },
});
