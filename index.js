import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HidmetGo</Text>
      <Text style={styles.sub}>Apni service request karein</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1D9E75',
  },
  sub: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
  },
});