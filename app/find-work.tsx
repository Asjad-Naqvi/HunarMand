import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

const JOB_CATEGORIES = [
  { id: '1', title: 'Plumbing Jobs', description: '12 opportunities', icon: '🔧' },
  { id: '2', title: 'Electrical Work', description: '8 opportunities', icon: '⚡' },
  { id: '3', title: 'Carpentry', description: '15 opportunities', icon: '🪓' },
  { id: '4', title: 'Painting', description: '10 opportunities', icon: '🎨' },
  { id: '5', title: 'Cleaning', description: '20 opportunities', icon: '🧹' },
  { id: '6', title: 'General Labor', description: '25 opportunities', icon: '💼' },
];

export default function FindWorkScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Navigate to job listings or details page
    // router.push(`/jobs/${categoryId}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Work</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Browse Job Categories</Text>

        <View style={styles.jobsList}>
          {JOB_CATEGORIES.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={[
                styles.jobCard,
                selectedCategory === job.id && styles.jobCardSelected,
              ]}
              onPress={() => handleCategorySelect(job.id)}
            >
              <Text style={styles.jobIcon}>{job.icon}</Text>
              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobDescription}>{job.description}</Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedCategory && (
          <TouchableOpacity style={styles.applyButton}>
            <Text style={styles.applyButtonText}>View Jobs</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    color: '#0ea5e9',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 16,
  },
  jobsList: {
    gap: 12,
  },
  jobCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  jobCardSelected: {
    borderColor: '#0ea5e9',
    backgroundColor: '#0ea5e9',
  },
  jobIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 2,
  },
  jobDescription: {
    fontSize: 12,
    color: '#94a3b8',
  },
  arrowIcon: {
    fontSize: 18,
    color: '#e2e8f0',
  },
  applyButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    paddingVertical: 14,
    marginVertical: 20,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
