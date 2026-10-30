import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function MobilePermissionsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Device Sensor Permissions</Text>
      <Text style={styles.subtitle}>SafeWalk AI enforces fine-grained consent before accessing any device sensor.</Text>

      <View style={styles.item}>
        <Text style={styles.name}>GPS High-Precision Location</Text>
        <Text style={styles.desc}>Active only during explicitly triggered emergency events.</Text>
        <Text style={styles.state}>STATUS: GRANTED</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.name}>Audio Microphone</Text>
        <Text style={styles.desc}>Used for voice trigger recognition & foreground evidence buffer.</Text>
        <Text style={styles.state}>STATUS: GRANTED</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.name}>Camera Video Stream</Text>
        <Text style={styles.desc}>Foreground consented evidence video during active alerts only.</Text>
        <Text style={styles.state}>STATUS: OPTIONAL / STANDBY</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070B13' },
  scroll: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 12, color: '#94A3B8', marginTop: 4, marginBottom: 20 },
  item: { backgroundColor: '#0F172A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1E293B', marginBottom: 12 },
  name: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  desc: { fontSize: 11, color: '#64748B', marginTop: 4, lineHeight: 16 },
  state: { fontSize: 10, color: '#10B981', fontWeight: 'bold', fontFamily: 'monospace', marginTop: 8 },
});
