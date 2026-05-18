import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function BookingConfirmationScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.receiptContainer}>
        <View style={styles.successIconContainer}>
          <Text style={styles.successIcon}>✓</Text>
        </View>
        
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>Salman Bros will arrive at 02:00 PM today.</Text>
        
        <View style={styles.divider} />
        
        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Booking ID</Text>
          <Text style={styles.receiptValue}>#ODD-9482A</Text>
        </View>
        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Service</Text>
          <Text style={styles.receiptValue}>AC Repair</Text>
        </View>
        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Location</Text>
          <Text style={styles.receiptValue}>G-13, Islamabad</Text>
        </View>
        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Payment Method</Text>
          <Text style={styles.receiptValue}>Cash on Completion</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.receiptRow}>
          <Text style={styles.totalLabel}>Total Estimate</Text>
          <Text style={styles.totalValue}>RS 2200</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/follow-up')}>
          <Text style={styles.primaryBtnText}>Track Status</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/home-search')}>
          <Text style={styles.secondaryBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', padding: 24 },
  receiptContainer: { backgroundColor: '#1e293b', borderRadius: 24, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#334155', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  successIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1D9E75', justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowColor: '#1D9E75', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10 },
  successIcon: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  title: { color: '#f8fafc', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#94a3b8', fontSize: 16, textAlign: 'center', marginBottom: 24 },
  divider: { height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: '#334155', width: '100%', marginVertical: 20, borderRadius: 1 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16 },
  receiptLabel: { color: '#94a3b8', fontSize: 15 },
  receiptValue: { color: '#f8fafc', fontSize: 15, fontWeight: '500' },
  totalLabel: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold' },
  totalValue: { color: '#1D9E75', fontSize: 20, fontWeight: 'bold' },
  actions: { marginTop: 40, gap: 16 },
  primaryBtn: { backgroundColor: '#1D9E75', padding: 16, borderRadius: 16, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryBtn: { padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  secondaryBtnText: { color: '#f8fafc', fontSize: 16, fontWeight: '600' }
});
