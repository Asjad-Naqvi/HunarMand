import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function ModesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Mode</Text>
      <Text style={styles.subtitle}>Choose how you want to proceed</Text>

      <TouchableOpacity
        style={[styles.button, styles.hireCraftsman]}
        onPress={() => router.push('/hire')}
      >
        <Text style={styles.buttonTitle}>Hire Craftsman</Text>
        <Text style={styles.buttonDescription}>Find skilled professionals</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.findWork]}
        onPress={() => router.push('/find-work')}
      >
        <Text style={styles.buttonTitle}>Find Work</Text>
        <Text style={styles.buttonDescription}>Discover job opportunities</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1D9E75',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: 'center',
  },
  hireCraftsman: {
    backgroundColor: '#1D9E75',
  },
  findWork: {
    backgroundColor: '#0ea5e9',
  },
  buttonTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  buttonDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
  },
  backButton: {
    marginTop: 24,
    paddingVertical: 12,
  },
  backText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
