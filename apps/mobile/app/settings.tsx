import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function MobileSettingsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Application Settings</Text>
      <Text style={styles.subtitle}>SafeWalk AI Version 1.0.0-prod</Text>

      <View style={styles.card}>
        <Text style={styles.itemTitle}>112 ERSS Integration Gateway</Text>
        <Text style={styles.status}>STATUS: ONLINE (MH-MUMBAI-01)</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.itemTitle}>Account & Profile</Text>
        <Text style={styles.info}>Logged in as: Priya Sharma (+919876543210)</Text>
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
  itemTitle: { fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' },
  status: { fontSize: 11, color: '#10B981', fontFamily: 'monospace', marginTop: 6 },
  info: { fontSize: 11, color: '#94A3B8', marginTop: 6 },
});
