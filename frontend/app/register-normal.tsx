import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import api from '../services/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterNormalScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams(); // Role Selection পেজ থেকে রোলটা এখানে আসবে
  
  const [form, setForm] = useState({ 
    name: '', phone: '', email: '', age: '', gender: '', password: '', isStudent: false, roles: [role || 'user'] 
  });

  // 🚀 [NEW] Loading স্টেট অ্যাড করা হলো (এটার জন্যই লাল দাগ আসছিল)
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.name || !form.phone || !form.email || !form.password || !form.age || !form.gender) {
      return Alert.alert('Error', 'Please fill all the fields');
    }

    // 🚀 [NEW] API কলের আগে লোডিং শুরু হচ্ছে
    setIsLoading(true);

    try {
      const res = await api.post('/auth/register', form);
      
      // 🚀 [NEW] API কল সাকসেস হলে লোডিং বন্ধ হচ্ছে
      setIsLoading(false);

      // 👇 এখানেও ওটিপি পেজে পাঠানোর লজিক (আগের মতোই আছে)
      Alert.alert('Success', 'Account Registered! Verify your OTP.', [
        { 
          text: 'OK', 
          onPress: () => router.push({
            pathname: '/(auth)/verify-otp',
            params: { userId: res.data.userId }
          }) 
        }
      ]);
    } catch (error: any) {
      // 🚀 [NEW] এরর খেলেও লোডিং বন্ধ করে দেওয়া হচ্ছে যাতে বাটন আটকে না থাকে
      setIsLoading(false);
      Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1E293B" />
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.iconBox}>
          <Ionicons name="person-add" size={35} color="#10B981" />
        </View>
        <Text style={styles.title}>Join as {role?.toString().toUpperCase()}</Text>
        <Text style={styles.subtitle}>Enter your details below</Text>

        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Full Name" onChangeText={t => setForm({...form, name: t})} />
          <TextInput style={styles.input} placeholder="Email" onChangeText={t => setForm({...form, email: t})} autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={styles.input} placeholder="Phone Number" onChangeText={t => setForm({...form, phone: t})} keyboardType="numeric" />
          
          {/* Age & Gender in one row */}
          <View style={{flexDirection: 'row', gap: 10}}>
            <TextInput style={[styles.input, {flex: 1}]} placeholder="Age" onChangeText={t => setForm({...form, age: t})} keyboardType="numeric" />
            <TextInput style={[styles.input, {flex: 1}]} placeholder="Gender (M/F)" onChangeText={t => setForm({...form, gender: t})} />
          </View>

          <TextInput style={styles.input} placeholder="Password" onChangeText={t => setForm({...form, password: t})} secureTextEntry />
        </View>

        {/* 🚀 [NEW] বাটনের কোড আপডেট করা হলো */}
        <TouchableOpacity 
          style={[styles.btn, isLoading && { opacity: 0.6 }]} 
          onPress={handleRegister}
          disabled={isLoading} // 👈 এই লাইনটাই ডাবল-ক্লিক ব্লক করবে
        >
          <Text style={styles.btnText}>
            {isLoading ? "Please Wait..." : "Register Now"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7FE', paddingVertical: 50 },
  backBtn: { position: 'absolute', top: 40, left: 20, width: 40, height: 40, backgroundColor: '#ffffff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 5, zIndex: 10 },
  card: { width: '85%', backgroundColor: '#ffffff', borderRadius: 24, padding: 30, alignItems: 'center', elevation: 12, shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20 },
  iconBox: { width: 70, height: 70, backgroundColor: '#ECFDF5', borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 5 },
  subtitle: { fontSize: 13, color: '#64748B', marginBottom: 25, fontWeight: '600' },
  inputContainer: { width: '100%', gap: 12, marginBottom: 20 },
  input: { backgroundColor: '#F8FAFC', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 15, color: '#1E293B' },
  btn: { width: '100%', backgroundColor: '#10B981', padding: 16, borderRadius: 12, alignItems: 'center', elevation: 5, shadowColor: '#10B981', shadowOpacity: 0.4, shadowRadius: 8 },
  btnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});