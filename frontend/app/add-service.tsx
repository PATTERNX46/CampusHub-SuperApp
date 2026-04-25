import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function AddServiceScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Maid');
  const [experience, setExperience] = useState('');
  const [pricing, setPricing] = useState('');
  const [pricingType, setPricingType] = useState('Per Visit');
  const [availability, setAvailability] = useState('');
  
  // Image State
  const [imageUri, setImageUri] = useState<string | null>(null);

  const categories = ['Maid', 'Plumber', 'Electrician', 'Cook', 'Other'];
  const pricingTypes = ['Per Hour', 'Per Visit', 'Per Month'];

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1], // Square image for profile avatar
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCreateProfile = async () => {
    if (!name || !experience || !pricing || !availability) {
      Alert.alert('Error', 'Please fill all mandatory fields!');
      return;
    }

    setLoading(true);
    try {
      let uploadedImageUrl = null;

      // Image upload (Optional but recommended for services)
      if (imageUri) {
        const formData = new FormData();
        formData.append('image', {
          uri: imageUri,
          name: 'service_image.jpg',
          type: 'image/jpeg',
        } as any);

        const uploadRes = await api.post('/auth/test-upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedImageUrl = uploadRes.data.imageUrl;
      }

      const payload = {
        name,
        category,
        experience,
        pricing: Number(pricing),
        pricingType,
        availability,
        image: uploadedImageUrl || 'https://via.placeholder.com/150' // Fallback image
      };

      await api.post('/services', payload);
      
      Alert.alert('Success', 'Service Profile created successfully!', [
        { text: 'OK', onPress: () => router.back() } 
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create profile');
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
        <Text style={styles.title}>Create Profile</Text>
        <Text style={styles.subtitle}>Offer your skills to the campus</Text>
      </View>

      <View style={styles.form}>
        {/* 📷 Profile Image Upload */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="person-circle" size={50} color="#F59E0B" style={{marginBottom: 5}} />
              <Text style={styles.imageText}>Upload Profile Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 📋 Form Fields */}
        <Text style={styles.label}>Professional Title / Name *</Text>
        <TextInput style={styles.input} placeholder="e.g. Expert Plumber (Ramesh)" placeholderTextColor="#94a3b8" value={name} onChangeText={setName} />

        <Text style={styles.label}>Category *</Text>
        <View style={styles.chipContainer}>
          {categories.map((c) => (
            <TouchableOpacity 
              key={c} 
              style={[styles.chip, category === c && styles.activeChip]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.chipText, category === c && styles.activeChipText]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Experience *</Text>
        <TextInput style={styles.input} placeholder="e.g. 5 Years" placeholderTextColor="#94a3b8" value={experience} onChangeText={setExperience} />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Pricing (₹) *</Text>
            <TextInput style={styles.input} placeholder="e.g. 300" placeholderTextColor="#94a3b8" value={pricing} onChangeText={setPricing} keyboardType="numeric" />
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Rate Type *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 8, paddingVertical: 5}}>
              {pricingTypes.map((pt) => (
                <TouchableOpacity 
                  key={pt} 
                  style={[styles.smallChip, pricingType === pt && styles.activeChip]}
                  onPress={() => setPricingType(pt)}
                >
                  <Text style={[styles.smallChipText, pricingType === pt && styles.activeChipText]}>{pt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <Text style={styles.label}>Working Hours / Availability *</Text>
        <TextInput style={styles.input} placeholder="e.g. Mon-Sat (9 AM - 6 PM)" placeholderTextColor="#94a3b8" value={availability} onChangeText={setAvailability} />

        {/* 🚀 Submit Button */}
        <TouchableOpacity style={styles.button} onPress={handleCreateProfile} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>PUBLISH PROFILE</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F4F7FE' },
  
  header: { padding: 20, paddingTop: 60, backgroundColor: '#ffffff', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, elevation: 8, shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 20 },
  backBtn: { width: 40, height: 40, backgroundColor: '#FFFBEB', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: '900', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#F59E0B', marginTop: 4, fontWeight: '700' },
  
  form: { padding: 20 },
  
  imagePicker: { width: 120, height: 120, alignSelf: 'center', backgroundColor: '#ffffff', borderRadius: 60, marginBottom: 25, overflow: 'hidden', borderWidth: 2, borderColor: '#F59E0B', borderStyle: 'dashed', elevation: 4 },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFBEB', padding: 10 },
  imageText: { color: '#D97706', fontSize: 10, fontWeight: '800', textAlign: 'center' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#ffffff', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 15, color: '#1E293B', marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  halfWidth: { width: '48%' },
  
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  activeChip: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  chipText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  activeChipText: { color: '#ffffff' },

  smallChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E2E8F0' },
  smallChipText: { fontSize: 11, fontWeight: '700', color: '#64748B' },

  button: { backgroundColor: '#F59E0B', padding: 18, borderRadius: 16, alignItems: 'center', elevation: 8, shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, marginTop: 10, marginBottom: 40 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});