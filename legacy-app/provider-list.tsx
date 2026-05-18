import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ProviderListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [providers, setProviders] = useState<any[]>([]);
  const [historyStr, setHistoryStr] = useState('');

  useEffect(() => {
    if (params.history) {
      try {
        setHistoryStr(params.history as string);
        const history = JSON.parse(params.history as string);
        const toolRes = [...history].reverse().find((item: any) => item.role === 'tool');
        if (toolRes && toolRes.content) {
          const toolData = JSON.parse(toolRes.content);
          if (toolData.providers) {
            setProviders(toolData.providers);
          }
        }
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, [params.history]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ranked Matches</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: '/agent-traces', params: { history: historyStr } })}>
          <Text style={styles.tracesText}>🤖 Traces</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.contextText}>Based on your request, we found {providers.length} highly qualified professionals near you.</Text>

        {providers.length === 0 && (
          <Text style={{ color: '#fff' }}>No providers found or loading...</Text>
        )}

        {providers.map((provider, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.card, index === 0 && styles.topCard]}
            onPress={() => router.push({ pathname: '/provider-detail', params: { provider: JSON.stringify(provider) } })}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.providerName}>{provider.name}</Text>
                <Text style={styles.providerRole}>{(provider.specialty || []).join(', ')}</Text>
              </View>
              <View style={styles.tagContainer}>
                <Text style={styles.tagText}>{index === 0 ? 'Top Match' : 'Great Value'}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>⭐</Text>
                <Text style={styles.statValue}>{provider.rating || 'N/A'}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>📍</Text>
                <Text style={styles.statValue}>{provider.area || 'Islamabad'}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>💵</Text>
                <Text style={styles.statValue}>RS {provider.pricing_breakdown?.final_total || provider.base_rate}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  tracesText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  list: { flex: 1 },
  contextText: { color: '#94a3b8', fontSize: 15, marginBottom: 20, lineHeight: 22 },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  topCard: { borderColor: '#1D9E75', shadowColor: '#1D9E75', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  providerName: { color: '#f8fafc', fontSize: 20, fontWeight: 'bold' },
  providerRole: { color: '#94a3b8', fontSize: 14, marginTop: 4 },
  tagContainer: { backgroundColor: 'rgba(29, 158, 117, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(29, 158, 117, 0.3)' },
  tagText: { color: '#1D9E75', fontSize: 12, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statIcon: { fontSize: 14, marginRight: 4 },
  statValue: { color: '#e2e8f0', fontSize: 14, fontWeight: '500' },
  statItemMatch: { backgroundColor: '#1D9E75', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  matchValue: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});
