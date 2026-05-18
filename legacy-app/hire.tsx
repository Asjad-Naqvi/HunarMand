import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CRAFTSMEN_CATEGORIES = [
  { id: '1', name: 'Plumbing', icon: '🔧' },
  { id: '2', name: 'Electrical', icon: '⚡' },
  { id: '3', name: 'Carpentry', icon: '🪓' },
  { id: '4', name: 'Painting', icon: '🎨' },
  { id: '5', name: 'Cleaning', icon: '🧹' },
  { id: '6', name: 'HVAC', icon: '❄️' },
];

export default function HireScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking Supabase Connection...');
  const [providers, setProviders] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      console.log("Checking Supabase connection and fetching data...");
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Supabase Error:", sessionError.message);
        setConnectionStatus(`❌ Error: ${sessionError.message}`);
      } else {
        setConnectionStatus("✅ Supabase is fully connected!");
        
        // Fetch the seeded providers
        const { data: profilesData, error: profilesError } = await supabase
          .from('provider_profiles')
          .select('*, users(name)');
          
        if (profilesError) {
           console.error("Error fetching profiles:", profilesError);
        } else if (profilesData) {
           setProviders(profilesData);
        }
      }
    };

    fetchData();
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Navigate to craftsmen list or details page
    // router.push(`/craftsmen/${categoryId}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hire Craftsman</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={{ padding: 12, backgroundColor: connectionStatus.includes('✅') ? '#0f5132' : (connectionStatus.includes('Checking') ? '#334155' : '#842029'), marginHorizontal: 20, marginTop: 10, borderRadius: 8 }}>
         <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>{connectionStatus}</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Select Service Category</Text>

        <View style={styles.grid}>
          {CRAFTSMEN_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.categoryCardSelected,
              ]}
              onPress={() => handleCategorySelect(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedCategory && (
          <TouchableOpacity style={styles.continueButton}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        )}

        {providers.length > 0 && (
          <View style={{ marginTop: 20 }}>
             <Text style={styles.sectionTitle}>Seeded Providers ({providers.length})</Text>
             {providers.map((p, idx) => (
               <View key={idx} style={{ backgroundColor: '#1e293b', padding: 15, borderRadius: 10, marginBottom: 10 }}>
                 <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{p.users?.name || 'Unknown Provider'}</Text>
                 <Text style={{ color: '#94a3b8', fontSize: 14 }}>{p.city} - {p.area}</Text>
                 <Text style={{ color: '#1D9E75', marginTop: 5, fontWeight: 'bold' }}>⭐ {p.rating} ({p.total_reviews} reviews)</Text>
                 <Text style={{ color: '#cbd5e1', marginTop: 5, fontStyle: 'italic' }}>"{p.bio}"</Text>
               </View>
             ))}
          </View>
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
    color: '#1D9E75',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  categoryCardSelected: {
    borderColor: '#1D9E75',
    backgroundColor: '#1D9E75',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e2e8f0',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#1D9E75',
    borderRadius: 8,
    paddingVertical: 14,
    marginVertical: 20,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
