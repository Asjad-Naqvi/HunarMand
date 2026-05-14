import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function ChatProviderScreen() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'agent', text: 'Welcome! I am the dispatch agent. Are you looking for work today? What is your specialty and location?' }
  ]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');

    try {
      const response = await fetch('http://192.168.1.18:5000/api/agent/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, mode: 'provider' })
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setMessages(prev => [...prev, { role: 'agent', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'agent', text: 'Error: ' + data.error }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'agent', text: 'Network Error: Make sure backend is running.' }]);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Dispatch AI</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.chatArea} contentContainerStyle={{ padding: 16 }}>
        {messages.map((msg, index) => (
          <View key={index} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.agentBubble]}>
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="I can fix ACs in G-13..."
          placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, backgroundColor: '#1e293b' },
  backBtn: { padding: 8 },
  backText: { color: '#0ea5e9', fontSize: 16, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  chatArea: { flex: 1 },
  messageBubble: { maxWidth: '80%', padding: 14, borderRadius: 16, marginBottom: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#0ea5e9', borderBottomRightRadius: 4 },
  agentBubble: { alignSelf: 'flex-start', backgroundColor: '#1e293b', borderBottomLeftRadius: 4 },
  messageText: { color: '#f8fafc', fontSize: 15, lineHeight: 22 },
  inputContainer: { flexDirection: 'row', padding: 16, paddingBottom: Platform.OS === 'ios' ? 40 : 50, backgroundColor: '#1e293b', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#0f172a', color: '#fff', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, marginRight: 12 },
  sendButton: { backgroundColor: '#0ea5e9', borderRadius: 24, paddingVertical: 12, paddingHorizontal: 20 },
  sendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});
