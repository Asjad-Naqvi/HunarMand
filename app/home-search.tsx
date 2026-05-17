import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (query.trim()) {
      setLoading(true);
      try {
        const response = await fetch('http://192.168.1.18:5000/api/agent/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: query, mode: 'customer' })
        });
        const data = await response.json();
        if (data.status === 'success') {
          router.push({
            pathname: '/provider-list',
            params: { history: JSON.stringify(data.history) }
          });
        } else {
          alert("Error: " + data.error);
        }
      } catch (err) {
        alert("Network Error: Make sure backend is running. " + err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <Text style={styles.title}>OddJobs</Text>
        <TouchableOpacity style={styles.tracesButton} onPress={() => router.push('/agent-traces')}>
          <Text style={styles.tracesText}>🤖 Agent Traces</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.greeting}>What do you need help with?</Text>
        <Text style={styles.subtitle}>Type your request in any language (English, Urdu, Roman Urdu).</Text>
        
        <View style={styles.searchBox}>
          <TextInput
            style={styles.input}
            placeholder="e.g., 'mera AC kaam nahi kar raha, kal technician chahiye'"
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={4}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <TouchableOpacity 
          style={[styles.searchButton, (!query.trim() || loading) && styles.searchButtonDisabled]} 
          onPress={handleSearch}
          disabled={!query.trim() || loading}
        >
          <Text style={styles.searchButtonText}>{loading ? 'Searching via AI...' : 'Find Professionals →'}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.push('/follow-up')}>
          <Text style={styles.footerLink}>View Active Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/dispute')}>
          <Text style={styles.footerLink}>Help & Support</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D9E75',
  },
  tracesButton: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tracesText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 32,
    lineHeight: 24,
  },
  searchBox: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  input: {
    color: '#f8fafc',
    fontSize: 18,
    padding: 20,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  searchButton: {
    backgroundColor: '#1D9E75',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#1D9E75',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonDisabled: {
    backgroundColor: '#334155',
    shadowOpacity: 0,
    elevation: 0,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  footerLink: {
    color: '#1D9E75',
    fontSize: 14,
    fontWeight: '600',
  }
});
