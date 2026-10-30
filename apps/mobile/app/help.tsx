import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';

export default function MobileHelpScreen() {
  const dialEmergency = (num: string) => {
    Linking.openURL(`tel:${num}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Emergency Response Helplines</Text>
      <Text style={styles.subtitle}>
        In active danger, prioritize your physical safety. If you are able to speak, dial official emergency services directly.
      </Text>

      <TouchableOpacity
        style={styles.emergencyBanner}
        activeOpacity={0.8}
        onPress={() => dialEmergency('112')}
      >
        <Text style={styles.bannerBadge}>NATIONAL SINGLE EMERGENCY HELPLINE (INDIA)</Text>
        <Text style={styles.bannerNumber}>DIAL 112</Text>
        <Text style={styles.bannerSub}>Police • Fire • Ambulance • Disaster Response</Text>
      </TouchableOpacity>

      <View style={styles.helplineList}>
        <TouchableOpacity style={styles.item} onPress={() => dialEmergency('1091')}>
          <View>
            <Text style={styles.itemTitle}>Women's Distress Helpline</Text>
            <Text style={styles.itemDesc}>Dedicated round-the-clock support</Text>
          </View>
          <Text style={styles.itemNum}>1091</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => dialEmergency('1098')}>
          <View>
            <Text style={styles.itemTitle}>Child Emergency Helpline (Childline)</Text>
            <Text style={styles.itemDesc}>National child protection</Text>
          </View>
          <Text style={styles.itemNum}>1098</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => dialEmergency('108')}>
          <View>
            <Text style={styles.itemTitle}>Medical / Ambulance Services</Text>
            <Text style={styles.itemDesc}>Emergency medical transportation</Text>
          </View>
          <Text style={styles.itemNum}>108</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070B13' },
  scroll: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 12, color: '#94A3B8', marginTop: 4, marginBottom: 20, lineHeight: 18 },
  emergencyBanner: {
    backgroundColor: '#DC2626',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  bannerBadge: { color: '#FEE2E2', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
  bannerNumber: { color: '#FFFFFF', fontSize: 36, fontWeight: '900', marginVertical: 6 },
  bannerSub: { color: '#FEE2E2', fontSize: 11, fontWeight: '600' },
  helplineList: { gap: 12 },
  item: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: { fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' },
  itemDesc: { fontSize: 10, color: '#64748B', marginTop: 2 },
  itemNum: { fontSize: 16, fontWeight: 'bold', color: '#38BDF8', fontFamily: 'monospace' },
});
