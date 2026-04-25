import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons'; // 👈 ব্যাক বাটনের জন্য
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AddProductScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePostProduct = async () => {
    if (!title || !description || !price || !category || !condition) {
      Alert.alert('Error', 'Please fill all mandatory fields!');
      return;
    }

    // 🛡️ ROLE BASED POSTING RULES
    const userRole = Array.isArray(user?.roles) ? user.roles[0] : (user?.role || 'user');

    if (userRole === 'shop' && condition !== 'New') {
      return Alert.alert('Restricted', 'Shop Owners can only sell NEW products. Second-hand or Rent is not allowed.');
    }

    if (userRole !== 'student' && (condition === 'Second-Hand' || condition === 'Rent')) {
      return Alert.alert('Access Denied', 'Only Verified Students can sell used or rental items.');
    }

    if (!imageUri) {
      Alert.alert('Error', 'Please select an image for the product!');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        name: 'product_image.jpg',
        type: 'image/jpeg',
      } as any);

      const uploadRes = await api.post('/auth/test-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedImageUrl = uploadRes.data.imageUrl;

      const payload = {
        title,
        description,
        price: Number(price),
        category,
        condition,
        courseFilter,
        image: uploadedImageUrl
      };

      await api.post('/products', payload);
      
      Alert.alert('Success', 'Product posted successfully!', [
        { text: 'OK', onPress: () => router.back() } 
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to post product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* 🌟 Updated Header with Top Submit Button */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Sell an Item</Text>
            <Text style={styles.subtitle}>Campus Marketplace</Text>
          </View>
        </View>

        {/* 🚀 New Unique Top 'POST' Button */}
        <TouchableOpacity style={styles.topSubmitBtn} onPress={handlePostProduct} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.topSubmitText}>POST</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.cameraIcon}>📸</Text>
                <Text style={styles.imageText}>Tap to Upload Photo *</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Product Title *</Text>
          <TextInput style={styles.input} placeholder="e.g. Laptop Stand" placeholderTextColor="#94a3b8" value={title} onChangeText={setTitle} />

          <Text style={styles.label}>Description *</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Describe the item..." placeholderTextColor="#94a3b8" value={description} onChangeText={setDescription} multiline numberOfLines={4} />

          <Text style={styles.label}>Price (₹) *</Text>
          <TextInput style={styles.input} placeholder="e.g. 500" placeholderTextColor="#94a3b8" value={price} onChangeText={setPrice} keyboardType="numeric" />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Category *</Text>
              <TextInput style={styles.input} placeholder="Tech, Books..." placeholderTextColor="#94a3b8" value={category} onChangeText={setCategory} />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Condition *</Text>
              <TextInput style={styles.input} placeholder="New/Second-Hand" placeholderTextColor="#94a3b8" value={condition} onChangeText={setCondition} />
            </View>
          </View>

          <Text style={styles.label}>Course Filter (Optional)</Text>
          <TextInput style={styles.input} placeholder="e.g. BCA, BTech" placeholderTextColor="#94a3b8" value={courseFilter} onChangeText={setCourseFilter} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  
  // 🚀 Updated Header Style
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    paddingTop: 50, 
    backgroundColor: '#ffffff', 
    elevation: 4,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 10
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, backgroundColor: '#F1F5F9', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  title: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  subtitle: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '600' },

  // 🚀 New Top Submit Button Style
  topSubmitBtn: {
    backgroundColor: '#4361EE',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#4361EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  topSubmitText: { color: '#ffffff', fontSize: 13, fontWeight: '900', letterSpacing: 1 },

  container: { flex: 1, padding: 20 },
  form: { backgroundColor: '#ffffff', padding: 20, borderRadius: 15, elevation: 2, marginBottom: 20 },
  imagePicker: { width: '100%', height: 180, backgroundColor: '#F1F5F9', borderRadius: 15, marginBottom: 25, overflow: 'hidden', borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraIcon: { fontSize: 40, marginBottom: 10 },
  imageText: { color: '#64748B', fontSize: 16, fontWeight: '600' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: { backgroundColor: '#F1F5F9', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 16, color: '#1E293B', marginBottom: 20 },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfWidth: { width: '48%' },
});