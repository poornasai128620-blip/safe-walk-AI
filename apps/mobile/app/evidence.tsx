import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function MobileEvidenceScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Secured Evidence Locker</Text>
      <Text style={styles.subtitle}>Cryptographically sealed audio recordings and telemetry captured during alerts.</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.type}>AUDIO BUFFER (15s)</Text>
          <Text style={styles.tag}>SHA-256 SEALED</Text>
        </View>
        <Text style={styles.meta}>Captured: 12 minutes ago • 334 KB</Text>
        <Text style={styles.hash}>HASH: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070B13' },
  scroll: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 12, color: '#94A3B8', marginTop: 4, marginBottom: 20 },
  card: { backgroundColor: '#0F172A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1E293B' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  type: { fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' },
  tag: { color: '#10B981', fontSize: 9, fontWeight: 'bold', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  meta: { fontSize: 11, color: '#64748B', marginTop: 4 },
  hash: { fontSize: 9, color: '#38BDF8', fontFamily: 'monospace', marginTop: 8 },
});
