import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Dimensions, TextInput, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function FoodScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const userRole = Array.isArray(user?.roles) ? user.roles[0] : (user?.role || 'user');
  const isAdmin = userRole === 'admin';

  const [activeTab, setActiveTab] = useState<'Home' | 'Restaurants'>('Home');
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All'); 
  const [mealFilter, setMealFilter] = useState('All'); 
  const mealTypes = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Dinner'];

  const fetchFoods = async () => {
    try {
      const res = await api.get('/foods');
      setFoods(res.data);
    } catch (error) {
      console.log("Error fetching foods", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchFoods(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchFoods(); };

  // ⚡ Filter Logic: Home vs Restaurant আলাদা করা
 // ⚡ Filter Logic Update
  const filteredData = useMemo(() => {
    const currentSource = activeTab === 'Home' ? 'Home' : 'Restaurant';
    
    // ১. সোর্স অনুযায়ী ফিল্টার
    let result = foods.filter(item => (item.foodSource || 'Home') === currentSource);

    // 🛡️ [NEW RULE] নিজের খাবার নিজে দেখবে না (যদি সে অ্যাডমিন না হয়)
    if (!isAdmin) {
      result = result.filter(item => {
        const sellerId = item.sellerId?._id || item.sellerId;
        return sellerId !== user?._id;
      });
    }

    // ২. হোম ফুডের জন্য বাকি ফিল্টার (Search, Veg, Meal Type)
    if (activeTab === 'Home') {
      if (typeFilter !== 'All') result = result.filter(item => item.type === typeFilter);
      if (mealFilter !== 'All') result = result.filter(item => item.mealType === mealFilter);
      if (searchQuery) result = result.filter(item => item.title?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    return result;
  }, [foods, activeTab, typeFilter, mealFilter, searchQuery, user?._id]); 
  const handleWhatsAppOrder = (phone: string, itemName: string, sellerName: string) => {
    const contactNumber = phone.length === 10 ? `91${phone}` : phone; 
    const message = `Hi ${sellerName}, I am from ${user?.college || 'Campus'}. I saw your listing on Campus Super App and I want to order: *${itemName}*. Please confirm!`;
    const url = `whatsapp://send?phone=${contactNumber}&text=${encodeURIComponent(message)}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url);
      else Alert.alert('Error', 'WhatsApp is not installed.');
    });
  };

  const renderFoodItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image || 'https://via.placeholder.com/300' }} style={styles.image} />
        
        {/* 🗑️ [NEW] Admin Delete Button (Only for Home Food Tab) */}
        {isAdmin && activeTab === 'Home' && (
          <TouchableOpacity 
            style={styles.adminDeleteBtn} 
            onPress={() => {
              Alert.alert("Delete Food", "Are you sure?", [
                { text: "Cancel" },
                { text: "Delete", style: "destructive", onPress: async () => {
                    await api.delete(`/foods/${item._id}`);
                    fetchFoods(); // ডিলিট হওয়ার পর লিস্ট রিফ্রেশ হবে
                }}
              ]);
            }}
          >
            <Ionicons name="trash" size={18} color="#ffffff" />
          </TouchableOpacity>
        )}

        <View style={styles.vegTag}>
          <MaterialCommunityIcons name={item.type === 'Veg' ? "circle-box-outline" : "square-circle"} size={20} color={item.type === 'Veg' ? "#10B981" : "#EF4444"} />
        </View>
        <View style={styles.priceTag}><Text style={styles.priceText}>₹{item.price}</Text></View>
      </View>

      <View style={styles.cardContent}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{flex: 1}}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            {/* 🛡️ [FIXED] সেলার নেম এখন প্রোপার দেখাবে */}
            <Text style={styles.sellerName}>By {item.sellerName || 'Verified Seller'}</Text>
          </View>
          <View style={styles.mealBadge}><Text style={styles.mealBadgeText}>{item.mealType}</Text></View>
        </View>

        <TouchableOpacity 
          style={[styles.orderBtn, activeTab === 'Restaurants' && {backgroundColor: '#10B981'}]} 
          onPress={() => handleWhatsAppOrder(item.sellerPhone, item.title, item.sellerName)}
        >
          <Ionicons name="logo-whatsapp" size={18} color="#ffffff" style={{marginRight: 6}} />
          <Text style={styles.orderBtnText}>{activeTab === 'Home' ? 'Order via WhatsApp' : 'Chat with Restaurant'}</Text>
        </TouchableOpacity>
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
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Food <Text style={{color: '#F97316'}}>Zone</Text></Text>
          <Text style={styles.headerSubtitle}>Delicious meals at your fingertips</Text>
        </View>
      </View>

      {/* 🎛️ Dual Tabs */}
      <View style={styles.mainTabContainer}>
        <TouchableOpacity style={[styles.mainTab, activeTab === 'Home' && styles.mainTabActive]} onPress={() => setActiveTab('Home')}>
          <Text style={[styles.mainTabText, activeTab === 'Home' && styles.mainTabTextActive]}>Ghar Ka Khana</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.mainTab, activeTab === 'Restaurants' && styles.mainTabActive]} onPress={() => setActiveTab('Restaurants')}>
          <Text style={[styles.mainTabText, activeTab === 'Restaurants' && styles.mainTabTextActive]}>Local Restaurants</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'Home' && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" style={{marginRight: 10}} />
          <TextInput style={{flex: 1, fontWeight: '600'}} placeholder="Search home thali, snacks..." value={searchQuery} onChangeText={setSearchQuery} />
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#F97316" style={{flex: 1}} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item._id}
          renderItem={renderFoodItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} />}
          ListEmptyComponent={
            <View style={{alignItems: 'center', marginTop: 50}}>
              <Text style={{color: '#94A3B8', fontWeight: '700'}}>No listings found in this category.</Text>
            </View>
          }
        />
      )}

      {/* 🚀 FAB: Hidden for Students and Admin can add both */}
      {((activeTab === 'Home' && userRole !== 'student') || isAdmin) && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/add-food' as any)}>
          <Ionicons name="add" size={32} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  adminDeleteBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#EF4444',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 20
  },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#ffffff' },
  backBtn: { width: 40, height: 40, backgroundColor: '#FFF7ED', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#1E293B' },
  headerSubtitle: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  mainTabContainer: { flexDirection: 'row', backgroundColor: '#ffffff', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  mainTab: { flex: 1, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  mainTabActive: { borderBottomColor: '#F97316' },
  mainTabText: { fontSize: 15, fontWeight: '700', color: '#64748B' },
  mainTabTextActive: { color: '#F97316', fontWeight: '900' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', margin: 20, paddingHorizontal: 15, height: 50, borderRadius: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  listContainer: { padding: 20, paddingBottom: 120 },
  card: { backgroundColor: '#ffffff', borderRadius: 24, marginBottom: 20, overflow: 'hidden', elevation: 6, shadowColor: '#1E293B', shadowOpacity: 0.1, shadowRadius: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 160, resizeMode: 'cover' },
  priceTag: { position: 'absolute', bottom: 15, right: 15, backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  priceText: { color: '#ffffff', fontWeight: '900', fontSize: 16 },
  vegTag: { position: 'absolute', top: 15, left: 15, backgroundColor: '#ffffff', padding: 4, borderRadius: 8, elevation: 2 },
  cardContent: { padding: 15 },
  title: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  sellerName: { fontSize: 13, color: '#64748B', fontWeight: '600', marginBottom: 10 },
  mealBadge: { backgroundColor: '#FFF7ED', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#FFEDD5' },
  mealBadgeText: { fontSize: 11, fontWeight: '700', color: '#F97316' },
  detailsRow: { flexDirection: 'row', gap: 15, marginBottom: 15, backgroundColor: '#F8FAFC', padding: 10, borderRadius: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  orderBtn: { flexDirection: 'row', backgroundColor: '#F97316', paddingVertical: 12, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  orderBtnText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: 25, right: 25, backgroundColor: '#F97316', width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', elevation: 12, shadowColor: '#F97316', shadowOpacity: 0.4, shadowRadius: 10, borderWidth: 2, borderColor: '#ffffff' }
});