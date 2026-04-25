import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Linking, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function PgHostelsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [pgs, setPgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Boys', 'Girls', 'Co-ed', 'Flat'];

  const userRole = Array.isArray(user?.roles) ? user.roles[0] : (user?.role || 'user');
  
  // 🛡️ ADMIN LOGIC: অ্যাডমিন চেক করা হলো এবং অ্যাডমিনকে + বাটন থেকে সরানো হলো
  const isAdmin = userRole === 'admin';
  const canAddPg = userRole === 'pg'; // আগে admin ছিল, এখন শুধু pg ওনাররাই অ্যাড করতে পারবে

  const fetchPgs = async () => {
    try {
      const res = await api.get('/pgs');
      setPgs(res.data);
    } catch (error) {
      console.log("Error fetching PGs", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchPgs(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchPgs(); };

  // 🗑️ Admin Delete Function
  const handleAdminDelete = (id: string) => {
    Alert.alert(
      "Delete PG",
      "Are you sure you want to permanently delete this PG? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await api.delete(`/pgs/${id}`);
              setPgs(prev => prev.filter(item => item._id !== id)); // UI থেকে ডিলিট
              Alert.alert("Success", "PG removed from database.");
            } catch (error) {
              Alert.alert("Error", "Failed to delete PG.");
            }
          }
        }
      ]
    );
  };

  // ⚡ Updated Filter Logic (Role Based View)
  const filteredPgs = useMemo(() => {
    let result = pgs;

    // 🛡️ [NEW LOGIC] PG Owner will ONLY see their OWN properties
    if (userRole === 'pg') {
      result = result.filter(pg => {
        const ownerId = pg.ownerId?._id || pg.ownerId;
        return ownerId === user?._id;
      });
    }

    // Filter by type (Boys, Girls, etc.)
    if (activeFilter !== 'All') {
      result = result.filter(pg => pg.type === activeFilter);
    }

    return result;
  }, [pgs, activeFilter, userRole, user?._id]);

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image || 'https://via.placeholder.com/300x200' }} style={styles.image} />
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>₹{item.rent}/mo</Text>
        </View>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
        
        {/* 🚨 Admin Delete Button */}
        {isAdmin && (
          <TouchableOpacity style={styles.adminDeleteBtn} onPress={(e) => { e.stopPropagation(); handleAdminDelete(item._id); }}>
            <Ionicons name="trash" size={18} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color="#F72585" />
          <Text style={styles.locationText} numberOfLines={1}> {item.location}</Text>
        </View>

        <View style={styles.facilitiesContainer}>
          {item.facilities && item.facilities.slice(0, 3).map((fac: string, idx: number) => (
            <View key={idx} style={styles.facilityChip}>
              <Text style={styles.facilityText}>{fac}</Text>
            </View>
          ))}
          {item.facilities && item.facilities.length > 3 && (
            <View style={styles.facilityChip}>
              <Text style={styles.facilityText}>+{item.facilities.length - 3}</Text>
            </View>
          )}
        </View>

        {/* Contact button is only really useful if it's NOT the owner looking at it, but keeping it for consistency */}
        {userRole !== 'pg' && (
          <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(item.contactNumber)}>
            <Ionicons name="call" size={16} color="#ffffff" />
            <Text style={styles.callBtnText}>Contact Owner</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{userRole === 'pg' ? 'My Properties' : 'PG & Hostels'}</Text>
          <Text style={styles.headerSubtitle}>{userRole === 'pg' ? 'Manage your listings' : 'Find your perfect stay'}</Text>
        </View>
      </View>

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

      {loading ? (
        <ActivityIndicator size="large" color="#10B981" style={styles.loader} />
      ) : filteredPgs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image source={{uri: 'https://cdn-icons-png.flaticon.com/512/1946/1946433.png'}} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>{userRole === 'pg' ? 'No properties listed yet!' : 'No properties found!'}</Text>
          <Text style={styles.emptySubText}>{userRole === 'pg' ? 'Tap the + button below to add your first PG.' : 'Try a different filter or check back later.'}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPgs}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {canAddPg && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/add-pg' as any)}>
          <Ionicons name="add" size={32} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FE' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#ffffff', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, elevation: 8, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, zIndex: 10 },
  backBtn: { width: 40, height: 40, backgroundColor: '#F1F5F9', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
  headerSubtitle: { fontSize: 13, color: '#10B981', fontWeight: '700' },
  filterWrapper: { paddingVertical: 15 },
  filterScroll: { paddingHorizontal: 20, gap: 10 },
  pillTab: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  activePillTab: { backgroundColor: '#10B981', borderColor: '#10B981', shadowColor: '#10B981', elevation: 5, shadowOpacity: 0.3, shadowRadius: 5 },
  pillTabText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  activePillTabText: { color: '#ffffff' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: '#ffffff', borderRadius: 24, marginBottom: 20, overflow: 'hidden', elevation: 10, shadowColor: '#1E293B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 15, borderWidth: 1, borderColor: '#F1F5F9' },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 180, resizeMode: 'cover' },
  priceTag: { position: 'absolute', bottom: 15, right: 15, backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, elevation: 5 },
  priceText: { fontSize: 16, fontWeight: '900', color: '#ffffff' },
  typeTag: { position: 'absolute', top: 15, left: 15, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 12, fontWeight: 'bold', color: '#1E293B' },
  
  // 🚨 Admin Delete Button Style
  adminDeleteBtn: { position: 'absolute', top: 15, right: 15, backgroundColor: '#EF4444', width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', elevation: 5 },

  cardContent: { padding: 15 },
  title: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  locationText: { fontSize: 13, color: '#64748B', fontWeight: '600', flex: 1 },
  facilitiesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 15 },
  facilityChip: { backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#D1FAE5' },
  facilityText: { fontSize: 11, color: '#059669', fontWeight: '700' },
  callBtn: { flexDirection: 'row', backgroundColor: '#1E293B', padding: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  callBtnText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  emptyIcon: { width: 100, height: 100, opacity: 0.5, marginBottom: 15 },
  emptyText: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  emptySubText: { fontSize: 14, color: '#64748B', marginTop: 6, textAlign: 'center', paddingHorizontal: 20 },
  fab: { position: 'absolute', bottom: 25, right: 25, backgroundColor: '#10B981', width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', elevation: 12, shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 10, borderWidth: 2, borderColor: '#ffffff' }
});