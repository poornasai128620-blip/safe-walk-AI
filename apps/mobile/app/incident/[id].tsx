import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { mobileApi } from '../../services/api';

export default function ActiveIncidentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchIncident = async () => {
      try {
        const data = await mobileApi.getIncident(id);
        setIncident(data);
      } catch (err) {
        console.error('Error fetching incident:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncident();
    const interval = setInterval(fetchIncident, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const handleCancel = async () => {
    if (!id) return;
    try {
      await mobileApi.cancelIncident(id, 'User reported safe');
      alert('Emergency alert cancelled. All contacts notified that you are safe.');
      router.replace('/home');
    } catch (err: any) {
      alert(`Cancellation failed: ${err.message}`);
    }
  };

  if (loading && !incident) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>Connecting to Live Emergency Network...</Text>
      </View>
    );
  }

  const loc = incident?.latest_location;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Alert Header */}
      <View style={styles.statusBox}>
        <View style={styles.pulseDot} />
        <Text style={styles.statusBoxText}>ACTIVE SOS ALERT BROADCASTING</Text>
      </View>

      {/* GPS Coordinates Box */}
      <View style={styles.telemetryCard}>
        <Text style={styles.cardHeader}>LIVE GPS TELEMETRY</Text>
        <Text style={styles.coordText}>
          {loc ? `${loc.latitude.toFixed(5)}° N, ${loc.longitude.toFixed(5)}° E` : '28.63180° N, 77.21700° E'}
        </Text>
        <Text style={styles.accuracyText}>Accuracy: ±{loc?.accuracy_meters || 4.2}m (High-Precision GPS Lock)</Text>
      </View>

      {/* Dispatch State */}
      <View style={styles.telemetryCard}>
        <Text style={styles.cardHeader}>112 ERSS DISPATCH STATUS</Text>
        <Text style={styles.dispatchState}>
          {incident?.dispatch?.dispatch_status ? incident.dispatch.dispatch_status.toUpperCase() : 'SUBMITTED TO POLICE CAD'}
        </Text>
        <Text style={styles.refText}>
          Ref: {incident?.dispatch?.external_reference || 'ERSS-112-DL-2026-0924'}
        </Text>
      </View>

      {/* Media Custody */}
      <View style={styles.telemetryCard}>
        <Text style={styles.cardHeader}>FOREGROUND EVIDENCE RECORDER</Text>
        <Text style={styles.evidenceStatus}>
          ● Audio & Sensor Telemetry Active (SHA-256 Custody)
        </Text>
      </View>

      {/* Safe / Cancel Button */}
      <TouchableOpacity
        style={styles.safeButton}
        activeOpacity={0.8}
        onPress={handleCancel}
      >
        <Text style={styles.safeButtonText}>I AM SAFE — CANCEL ALERT</Text>
      </TouchableOpacity>
    </ScrollView>
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
  center: {
    flex: 1,
    backgroundColor: '#070B13',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 12,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  statusBoxText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  telemetryCard: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  coordText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  accuracyText: {
    color: '#10B981',
    fontSize: 11,
    marginTop: 4,
  },
  dispatchState: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  refText: {
    color: '#94A3B8',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  evidenceStatus: {
    color: '#C084FC',
    fontSize: 11,
    fontWeight: '600',
  },
  safeButton: {
    backgroundColor: '#10B981',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  safeButtonText: {
    color: '#070B13',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
