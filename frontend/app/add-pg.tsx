import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function AddPgScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rent, setRent] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Boys'); // Default value
  const [facilities, setFacilities] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  
  // Image State
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pgTypes = ['Boys', 'Girls', 'Co-ed', 'Flat'];

  // গ্যালারি থেকে ছবি সিলেক্ট করা
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

  // পিজি আপলোড করার লজিক
  const handlePostPg = async () => {
    if (!title || !description || !rent || !location || !contactNumber || !facilities) {
      Alert.alert('Error', 'Please fill all mandatory fields!');
      return;
    }

    if (!imageUri) {
      Alert.alert('Error', 'Please select an image for the property!');
      return;
    }

    setLoading(true);
    try {
      // 1. Image Upload
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        name: 'pg_image.jpg',
        type: 'image/jpeg',
      } as any);

      // আগের প্রোডাক্ট ইমেজের মতোই সেম আপলোড API ব্যবহার করছি
      const uploadRes = await api.post('/auth/test-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedImageUrl = uploadRes.data.imageUrl;

      // Facilities string-কে Array-তে কনভার্ট করা (যেমন: "WiFi, AC" -> ["WiFi", "AC"])
      const facilitiesArray = facilities.split(',').map(item => item.trim()).filter(item => item !== '');

      // 2. Post PG Data
      const payload = {
        title,
        description,
        rent: Number(rent),
        location,
        type,
        facilities: facilitiesArray,
        contactNumber,
        image: uploadedImageUrl
      };

      await api.post('/pgs', payload);
      
      Alert.alert('Success', 'Property listed successfully!', [
        { text: 'OK', onPress: () => router.back() } 
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to post property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* 🌟 Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>List Property</Text>
        <Text style={styles.subtitle}>Add your PG, Hostel or Flat</Text>
      </View>

      <View style={styles.form}>
        {/* 📷 Image Upload */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={40} color="#10B981" style={{marginBottom: 10}} />
              <Text style={styles.imageText}>Tap to Upload Room Photo *</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 📋 Form Fields */}
        <Text style={styles.label}>Property Title *</Text>
        <TextInput style={styles.input} placeholder="e.g. Luxury Boys Hostel" placeholderTextColor="#94a3b8" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Location / Address *</Text>
        <TextInput style={styles.input} placeholder="e.g. Sector 5, Salt Lake" placeholderTextColor="#94a3b8" value={location} onChangeText={setLocation} />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Monthly Rent (₹) *</Text>
            <TextInput style={styles.input} placeholder="e.g. 5000" placeholderTextColor="#94a3b8" value={rent} onChangeText={setRent} keyboardType="numeric" />
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Contact Number *</Text>
            <TextInput style={styles.input} placeholder="e.g. 9876543210" placeholderTextColor="#94a3b8" value={contactNumber} onChangeText={setContactNumber} keyboardType="numeric" />
          </View>
        </View>

        {/* 🏷️ Type Selector */}
        <Text style={styles.label}>Property Type *</Text>
        <View style={styles.typeContainer}>
          {pgTypes.map((t) => (
            <TouchableOpacity 
              key={t} 
              style={[styles.typeChip, type === t && styles.activeTypeChip]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeText, type === t && styles.activeTypeText]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Facilities (Comma separated) *</Text>
        <TextInput style={styles.input} placeholder="e.g. WiFi, AC, 3 Meals, Laundry" placeholderTextColor="#94a3b8" value={facilities} onChangeText={setFacilities} />

        <Text style={styles.label}>Description *</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Rules, timing, and other details..." placeholderTextColor="#94a3b8" value={description} onChangeText={setDescription} multiline numberOfLines={4} />

        {/* 🚀 Submit Button */}
        <TouchableOpacity style={styles.button} onPress={handlePostPg} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>POST PROPERTY</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F4F7FE' },
  
  header: { padding: 20, paddingTop: 60, backgroundColor: '#ffffff', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, elevation: 8, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 20 },
  backBtn: { width: 40, height: 40, backgroundColor: '#F1F5F9', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: '900', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#10B981', marginTop: 4, fontWeight: '700' },
  
  form: { padding: 20 },
  
  imagePicker: { width: '100%', height: 200, backgroundColor: '#ffffff', borderRadius: 20, marginBottom: 25, overflow: 'hidden', borderWidth: 2, borderColor: '#10B981', borderStyle: 'dashed', elevation: 2 },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ECFDF5' },
  imageText: { color: '#059669', fontSize: 15, fontWeight: '700' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#ffffff', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 15, color: '#1E293B', marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4 },
  textArea: { height: 120, textAlignVertical: 'top' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfWidth: { width: '48%' },
  
  typeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  typeChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  activeTypeChip: { backgroundColor: '#10B981', borderColor: '#10B981' },
  typeText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  activeTypeText: { color: '#ffffff' },

  button: { backgroundColor: '#10B981', padding: 18, borderRadius: 16, alignItems: 'center', elevation: 8, shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, marginTop: 10, marginBottom: 40 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});