import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function AddTutorScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [subjects, setSubjects] = useState('');
  const [mode, setMode] = useState('Online');
  const [experience, setExperience] = useState('');
  const [pricing, setPricing] = useState('');
  const [pricingType, setPricingType] = useState('Per Month');
  const [availability, setAvailability] = useState('');
  
  const [imageUri, setImageUri] = useState<string | null>(null);

  const modes = ['Online', 'Offline', 'Both'];
  const pricingTypes = ['Per Hour', 'Per Month', 'Per Course'];

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCreateProfile = async () => {
    if (!name || !subjects || !experience || !pricing || !availability) {
      Alert.alert('Error', 'Please fill all mandatory fields!');
      return;
    }

    setLoading(true);
    try {
      let uploadedImageUrl = null;
      if (imageUri) {
        const formData = new FormData();
        formData.append('image', {
          uri: imageUri,
          name: 'tutor_profile.jpg',
          type: 'image/jpeg',
        } as any);

        const uploadRes = await api.post('/auth/test-upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedImageUrl = uploadRes.data.imageUrl;
      }

      const subjectsArray = subjects.split(',').map(s => s.trim()).filter(s => s !== '');

      const payload = {
        name,
        subjects: subjectsArray,
        mode,
        experience,
        pricing: Number(pricing),
        pricingType,
        availability,
        image: uploadedImageUrl || 'https://via.placeholder.com/150'
      };

      await api.post('/tutors', payload);
      
      Alert.alert('Success', 'Teaching Profile published!', [
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Tutor Profile</Text>
        <Text style={styles.subtitle}>Share your knowledge with students</Text>
      </View>

      <View style={styles.form}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="school" size={40} color="#8B5CF6" />
              <Text style={styles.imageText}>Upload Profile Picture</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Full Name *</Text>
        <TextInput style={styles.input} placeholder="e.g. Prof. Sandeep Das" value={name} onChangeText={setName} />

        <Text style={styles.label}>Subjects (Comma separated) *</Text>
        <TextInput style={styles.input} placeholder="e.g. Mathematics, Physics, React" value={subjects} onChangeText={setSubjects} />

        <Text style={styles.label}>Teaching Mode *</Text>
        <View style={styles.chipContainer}>
          {modes.map((m) => (
            <TouchableOpacity key={m} style={[styles.chip, mode === m && styles.activeChip]} onPress={() => setMode(m)}>
              <Text style={[styles.chipText, mode === m && styles.activeChipText]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Fees (₹) *</Text>
            <TextInput style={styles.input} placeholder="500" value={pricing} onChangeText={setPricing} keyboardType="numeric" />
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Billing *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
               {pricingTypes.map((pt) => (
                <TouchableOpacity key={pt} style={[styles.smallChip, pricingType === pt && styles.activeChip]} onPress={() => setPricingType(pt)}>
                  <Text style={[styles.smallChipText, pricingType === pt && styles.activeChipText]}>{pt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <Text style={styles.label}>Experience & Availability *</Text>
        <TextInput style={styles.input} placeholder="e.g. 4 Years Exp | Mon-Fri 7PM" value={availability} onChangeText={setAvailability} />

        <TouchableOpacity style={styles.button} onPress={handleCreateProfile} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>PUBLISH PROFILE</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F4F7FE' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#ffffff', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, elevation: 8, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 20 },
  backBtn: { width: 40, height: 40, backgroundColor: '#F5F3FF', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: '900', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#8B5CF6', marginTop: 4, fontWeight: '700' },
  form: { padding: 20 },
  imagePicker: { width: 100, height: 100, alignSelf: 'center', backgroundColor: '#ffffff', borderRadius: 50, marginBottom: 25, overflow: 'hidden', borderWidth: 2, borderColor: '#8B5CF6', borderStyle: 'dashed' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F3FF' },
  imageText: { color: '#8B5CF6', fontSize: 10, fontWeight: '800', textAlign: 'center', padding: 5 },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8 },
  input: { backgroundColor: '#ffffff', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  chipContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  chip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E2E8F0' },
  activeChip: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
  chipText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  activeChipText: { color: '#ffffff' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfWidth: { width: '48%' },
  smallChip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 5 },
  smallChipText: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  button: { backgroundColor: '#8B5CF6', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '900' }
});