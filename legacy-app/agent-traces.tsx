import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function AgentTracesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [logs, setLogs] = useState<{time: string, action: string, details: string}[]>([]);

  useEffect(() => {
    if (params.history) {
      try {
        const history = JSON.parse(params.history as string);
        const newLogs: any[] = [];
        let t = 1;
        history.forEach((msg: any) => {
          if (msg.role === 'user') {
            newLogs.push({ time: `Step ${t++}`, action: 'User Input', details: msg.content });
          } else if (msg.role === 'assistant' && msg.tool_calls) {
            msg.tool_calls.forEach((call: any) => {
              newLogs.push({ time: `Step ${t++}`, action: `Tool Executed: ${call.function.name}`, details: call.function.arguments });
            });
          } else if (msg.role === 'tool') {
            newLogs.push({ time: `Step ${t++}`, action: `Database Output (${msg.name})`, details: msg.content.substring(0, 150) + '...' });
          } else if (msg.role === 'assistant' && !msg.tool_calls) {
            newLogs.push({ time: `Step ${t++}`, action: 'Agent Reply', details: msg.content });
          }
        });
        setLogs(newLogs);
      } catch (e) {}
    }
  }, [params.history]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Agent Traces</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.introBox}>
          <Text style={styles.introText}>Transparency Mode enabled. View the exact reasoning steps and tool calls the AI agent made to process the last request.</Text>
        </View>

        <View style={styles.terminal}>
          <View style={styles.terminalHeader}>
            <View style={styles.dotRed} />
            <View style={styles.dotYellow} />
            <View style={styles.dotGreen} />
            <Text style={styles.terminalTitle}>oddjobs-agent-logs</Text>
          </View>
          
          <View style={styles.terminalBody}>
            {logs.length === 0 && <Text style={styles.logDetails}>No traces available. Do a search first!</Text>}
            {logs.map((trace, idx) => (
              <View key={idx} style={styles.logEntry}>
                <View style={styles.logMeta}>
                  <Text style={styles.logTime}>[{trace.time}]</Text>
                  <Text style={styles.logAction}>{trace.action}</Text>
                </View>
                <Text style={styles.logDetails}>{trace.details}</Text>
              </View>
            ))}
            <Text style={styles.logEnd}>$ Agent execution completed.</Text>
          </View>
        </View>
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
  introBox: { backgroundColor: 'rgba(29, 158, 117, 0.1)', padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(29, 158, 117, 0.3)' },
  introText: { color: '#1D9E75', fontSize: 14, lineHeight: 20 },
  terminal: { backgroundColor: '#000', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
  terminalHeader: { backgroundColor: '#1e293b', padding: 10, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#334155' },
  dotRed: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ef4444', marginRight: 6 },
  dotYellow: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#eab308', marginRight: 6 },
  dotGreen: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#22c55e', marginRight: 12 },
  terminalTitle: { color: '#94a3b8', fontSize: 12, fontFamily: 'monospace' },
  terminalBody: { padding: 16 },
  logEntry: { marginBottom: 16 },
  logMeta: { flexDirection: 'row', marginBottom: 4 },
  logTime: { color: '#64748b', fontSize: 12, fontFamily: 'monospace', marginRight: 8 },
  logAction: { color: '#38bdf8', fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold' },
  logDetails: { color: '#e2e8f0', fontSize: 13, fontFamily: 'monospace', lineHeight: 18, marginLeft: 16 },
  logEnd: { color: '#22c55e', fontSize: 13, fontFamily: 'monospace', marginTop: 10 }
});
