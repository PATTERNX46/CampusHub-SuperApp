import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 👈 NEW IMPORT
import api from '../../services/api'; 

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get('/products');
        const foundItem = res.data.find((p: any) => p._id === id);
        setProduct(foundItem);
      } catch (error) {
        Alert.alert('Error', 'Could not load product details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleApplyPromo = () => {
    if (!promoCode) return;
    Alert.alert('Promo Applied!', 'You got a 10% discount on this purchase.');
  };

  // 👇 UPDATE: আসল Cart Logic (লোকাল স্টোরেজে সেভ হবে)
  const handleAddToCart = async () => {
    try {
      const existingCart = await AsyncStorage.getItem('cartItems');
      let cart = existingCart ? JSON.parse(existingCart) : [];
      
      const isExist = cart.find((item: any) => item._id === product._id);
      if(isExist) {
        Alert.alert('Notice', 'This item is already in your cart!');
        return;
      }

      cart.push(product);
      await AsyncStorage.setItem('cartItems', JSON.stringify(cart));
      Alert.alert('Success', `${product?.title} has been added to your cart! 🛒`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add to cart');
    }
  };

  const handlePurchase = async (type: string) => {
    try {
      setLoading(true);
      const orderRes = await api.post('/payments/order', { amount: product.price });
      const orderData = orderRes.data;

      Alert.alert(
        'Payment Gateway', 
        `Order ID: ${orderData.id}\nAmount: ₹${product.price}\n\nProceed with test payment?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Success', 
            onPress: async () => {
              Alert.alert('Success', 'Payment completed inside Test Mode!');
            }
          }
        ]
      );
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Payment initialization failed. Is your backend running?');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#4361EE" style={{ flex: 1, justifyContent: 'center' }} />;
  if (!product) return <View style={styles.center}><Text>Product not found!</Text></View>;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        <View style={styles.imageContainer}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/(tabs)/marketplace')}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Image source={{ uri: product.image || 'https://via.placeholder.com/400' }} style={styles.image} />
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{product.title}</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{product.condition}</Text></View>
          </View>
          
          <Text style={styles.price}>₹{product.price}</Text>
          
          <View style={styles.emiBanner}>
            <Ionicons name="card-outline" size={20} color="#D97706" />
            <Text style={styles.emiText}>EMI available starting from ₹{Math.round(product.price / 3)}/mo.</Text>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.sellerCard}>
            <Ionicons name="person-circle-outline" size={40} color="#94A3B8" />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{product.sellerId?.name || 'Verified Seller'}</Text>
              <Text style={styles.sellerCourse}>Course: {product.courseFilter || 'N/A'}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Offers & Rewards</Text>
          <View style={styles.promoContainer}>
            <Ionicons name="ticket-outline" size={20} color="#4361EE" style={styles.promoIcon} />
            <TextInput 
              style={styles.promoInput} 
              placeholder="Enter Redeem Code" 
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyPromo}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        
        {/* 🛒 Add to Cart Button */}
        <TouchableOpacity style={styles.cartIconBtn} onPress={handleAddToCart}>
          <Ionicons name="cart-outline" size={26} color="#4361EE" />
        </TouchableOpacity>

        {/* Conditional Rent Button */}
        {product.condition === 'Rent' && (
          <TouchableOpacity style={[styles.actionBtn, styles.rentBtn]} onPress={() => handlePurchase('Rent')}>
            <Text style={[styles.btnText, {color: '#4361EE'}]}>Rent</Text>
          </TouchableOpacity>
        )}
        
        {/* Buy Now Button */}
        <TouchableOpacity style={[styles.actionBtn, styles.buyBtn]} onPress={() => handlePurchase('Purchase')}>
          <Text style={styles.btnText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { width: '100%', height: 350, backgroundColor: '#F1F5F9', position: 'relative' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.8)', padding: 10, borderRadius: 20 },
  detailsContainer: { padding: 20, marginTop: -20, backgroundColor: '#ffffff', borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B', flex: 1, marginRight: 10 },
  badge: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { color: '#D97706', fontWeight: 'bold', fontSize: 12 },
  price: { fontSize: 28, fontWeight: '900', color: '#4361EE', marginBottom: 15 },
  emiBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#FDE68A', marginBottom: 20 },
  emiText: { color: '#B45309', fontSize: 13, fontWeight: '600', marginLeft: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginTop: 10, marginBottom: 10 },
  description: { fontSize: 15, color: '#475569', lineHeight: 24, marginBottom: 20 },
  sellerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  sellerInfo: { marginLeft: 15 },
  sellerName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  sellerCourse: { fontSize: 13, color: '#64748B', marginTop: 2 },
  promoContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 15, height: 55 },
  promoIcon: { marginRight: 10 },
  promoInput: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1E293B' },
  applyBtn: { padding: 8 },
  applyBtnText: { color: '#4361EE', fontWeight: 'bold', fontSize: 15 },
  bottomBar: { position: 'absolute', bottom: 0, width: '100%', flexDirection: 'row', backgroundColor: '#ffffff', padding: 15, paddingBottom: 30, borderTopWidth: 1, borderColor: '#E2E8F0', gap: 10 },
  cartIconBtn: { width: 56, height: 56, borderRadius: 12, borderWidth: 1, borderColor: '#C7D2FE', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF2FF' },
  actionBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rentBtn: { backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE' },
  buyBtn: { backgroundColor: '#4361EE', shadowColor: '#4361EE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }
});