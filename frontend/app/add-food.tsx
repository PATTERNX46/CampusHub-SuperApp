import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AddFoodScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // 🛡️ অ্যাডমিন চেক
  const isAdmin = user?.role === 'admin' || (Array.isArray(user?.roles) && user.roles.includes('admin'));

  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<'Home' | 'Restaurant'>('Home');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('Veg'); 
  const [mealType, setMealType] = useState('Lunch'); 
  const [preOrderTime, setPreOrderTime] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [image, setImage] = useState('');

 const handleAddFood = async () => {
    if (!title || !price || !sellerPhone) return Alert.alert('Error', 'Fill required fields!');
    setLoading(true);
    try {
      const payload = {
        title,
        price: Number(price),
        type,
        mealType,
        preOrderTime: category === 'Restaurant' ? '30-45 mins' : preOrderTime,
        deliveryArea: category === 'Restaurant' ? 'Local' : deliveryArea,
        sellerPhone,
        image: image || 'https://via.placeholder.com/300',
        // 🛡️ [FIXED] রেস্টুরেন্টের ক্ষেত্রে সেলার নেম 'Admin' হবে, খাবারের নাম নয়
        sellerName: category === 'Restaurant' ? 'Admin' : (user?.name || 'Home Chef'), 
        sellerId: user?._id,
        foodSource: category
      };
      await api.post('/foods', payload);
      Alert.alert('Success', 'Listing added!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add food.');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add <Text style={{color: '#F97316'}}>Food Listing</Text></Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 🚨 অ্যাডমিনদের জন্য ক্যাটাগরি সুইচ (Home vs Restaurant) */}
        {isAdmin && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Tab Category</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity style={[styles.toggleBtn, category === 'Home' && styles.activeTab]} onPress={() => setCategory('Home')}>
                <Text style={[styles.toggleText, category === 'Home' && {color: '#ffffff'}]}>Home Food</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toggleBtn, category === 'Restaurant' && styles.activeTab]} onPress={() => setCategory('Restaurant')}>
                <Text style={[styles.toggleText, category === 'Restaurant' && {color: '#ffffff'}]}>Restaurant</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{category === 'Home' ? 'Dish Name' : 'Restaurant Name'}</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="restaurant-outline" size={20} color="#94A3B8" />
            <TextInput style={styles.input} placeholder="e.g. Chicken Biryani" value={title} onChangeText={setTitle} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Price (₹)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="cash-outline" size={20} color="#94A3B8" />
            <TextInput style={styles.input} placeholder="e.g. 120" keyboardType="numeric" value={price} onChangeText={setPrice} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>WhatsApp Number</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="logo-whatsapp" size={20} color="#10B981" />
            <TextInput style={styles.input} placeholder="10-digit number" keyboardType="phone-pad" value={sellerPhone} onChangeText={setSellerPhone} />
          </View>
        </View>

        {category === 'Home' && (
          <View style={styles.rowGroup}>
            <View style={{flex: 1, marginRight: 10}}>
               <Text style={styles.label}>Pre-order Time</Text>
               <TextInput style={styles.smallInput} placeholder="e.g. 1 hour" value={preOrderTime} onChangeText={setPreOrderTime} />
            </View>
            <View style={{flex: 1}}>
               <Text style={styles.label}>Delivery Area</Text>
               <TextInput style={styles.smallInput} placeholder="e.g. Gate 1" value={deliveryArea} onChangeText={setDeliveryArea} />
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Food Image Link</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="image-outline" size={20} color="#94A3B8" />
            <TextInput style={styles.input} placeholder="Paste URL here" value={image} onChangeText={setImage} />
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleAddFood}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.submitBtnText}>Confirm & Post Listing 🚀</Text>}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#ffffff', elevation: 5 },
  backBtn: { width: 40, height: 40, backgroundColor: '#F1F5F9', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B' },
  scrollContent: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 15, height: 55 },
  input: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '600' },
  smallInput: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 15, height: 55, fontWeight: '600' },
  rowGroup: { flexDirection: 'row', marginBottom: 20 },
  toggleRow: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 14, overflow: 'hidden', height: 50 },
  toggleBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  activeTab: { backgroundColor: '#F97316' },
  toggleText: { fontSize: 14, fontWeight: '800', color: '#64748B' },
  submitBtn: { backgroundColor: '#F97316', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 10, elevation: 5 },
  submitBtnText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});