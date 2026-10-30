import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { mobileApi } from '../services/api';
import { TrustedContact } from '@safewalk/shared-types';

export default function MobileContactsScreen() {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);

  useEffect(() => {
    mobileApi.getContacts().then(setContacts).catch(() => {});
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Emergency Trusted Circle</Text>
      <Text style={styles.subtitle}>These contacts receive instant SMS & live map links during SOS.</Text>

      <View style={styles.list}>
        {contacts.map((c) => (
          <View key={c.id} style={styles.contactCard}>
            <View style={styles.row}>
              <Text style={styles.name}>{c.contact_name}</Text>
              <Text style={styles.verifiedTag}>VERIFIED</Text>
            </View>
            <Text style={styles.relationship}>{c.relationship || 'Emergency Contact'}</Text>
            <Text style={styles.phone}>{c.phone_number}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070B13' },
  scroll: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 12, color: '#94A3B8', marginTop: 4, marginBottom: 20 },
  list: { gap: 12 },
  contactCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  relationship: { fontSize: 11, color: '#64748B', marginTop: 2 },
  phone: { fontSize: 12, color: '#38BDF8', fontFamily: 'monospace', marginTop: 6 },
  verifiedTag: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: 'bold',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
