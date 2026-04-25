import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Linking, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function ServicesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Maid', 'Plumber', 'Electrician', 'Cook', 'Other'];

  const userRole = Array.isArray(user?.roles) ? user.roles[0] : (user?.role || 'user');
  
  // 🛡️ ADMIN LOGIC: অ্যাডমিন চেক এবং অ্যাডমিনের + বাটন বন্ধ করা
  const isAdmin = userRole === 'admin';
  const canAddService = userRole === 'service'; // আগে admin ছিল, এখন শুধু service প্রোভাইডার অ্যাড করতে পারবে

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch (error) {
      console.log("Error fetching services", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchServices(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchServices(); };

  // 🗑️ Admin Delete Function
  const handleAdminDelete = (id: string) => {
    Alert.alert(
      "Delete Service",
      "Are you sure you want to permanently delete this service? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await api.delete(`/services/${id}`);
              setServices(prev => prev.filter(item => item._id !== id)); // UI থেকে ডিলিট
              Alert.alert("Success", "Service removed from database.");
            } catch (error) {
              Alert.alert("Error", "Failed to delete service.");
            }
          }
        }
      ]
    );
  };

  // ⚡ Role Based Logic
  const filteredServices = useMemo(() => {
    let result = services;

    // 🛡️ Service Provider will ONLY see their OWN listed services
    if (userRole === 'service') {
      result = result.filter(srv => {
        const providerId = srv.providerId?._id || srv.providerId;
        return providerId === user?._id;
      });
    }

    if (activeFilter !== 'All') {
      result = result.filter(srv => srv.category === activeFilter);
    }

    return result;
  }, [services, activeFilter, userRole, user?._id]);

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.image || 'https://via.placeholder.com/150' }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
        <View style={styles.ratingBox}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.ratingText}>{item.rating || 'New'}</Text>
        </View>

        {/* 🚨 Admin Delete Button */}
        {isAdmin && (
          <TouchableOpacity style={styles.adminDeleteBtn} onPress={(e) => { e.stopPropagation(); handleAdminDelete(item._id); }}>
            <Ionicons name="trash" size={18} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Ionicons name="briefcase" size={16} color="#64748B" />
          <Text style={styles.detailText}>Experience: <Text style={styles.boldText}>{item.experience}</Text></Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time" size={16} color="#64748B" />
          <Text style={styles.detailText}>Availability: <Text style={styles.boldText}>{item.availability}</Text></Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash" size={16} color="#10B981" />
          <Text style={styles.priceText}>₹{item.pricing} <Text style={styles.priceType}>/ {item.pricingType}</Text></Text>
        </View>
      </View>

      {/* Hire Button */}
      {userRole !== 'service' && (
        <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(item.providerId?.phone || '9999999999')}>
          <Ionicons name="call" size={18} color="#ffffff" />
          <Text style={styles.callBtnText}>Hire Professional</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{userRole === 'service' ? 'My Services' : 'Hire Services'}</Text>
          <Text style={styles.headerSubtitle}>{userRole === 'service' ? 'Manage your service profile' : 'Find trusted professionals'}</Text>
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
        <ActivityIndicator size="large" color="#F59E0B" style={styles.loader} />
      ) : filteredServices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image source={{uri: 'https://cdn-icons-png.flaticon.com/512/2886/2886665.png'}} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>{userRole === 'service' ? 'No profile created!' : 'No professionals found!'}</Text>
          <Text style={styles.emptySubText}>{userRole === 'service' ? 'Tap the + button to create your service profile.' : 'Try a different category or check back later.'}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F59E0B']} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {canAddService && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/add-service' as any)}>
          <Ionicons name="add" size={32} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FE' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#ffffff', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, elevation: 8, shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, zIndex: 10 },
  backBtn: { width: 40, height: 40, backgroundColor: '#FFFBEB', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
  headerSubtitle: { fontSize: 13, color: '#F59E0B', fontWeight: '700' },
  filterWrapper: { paddingVertical: 15 },
  filterScroll: { paddingHorizontal: 20, gap: 10 },
  pillTab: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  activePillTab: { backgroundColor: '#F59E0B', borderColor: '#F59E0B', shadowColor: '#F59E0B', elevation: 5, shadowOpacity: 0.3, shadowRadius: 5 },
  pillTabText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  activePillTabText: { color: '#ffffff' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: '#ffffff', borderRadius: 20, marginBottom: 20, padding: 15, elevation: 6, shadowColor: '#1E293B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F1F5F9' },
  headerInfo: { flex: 1, marginLeft: 15 },
  name: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#FEF3C7' },
  categoryText: { fontSize: 11, fontWeight: '700', color: '#D97706' },
  ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: '#1E293B', marginLeft: 4 },
  
  // 🚨 Admin Delete Button Style
  adminDeleteBtn: { position: 'absolute', top: 0, right: 0, backgroundColor: '#EF4444', width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', elevation: 5 },

  detailsContainer: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 15 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailText: { fontSize: 13, color: '#64748B', marginLeft: 8 },
  boldText: { fontWeight: '700', color: '#1E293B' },
  priceText: { fontSize: 16, fontWeight: '900', color: '#10B981', marginLeft: 8 },
  priceType: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  callBtn: { flexDirection: 'row', backgroundColor: '#1E293B', padding: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  callBtnText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  emptyIcon: { width: 100, height: 100, opacity: 0.5, marginBottom: 15 },
  emptyText: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  emptySubText: { fontSize: 14, color: '#64748B', marginTop: 6, textAlign: 'center', paddingHorizontal: 20 },
  fab: { position: 'absolute', bottom: 25, right: 25, backgroundColor: '#F59E0B', width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', elevation: 12, shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 10, borderWidth: 2, borderColor: '#ffffff' }
});