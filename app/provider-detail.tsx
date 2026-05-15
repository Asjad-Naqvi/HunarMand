import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ProviderDetailScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollArea}>
        <View style={styles.imageHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.name}>Salman Bros</Text>
          <Text style={styles.role}>AC Specialist • 15 Years Exp</Text>

          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ 4.8 (230 Reviews)</Text>
          </View>

          <View style={styles.availabilityBox}>
            <Text style={styles.availabilityTitle}>Availability: <Text style={{ color: '#1D9E75' }}>Available Today</Text></Text>
            <View style={styles.timeSlots}>
              <View style={styles.timeSlot}><Text style={styles.timeText}>10:00 AM</Text></View>
              <View style={styles.timeSlotSelected}><Text style={styles.timeTextSelected}>02:00 PM</Text></View>
              <View style={styles.timeSlot}><Text style={styles.timeText}>04:30 PM</Text></View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Base Diagnostic Fee</Text>
              <Text style={styles.priceValue}>RS 500</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Estimated Repair (Gas + Labor)</Text>
              <Text style={styles.priceValue}>RS 1700</Text>
            </View>
            <View style={[styles.priceRow, styles.priceTotal]}>
              <Text style={styles.totalLabel}>Total Estimate</Text>
              <Text style={styles.totalValue}>RS 2200</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewAuthor}>Ahmed K. - ⭐⭐⭐⭐⭐</Text>
            <Text style={styles.reviewText}>"Arrived right on time and fixed my AC leaking issue in 30 minutes. Highly recommended!"</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPrice}>RS 2200</Text>
          <Text style={styles.bottomSub}>Estimated Total</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={() => router.push('/booking-confirmation')}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scrollArea: { flex: 1 },
  imageHeader: { height: 120, backgroundColor: '#1e293b', justifyContent: 'flex-start', paddingTop: 60, paddingHorizontal: 20 },
  backBtn: { alignSelf: 'flex-start' },
  backText: { color: '#1D9E75', fontSize: 16, fontWeight: '600' },
  profileSection: { padding: 24, marginTop: -20, backgroundColor: '#0f172a', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  name: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc' },
  role: { fontSize: 16, color: '#94a3b8', marginTop: 4 },
  ratingBadge: { alignSelf: 'flex-start', backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginTop: 12, borderWidth: 1, borderColor: '#334155' },
  ratingText: { color: '#f8fafc', fontSize: 14, fontWeight: '500' },
  availabilityBox: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, marginTop: 24, borderWidth: 1, borderColor: '#334155' },
  availabilityTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  timeSlots: { flexDirection: 'row', gap: 10 },
  timeSlot: { backgroundColor: '#0f172a', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  timeText: { color: '#94a3b8', fontWeight: '500' },
  timeSlotSelected: { backgroundColor: '#1D9E75', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  timeTextSelected: { color: '#fff', fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#f8fafc', marginTop: 32, marginBottom: 16 },
  priceCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#334155' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  priceLabel: { color: '#94a3b8', fontSize: 15 },
  priceValue: { color: '#f8fafc', fontSize: 15, fontWeight: '500' },
  priceTotal: { borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 12, marginTop: 4, marginBottom: 0 },
  totalLabel: { color: '#f8fafc', fontSize: 16, fontWeight: 'bold' },
  totalValue: { color: '#1D9E75', fontSize: 18, fontWeight: 'bold' },
  reviewCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#334155', marginBottom: 40 },
  reviewAuthor: { color: '#f8fafc', fontWeight: 'bold', marginBottom: 8 },
  reviewText: { color: '#cbd5e1', fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
  bottomBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: 20, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#334155' },
  bottomPrice: { color: '#f8fafc', fontSize: 24, fontWeight: 'bold' },
  bottomSub: { color: '#94a3b8', fontSize: 12 },
  bookButton: { backgroundColor: '#1D9E75', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
