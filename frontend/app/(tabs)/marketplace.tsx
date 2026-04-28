import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl, ScrollView, Dimensions, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location'; 
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext'; 

const { width } = Dimensions.get('window');

export default function MarketplaceScreen() {
  const router = useRouter();
  const { user } = useAuth(); 
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationText, setLocationText] = useState('Fetching location...');

  const [activeCondition, setActiveCondition] = useState('All');
  const [activeCourse, setActiveCourse] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const courses = ['All', 'BCA', 'BTech', 'MCA', 'BBA'];
  const conditions = ['All', 'New', 'Second-Hand', 'Rent', 'Old']; 

  // 🛡️ Admin Check
  const isAdmin = user?.role === 'admin' || (Array.isArray(user?.roles) && user.roles.includes('admin'));

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationText('RCCIIT, Kolkata (Default)');
        return;
      }
      try {
        let location = await Location.getCurrentPositionAsync({});
        let geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
        
        if (geocode.length > 0) {
          setLocationText(`${geocode[0].city || geocode[0].district}, ${geocode[0].region}`);
        } else {
          setLocationText('Location not found');
        }
      } catch (error) {
        setLocationText('RCCIIT, Kolkata (Default)');
      }
    })();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.log("Error fetching products", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchProducts(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchProducts(); };

  // 🗑️ Admin Delete Function
  const handleAdminDelete = (productId: string) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to permanently delete this item? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await api.delete(`/products/${productId}`);
              setProducts(prev => prev.filter(item => item._id !== productId)); // UI থেকে সাথে সাথে গায়েব
              Alert.alert("Success", "Product removed from database.");
            } catch (error) {
              Alert.alert("Error", "Failed to delete product.");
            }
          }
        }
      ]
    );
  };

  const filteredProducts = useMemo(() => {
    return products.filter(item => {
      const sellerId = item.sellerId?._id || item.sellerId; 
      if (user?._id && sellerId === user._id) return false; 

      const isUserStudent = user?.isStudent === true || 
                            (Array.isArray(user?.roles) && user.roles.includes('student')) || 
                            user?.role === 'student' || 
                            user?.roles?.[0] === 'student';

      const itemCondition = item.condition ? item.condition.toLowerCase().trim() : '';
      const itemCategory = item.category ? item.category.toLowerCase().trim() : '';

      const isStudentOnlyItem = itemCondition === 'second-hand' || itemCondition === 'rent' || itemCategory === 'notes' || itemCondition === 'old';

      // অ্যাডমিন হলে সব দেখতে পাবে, স্টুডেন্ট না হলে റെস্ট্রিকশন কাজ করবে
      if (!isAdmin && isStudentOnlyItem && !isUserStudent) {
        return false;
      }

      const matchCondition = activeCondition === 'All' || itemCondition === activeCondition.toLowerCase().trim();
      const dbCourse = item.courseFilter ? item.courseFilter.toLowerCase().trim() : '';
      const filterCourse = activeCourse.toLowerCase().trim();
      const matchCourse = activeCourse === 'All' || dbCourse === filterCourse;
      const matchSearch = !searchQuery || 
                          item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCondition && matchCourse && matchSearch;
    });
  }, [products, activeCondition, activeCourse, user, searchQuery, isAdmin]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/product/${item._id}` as any)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image || 'https://via.placeholder.com/150' }} style={styles.image} />
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>₹{item.price}</Text>
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
        <View style={styles.bottomSection}>
          <View style={styles.badgeContainer}>
            {item.category && <Text style={[styles.badgeText, styles.categoryBadge]}>{item.category}</Text>}
            <Text style={[styles.badgeText, item.condition?.toLowerCase() === 'new' ? styles.newBadge : styles.conditionBadge]}>
              {item.condition}
            </Text>
          </View>
          <View style={styles.sellerRow}>
            <Ionicons name="person-circle" size={16} color="#94A3B8" />
            <Text style={styles.seller} numberOfLines={1}> {item.sellerId?.name?.split(' ')[0] || 'Member'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ... Header and Search code remains same ... */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}> Orbito <Text style={{color: '#4361EE'}}>Market</Text></Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color="#F72585" />
            <Text style={styles.headerSubtitle} numberOfLines={1}> {locationText}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/cart' as any)}>
          <Ionicons name="cart-outline" size={26} color="#1E293B" />
          <View style={styles.cartDot} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search items, notes, shop products..." 
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={{padding: 5}}>
            <Ionicons name="close-circle" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 12, paddingHorizontal: 20}}>
          {conditions.map(cond => (
            <TouchableOpacity 
              key={cond} 
              style={[styles.pillTab, activeCondition === cond && styles.activePillTab]}
              onPress={() => setActiveCondition(cond)}
            >
              <Text style={[styles.pillTabText, activeCondition === cond && styles.activePillTabText]}>{cond}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {courses.map(course => (
            <TouchableOpacity 
              key={course} 
              style={[styles.filterChip, activeCourse === course && styles.activeFilterChip]}
              onPress={() => setActiveCourse(course)}
            >
              <Text style={[styles.filterText, activeCourse === course && styles.activeFilterText]}>{course}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4361EE" style={styles.loader} />
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="basket-outline" size={80} color="#CBD5E1" />
          <Text style={styles.emptyText}>No items found!</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4361EE', '#F72585']} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 🚀 FAB Button (Hidden for Admin) */}
      {!isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/add-product' as any)}>
          <Ionicons name="add" size={32} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FE' }, 
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#ffffff', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, elevation: 8, shadowColor: '#4361EE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, zIndex: 10 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#1E293B', letterSpacing: -0.5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, backgroundColor: '#FFF0F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  headerSubtitle: { fontSize: 12, color: '#F72585', fontWeight: '700' },
  cartBtn: { padding: 10, backgroundColor: '#F8FAFC', borderRadius: 16, position: 'relative' },
  cartDot: { position: 'absolute', top: 8, right: 8, width: 10, height: 10, backgroundColor: '#F72585', borderRadius: 5, borderWidth: 2, borderColor: '#ffffff' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', marginHorizontal: 20, marginTop: 15, paddingHorizontal: 15, height: 50, borderRadius: 16, elevation: 5, shadowColor: '#4361EE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '600' },
  tabContainer: { paddingTop: 15, paddingBottom: 10 },
  pillTab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  activePillTab: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  pillTabText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  activePillTabText: { color: '#ffffff' },
  filterWrapper: { paddingBottom: 15 },
  filterScroll: { paddingHorizontal: 20, gap: 10 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E2E8F0' },
  activeFilterChip: { backgroundColor: '#EEF2FF', borderColor: '#4361EE' },
  filterText: { fontSize: 13, color: '#64748B', fontWeight: '700' },
  activeFilterText: { color: '#4361EE' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 15, paddingBottom: 150 }, 
  row: { justifyContent: 'space-between', paddingHorizontal: 5, marginBottom: 20 },
  card: { width: (width / 2) - 25, backgroundColor: '#ffffff', borderRadius: 24, overflow: 'hidden', elevation: 10, shadowColor: '#4361EE', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 15, borderWidth: 1, borderColor: '#ffffff' },
  imageContainer: { position: 'relative', padding: 8 },
  image: { width: '100%', height: 130, borderRadius: 18, backgroundColor: '#E2E8F0', resizeMode: 'cover' },
  priceTag: { position: 'absolute', bottom: 15, right: 15, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, elevation: 4 },
  priceText: { fontSize: 15, fontWeight: '900', color: '#1E293B' },
  
  // 🚨 Admin Delete Button Style
  adminDeleteBtn: { position: 'absolute', top: 15, right: 15, backgroundColor: '#EF4444', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 5 },

  cardContent: { padding: 12, paddingTop: 4 },
  title: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  bottomSection: { gap: 8 },
  badgeContainer: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badgeText: { fontSize: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontWeight: '800' },
  categoryBadge: { backgroundColor: '#F1F5F9', color: '#475569' },
  conditionBadge: { backgroundColor: '#FFFBEB', color: '#D97706' },
  newBadge: { backgroundColor: '#ECFDF5', color: '#059669' },
  sellerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  seller: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  fab: { position: 'absolute', bottom: 110, right: 25, backgroundColor: '#4361EE', width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', elevation: 12, shadowColor: '#4361EE', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 10, borderWidth: 2, borderColor: '#ffffff', zIndex: 9999 }
});