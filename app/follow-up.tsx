import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const TRACKING_STEPS = [
  { id: 1, title: 'Booking Confirmed', time: '10:15 AM', active: false, done: true },
  { id: 2, title: 'Provider Assigned', time: '10:20 AM', active: false, done: true },
  { id: 3, title: 'On the Way', time: '01:30 PM', active: true, done: false },
  { id: 4, title: 'Job Started', time: '--:--', active: false, done: false },
  { id: 5, title: 'Job Completed', time: '--:--', active: false, done: false },
];

export default function FollowUpScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Status</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={styles.providerCard}>
          <Text style={styles.providerLabel}>Your Professional</Text>
          <Text style={styles.providerName}>Salman Bros</Text>
          <Text style={styles.providerRole}>AC Specialist • ⭐️ 4.8</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.callBtn}><Text style={styles.callBtnText}>📞 Call</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chatBtn}><Text style={styles.chatBtnText}>💬 Message</Text></TouchableOpacity>
          </View>
        </View>

        <Text style={styles.timelineTitle}>Tracking Timeline</Text>
        
        <View style={styles.timeline}>
          {TRACKING_STEPS.map((step, idx) => (
            <View key={step.id} style={styles.stepContainer}>
              <View style={styles.stepIndicator}>
                <View style={[styles.circle, step.done && styles.circleDone, step.active && styles.circleActive]} />
                {idx !== TRACKING_STEPS.length - 1 && (
                  <View style={[styles.line, step.done && styles.lineDone]} />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, (step.active || step.done) && styles.stepTitleActive]}>{step.title}</Text>
                <Text style={styles.stepTime}>{step.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.disputeBtn} onPress={() => router.push('/dispute')}>
          <Text style={styles.disputeText}>Cancel or Report Issue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155' },
  backBtn: { padding: 8 },
  backText: { color: '#1D9E75', fontSize: 16, fontWeight: '600' },
  headerTitle: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold' },
  providerCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, marginBottom: 32, borderWidth: 1, borderColor: '#334155' },
  providerLabel: { color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  providerName: { color: '#f8fafc', fontSize: 24, fontWeight: 'bold' },
  providerRole: { color: '#1D9E75', fontSize: 14, marginTop: 4, marginBottom: 20 },
  actionRow: { flexDirection: 'row', gap: 12 },
  callBtn: { flex: 1, backgroundColor: '#0f172a', padding: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  callBtnText: { color: '#f8fafc', fontWeight: 'bold' },
  chatBtn: { flex: 1, backgroundColor: '#1D9E75', padding: 12, borderRadius: 10, alignItems: 'center' },
  chatBtnText: { color: '#fff', fontWeight: 'bold' },
  timelineTitle: { color: '#f8fafc', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  timeline: { paddingLeft: 10, marginBottom: 40 },
  stepContainer: { flexDirection: 'row', minHeight: 70 },
  stepIndicator: { alignItems: 'center', width: 30, marginRight: 15 },
  circle: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#334155', borderWidth: 3, borderColor: '#0f172a', zIndex: 2 },
  circleDone: { backgroundColor: '#1D9E75' },
  circleActive: { backgroundColor: '#f8fafc', borderColor: '#1D9E75', borderWidth: 4, width: 20, height: 20, borderRadius: 10 },
  line: { width: 2, flex: 1, backgroundColor: '#334155', position: 'absolute', top: 16, bottom: -16, zIndex: 1 },
  lineDone: { backgroundColor: '#1D9E75' },
  stepContent: { flex: 1, paddingBottom: 24, justifyContent: 'flex-start' },
  stepTitle: { color: '#64748b', fontSize: 16, fontWeight: '500' },
  stepTitleActive: { color: '#f8fafc', fontWeight: 'bold' },
  stepTime: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  disputeBtn: { padding: 16, borderRadius: 12, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ef4444' },
  disputeText: { color: '#ef4444', fontWeight: '600' }
});
