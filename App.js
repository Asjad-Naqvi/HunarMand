import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ScrollView } from 'react-native';
import { sendMessageToCustomerAgent } from './AgentService';

export default function App() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        // Add user message to UI
        const newMessages = [...messages, { role: 'user', text: input }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        // Get response from our AI Agent
        const aiResponseText = await sendMessageToCustomerAgent(input);

        // Add AI response to UI
        setMessages([...newMessages, { role: 'agent', text: aiResponseText }]);
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.chatArea}>
                {messages.map((msg, index) => (
                    <View key={index} style={msg.role === 'user' ? styles.userMsg : styles.agentMsg}>
                        <Text style={{ color: msg.role === 'user' ? 'white' : 'black' }}>
                            {msg.text}
                        </Text>
                    </View>
                ))}
                {loading && <Text style={{ margin: 10, fontStyle: 'italic' }}>Agent is typing...</Text>}
            </ScrollView>

            <View style={styles.inputArea}>
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder="Type your issue..."
                />
                <Button title="Send" onPress={handleSend} disabled={loading} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50 },
    chatArea: { flex: 1, padding: 10 },
    inputArea: { flexDirection: 'row', padding: 10, backgroundColor: 'white' },
    input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15, marginRight: 10 },
    userMsg: { alignSelf: 'flex-end', backgroundColor: '#007AFF', padding: 10, borderRadius: 10, marginVertical: 5, maxWidth: '80%' },
    agentMsg: { alignSelf: 'flex-start', backgroundColor: '#E5E5EA', padding: 10, borderRadius: 10, marginVertical: 5, maxWidth: '80%' }
});
