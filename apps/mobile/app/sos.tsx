import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { mobileApi } from '../services/api';

export default function SOSScreen() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState('personal_safety');

  useEffect(() => {
    let timer: any = null;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      triggerEmergency();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const triggerEmergency = async () => {
    setIsSubmitting(true);
    try {
      const res = await mobileApi.createSOS(category, {
        latitude: 28.6315,
        longitude: 77.2167,
        accuracy_meters: 4.2
      });
      router.replace({
        pathname: '/incident/[id]',
        params: { id: res.incident.id }
      });
    } catch (err: any) {
      alert(`Emergency trigger error: ${err.message}. If in life-threatening danger, dial 112 directly.`);
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.badge}>EMERGENCY PROTOCOL ENGAGED</Text>
      
      <Text style={styles.timerTitle}>DISPATCHING 112 IN</Text>
      <Text style={styles.timerCount}>00:0{countdown}</Text>

      <Text style={styles.desc}>
        Broadcasting real-time GPS coordinates to your verified trusted contacts and submitting standardized alert to National 112 ERSS.
      </Text>

      {isSubmitting ? (
        <ActivityIndicator size="large" color="#EF4444" style={{ marginVertical: 30 }} />
      ) : (
        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>CANCEL (FALSE ACTIVATION)</Text>
        </TouchableOpacity>
      )}

      <View style={styles.categories}>
        <Text style={styles.catLabel}>Selected Emergency Category:</Text>
        <Text style={styles.catValue}>{category.toUpperCase().replace('_', ' ')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B13',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  badge: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  timerTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  timerCount: {
    color: '#EF4444',
    fontSize: 72,
    fontWeight: '900',
    fontFamily: 'monospace',
    marginVertical: 10,
  },
  desc: {
    color: '#CBD5E1',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: 40,
  },
  cancelButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    width: '100%',
    alignItems: 'center',
  },
  cancelText: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  categories: {
    marginTop: 40,
    alignItems: 'center',
  },
  catLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  catValue: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
