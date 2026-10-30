import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';

export default function VoiceSettingsScreen() {
  const [primaryPhrase, setPrimaryPhrase] = useState('SafeWalk Emergency Help');
  const [sensitivity, setSensitivity] = useState('medium');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>AI Voice Trigger Recognition</Text>
      <Text style={styles.subtitle}>
        When configured, speaking your trigger phrase automatically initializes an emergency countdown without manual unlocking.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>PRIMARY EMERGENCY PHRASE</Text>
        <TextInput
          style={styles.input}
          value={primaryPhrase}
          onChangeText={setPrimaryPhrase}
        />
        <Text style={styles.hint}>Supported words: English, Hindi ("Bachao"), Multilingual architecture</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>SENSITIVITY THRESHOLD</Text>
        <View style={styles.pillRow}>
          {['low', 'medium', 'high'].map((level) => (
            <TouchableOpacity
              key={level}
              style={sensitivity === level ? styles.pillActive : styles.pillInactive}
              onPress={() => setSensitivity(level)}
            >
              <Text style={sensitivity === level ? styles.pillTextActive : styles.pillTextInactive}>
                {level.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.advisory}>
        <Text style={styles.advTitle}>Notice on Operating System Limits</Text>
        <Text style={styles.advText}>
          In accordance with platform privacy guidelines, hands-free voice trigger operates in active journey mode and foreground tracking. The manual SOS button remains active at all times.
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
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  label: { fontSize: 10, color: '#64748B', fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
  input: {
    backgroundColor: '#070B13',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 12,
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  hint: { fontSize: 10, color: '#64748B', marginTop: 6 },
  pillRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  pillActive: {
    backgroundColor: '#06B6D4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  pillInactive: {
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  pillTextActive: { color: '#070B13', fontSize: 11, fontWeight: 'bold' },
  pillTextInactive: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold' },
  advisory: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  advTitle: { color: '#EF4444', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  advText: { color: '#94A3B8', fontSize: 10, lineHeight: 15 },
});
