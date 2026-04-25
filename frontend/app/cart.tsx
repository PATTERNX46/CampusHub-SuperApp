import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api'; // 👈 API Import করা হলো

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // 👈 Loading স্টেট

  useFocusEffect(
    useCallback(() => {
      const loadCart = async () => {
        const stored = await AsyncStorage.getItem('cartItems');
        if (stored) setCartItems(JSON.parse(stored));
      };
      loadCart();
    }, [])
  );

  const clearCart = async () => {
    await AsyncStorage.removeItem('cartItems');
    setCartItems([]);
  };

  const removeItem = async (id: string) => {
    const updated = cartItems.filter(item => item._id !== id);
    setCartItems(updated);
    await AsyncStorage.setItem('cartItems', JSON.stringify(updated));
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price, 0);

  // 👇 Checkout Payment Logic
  const handleCheckout = async () => {
    if (totalAmount === 0) return;
    
    try {
      setLoading(true);
      const orderRes = await api.post('/payments/order', { amount: totalAmount });
      const orderData = orderRes.data;

      Alert.alert(
        'Payment Gateway', 
        `Order ID: ${orderData.id}\nTotal Amount: ₹${totalAmount}\n\nProceed with test payment?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Success', 
            onPress: async () => {
              await clearCart(); // পেমেন্ট হলে কার্ট ফাঁকা করে দেবে
              Alert.alert('Success', 'Payment completed inside Test Mode!');
              router.push('/(tabs)/marketplace'); // মার্কেটপ্লেসে ফিরে যাবে
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Payment initialization failed.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
        <Text style={styles.condition}>{item.condition}</Text>
      </View>
      <TouchableOpacity onPress={() => removeItem(item._id)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* 👇 Back Button Fix */}
        <TouchableOpacity onPress={() => router.push('/(tabs)/marketplace')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#CBD5E1" />
          <Text style={styles.emptyText}>Your cart is empty!</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.totalLabel}>Total Price</Text>
              <Text style={styles.totalPrice}>₹{totalAmount}</Text>
            </View>
            {/* 👇 Checkout Button Update */}
            <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} disabled={loading}>
              {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.checkoutText}>Checkout</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  clearText: { color: '#EF4444', fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#64748B', marginTop: 10, fontWeight: 'bold' },
  card: { flexDirection: 'row', backgroundColor: '#ffffff', padding: 10, borderRadius: 12, marginBottom: 15, elevation: 2, alignItems: 'center' },
  image: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#E2E8F0' },
  details: { flex: 1, marginLeft: 15 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  price: { fontSize: 16, fontWeight: '800', color: '#4361EE', marginTop: 4 },
  condition: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  deleteBtn: { padding: 10 },
  bottomBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: 20, borderTopWidth: 1, borderColor: '#E2E8F0', paddingBottom: 30 },
  totalLabel: { fontSize: 14, color: '#64748B' },
  totalPrice: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  checkoutBtn: { backgroundColor: '#4361EE', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', minWidth: 120 },
  checkoutText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }
});