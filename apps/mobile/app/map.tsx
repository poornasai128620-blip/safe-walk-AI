import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MobileMapScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.hud}>
        <Text style={styles.hudTitle}>GPS RADAR TELEMETRY</Text>
        <Text style={styles.coord}>28.63180° N, 77.21700° E</Text>
        <Text style={styles.accuracy}>Accuracy: ±4.2m | Altitude: 215m</Text>
      </View>
      <View style={styles.placeholderMap}>
        <View style={styles.ring3} />
        <View style={styles.ring2} />
        <View style={styles.ring1} />
        <View style={styles.dot} />
        <Text style={styles.mapNotice}>Live Vector Map Stream Active</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070B13', padding: 20 },
  hud: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 20,
  },
  hudTitle: { fontSize: 10, color: '#64748B', fontWeight: 'bold', letterSpacing: 1 },
  coord: { fontSize: 18, color: '#FFFFFF', fontWeight: 'bold', fontFamily: 'monospace', marginTop: 4 },
  accuracy: { fontSize: 11, color: '#10B981', marginTop: 4 },
  placeholderMap: {
    flex: 1,
    backgroundColor: '#0B1120',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  ring3: { position: 'absolute', width: 280, height: 280, borderRadius: 140, borderWidth: 1, borderColor: 'rgba(6, 182, 212, 0.1)' },
  ring2: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 1, borderColor: 'rgba(6, 182, 212, 0.2)' },
  ring1: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.4)', backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#EF4444' },
  mapNotice: { color: '#94A3B8', fontSize: 11, marginTop: 120, fontFamily: 'monospace' },
});
