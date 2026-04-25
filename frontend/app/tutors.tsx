import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Linking, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function TutorsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Online', 'Offline', 'Both'];

  const userRole = Array.isArray(user?.roles) ? user.roles[0] : (user?.role || 'user');
  const canAddTutor = userRole === 'teacher' || userRole === 'admin';

  const fetchTutors = async () => {
    try {
      const res = await api.get('/tutors');
      setTutors(res.data);
    } catch (error) {
      console.log("Error fetching tutors", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchTutors(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchTutors(); };

  // ⚡ Role Based Filter Logic
  const filteredTutors = useMemo(() => {
    let result = tutors;

    // 🛡️ Teachers will ONLY see their OWN profile
    if (userRole === 'teacher') {
      result = result.filter(tutor => {
        const providerId = tutor.providerId?._id || tutor.providerId;
        return providerId === user?._id;
      });
    }

    if (activeFilter !== 'All') {
      result = result.filter(tutor => tutor.mode === activeFilter || tutor.mode === 'Both');
    }

    return result;
  }, [tutors, activeFilter, userRole, user?._id]);

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.image || 'https://via.placeholder.com/150' }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <View style={styles.modeBadge}>
            <Ionicons name={item.mode === 'Online' ? 'laptop-outline' : item.mode === 'Offline' ? 'business-outline' : 'globe-outline'} size={12} color="#6D28D9" />
            <Text style={styles.modeText}>{item.mode} Classes</Text>
          </View>
        </View>
        <View style={styles.ratingBox}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.ratingText}>{item.rating || 'New'}</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        {/* Subjects Chips */}
        <Text style={styles.subHeading}>Subjects Taught:</Text>
        <View style={styles.subjectsContainer}>
          {item.subjects.map((sub: string, idx: number) => (
            <View key={idx} style={styles.subjectChip}>
              <Text style={styles.subjectText}>{sub}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Ionicons name="briefcase-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>Experience: <Text style={styles.boldText}>{item.experience}</Text></Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>Time: <Text style={styles.boldText}>{item.availability}</Text></Text>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>₹{item.pricing} <Text style={styles.priceType}>/ {item.pricingType}</Text></Text>
          
          {/* Contact Button (Hidden for the Teacher looking at their own profile) */}
          {userRole !== 'teacher' && (
            <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(item.providerId?.phone || '9999999999')}>
              <Text style={styles.callBtnText}>Book Tutor</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 🌟 Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{userRole === 'teacher' ? 'My Teaching Profile' : 'Find Tutors'}</Text>
          <Text style={styles.headerSubtitle}>{userRole === 'teacher' ? 'Manage your classes' : 'Learn from the best'}</Text>
        </View>
      </View>

      {/* 💊 Filters */}
      <View style={styles.filterWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.pillTab, activeFilter === item && styles.activePillTab]}
              onPress={() => setActiveFilter(item)}
            >
              <Text style={[styles.pillTabText, activeFilter === item && styles.activePillTabText]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 📋 List */}
      {loading ? (
        <ActivityIndicator size="large" color="#8B5CF6" style={styles.loader} />
      ) : filteredTutors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image source={{uri: 'https://cdn-icons-png.flaticon.com/512/3353/3353186.png'}} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>{userRole === 'teacher' ? 'No profile created!' : 'No tutors found!'}</Text>
          <Text style={styles.emptySubText}>{userRole === 'teacher' ? 'Tap the + button to create your teaching profile.' : 'Try a different filter or check back later.'}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTutors}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 🚀 FAB for Teachers */}
      {canAddTutor && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/add-tutor' as any)}>
          <Ionicons name="add" size={32} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FE' },
  
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#ffffff', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, elevation: 8, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, zIndex: 10 },
  backBtn: { width: 40, height: 40, backgroundColor: '#F5F3FF', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
  headerSubtitle: { fontSize: 13, color: '#8B5CF6', fontWeight: '700' },

  filterWrapper: { paddingVertical: 15 },
  filterScroll: { paddingHorizontal: 20, gap: 10 },
  pillTab: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  activePillTab: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6', shadowColor: '#8B5CF6', elevation: 5, shadowOpacity: 0.3, shadowRadius: 5 },
  pillTabText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  activePillTabText: { color: '#ffffff' },

  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 20, paddingBottom: 100 },
  
  card: { backgroundColor: '#ffffff', borderRadius: 20, marginBottom: 20, padding: 15, elevation: 6, shadowColor: '#1E293B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, borderWidth: 1, borderColor: '#F5F3FF' },
  
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#F1F5F9' },
  headerInfo: { flex: 1, marginLeft: 15 },
  name: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  modeBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#F5F3FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#EDE9FE' },
  modeText: { fontSize: 10, fontWeight: '700', color: '#6D28D9', marginLeft: 4 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#FEF3C7' },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: '#D97706', marginLeft: 4 },

  detailsContainer: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 16 },
  subHeading: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 8 },
  subjectsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  subjectChip: { backgroundColor: '#ffffff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  subjectText: { fontSize: 11, color: '#1E293B', fontWeight: '600' },
  
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 },
  
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailText: { fontSize: 13, color: '#64748B', marginLeft: 8 },
  boldText: { fontWeight: '700', color: '#1E293B' },
  
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  priceText: { fontSize: 18, fontWeight: '900', color: '#8B5CF6' },
  priceType: { fontSize: 12, fontWeight: '600', color: '#64748B' },

  callBtn: { backgroundColor: '#8B5CF6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, elevation: 3 },
  callBtnText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  emptyIcon: { width: 100, height: 100, opacity: 0.5, marginBottom: 15 },
  emptyText: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  emptySubText: { fontSize: 14, color: '#64748B', marginTop: 6, textAlign: 'center', paddingHorizontal: 20 },

  fab: { position: 'absolute', bottom: 25, right: 25, backgroundColor: '#8B5CF6', width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', elevation: 12, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 10, borderWidth: 2, borderColor: '#ffffff' }
});