import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function DisputeScreen() {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  const ISSUES = [
    'Provider did not arrive',
    'Price was different than estimated',
    'Unprofessional behavior',
    'Job was not completed properly',
    'I just want to cancel'
  ];

  const handleSubmit = () => {
    if (!selectedIssue) {
      Alert.alert('Selection Required', 'Please select a reason first.');
      return;
    }
    Alert.alert('Report Submitted', 'Our support agent will contact you shortly.', [
      { text: 'OK', onPress: () => router.push('/home-search') }
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dispute & Support</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.warningTitle}>We're sorry you had an issue.</Text>
        <Text style={styles.warningSubtitle}>Please let us know what went wrong with Job #ODD-9482A so we can resolve it immediately.</Text>

        <Text style={styles.sectionLabel}>Select the primary issue:</Text>
        {ISSUES.map((issue, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={[styles.issueBtn, selectedIssue === issue && styles.issueBtnSelected]}
            onPress={() => setSelectedIssue(issue)}
          >
            <Text style={[styles.issueText, selectedIssue === issue && styles.issueTextSelected]}>{issue}</Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Additional details (optional):</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Please explain further..."
          placeholderTextColor="#64748b"
          multiline
          numberOfLines={4}
          value={reason}
          onChangeText={setReason}
        />

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Submit Report</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155' },
  backBtn: { padding: 8 },
  backText: { color: '#1D9E75', fontSize: 16, fontWeight: '600' },
  headerTitle: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 24 },
  warningTitle: { color: '#f8fafc', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  warningSubtitle: { color: '#94a3b8', fontSize: 15, lineHeight: 22, marginBottom: 32 },
  sectionLabel: { color: '#f8fafc', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  issueBtn: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  issueBtnSelected: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' },
  issueText: { color: '#94a3b8', fontSize: 15 },
  issueTextSelected: { color: '#ef4444', fontWeight: 'bold' },
  textArea: { backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155', color: '#f8fafc', padding: 16, height: 120, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#ef4444', padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#ef4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
