import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Linking, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function InternshipScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [activeCategory, setActiveCategory] = useState('Tech');
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories = ['Tech', 'Govt', 'Design', 'Marketing'];

  const fetchInternships = async () => {
    try {
      // 🌐 ডাটাবেস থেকে রিয়েল-টাইম ইন্টার্নশিপ আসবে
      const res = await api.get('/internships');
      setInternships(res.data);
    } catch (error) {
      console.log("Error fetching internships", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchInternships(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchInternships(); };

  // 🔗 রিয়েল ওয়েবসাইট বা লিঙ্কডইন ওপেন করার লজিক
  const handleApply = (url: string) => {
    if (!url) return Alert.alert("Link Missing", "This internship link is not updated yet.");
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL on your device.');
      }
    });
  };

  const filteredData = internships.filter(item => item.category === activeCategory);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Image source={{ uri: item.logo || 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png' }} style={styles.logo} />
        <View style={styles.mainInfo}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.company}>{item.company}</Text>
        </View>
        <View style={styles.sourceTag}>
          <Text style={styles.sourceText}>{item.platform || 'Direct'}</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailBox}>
          <Ionicons name="time-outline" size={14} color="#64748B" />
          <Text style={styles.detailText}>{item.duration}</Text>
        </View>
        <View style={styles.detailBox}>
          <Ionicons name="cash-outline" size={14} color="#10B981" />
          <Text style={styles.detailText}>{item.stipend}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.applyBtn} onPress={() => handleApply(item.link)}>
        <Text style={styles.applyBtnText}>Apply on {item.platform || 'Official Site'}</Text>
        <Ionicons name="open-outline" size={16} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Internships</Text>
          <Text style={styles.headerSubtitle}>Real-time Career Opportunities</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        {categories.map(cat => (
          <TouchableOpacity key={cat} style={[styles.tab, activeCategory === cat && styles.activeTab]} onPress={() => setActiveCategory(cat)}>
            <Text style={[styles.tabText, activeCategory === cat && styles.activeTabText]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4361EE" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No internships found in this category.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FE' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#4361EE', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#ffffff' },
  headerSubtitle: { fontSize: 13, color: '#D1D5DB' },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#ffffff', elevation: 2 },
  activeTab: { backgroundColor: '#4361EE' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  activeTabText: { color: '#ffffff' },
  list: { paddingHorizontal: 20, paddingBottom: 50 },
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 15, marginBottom: 15, elevation: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 45, height: 45, borderRadius: 10 },
  mainInfo: { flex: 1, marginLeft: 15 },
  title: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  company: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  sourceTag: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  sourceText: { fontSize: 10, fontWeight: '900', color: '#4361EE' },
  detailsRow: { flexDirection: 'row', gap: 15, marginVertical: 15 },
  detailBox: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 12, fontWeight: '700', color: '#475569', marginLeft: 5 },
  applyBtn: { flexDirection: 'row', backgroundColor: '#4361EE', padding: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
  applyBtnText: { color: '#ffffff', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#94A3B8', fontWeight: '700' }
});