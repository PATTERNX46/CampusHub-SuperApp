import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import api from '../services/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterNormalScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams(); 
  
  const [form, setForm] = useState({ 
    name: '', phone: '', email: '', age: '', gender: '', password: '', isStudent: false, roles: [role || 'user'] 
  });

  const [otpMethod, setOtpMethod] = useState('phone'); 
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.name || !form.phone || !form.email || !form.password || !form.age || !form.gender) {
      return Alert.alert('Error', 'Please fill all the fields');
    }

    setIsLoading(true);

    try {
      // 🚀 ব্যাকএন্ডে রিকোয়েস্ট পাঠানো হচ্ছে। ব্যাকএন্ড নিজেই Twilio বা Brevo দিয়ে OTP পাঠাবে[cite: 4]
      const res = await api.post('/auth/register', { ...form, otpMethod });
      
      setIsLoading(false);
      
      Alert.alert(
        'Success', 
        `OTP sent successfully to your ${otpMethod === 'phone' ? 'Phone' : 'Email'}!`, 
        [
          { text: 'OK', onPress: () => router.push({
              pathname: '/(auth)/verify-otp',
              params: { userId: res.data.userId, method: otpMethod }
            }) 
          }
        ]
      );

    } catch (error: any) {
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
        <View style={styles.iconBox}><Ionicons name="person-add" size={35} color="#10B981" /></View>
        <Text style={styles.title}>Join as {role?.toString().toUpperCase()}</Text>
        <Text style={styles.subtitle}>Enter your details below</Text>

        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Full Name" onChangeText={t => setForm({...form, name: t})} />
          <TextInput style={styles.input} placeholder="Email" onChangeText={t => setForm({...form, email: t})} autoCapitalize="none" keyboardType="email-address" />
          
          <View style={styles.phoneBox}>
            <Text style={styles.prefix}>+91</Text>
            <TextInput style={[styles.input, {flex: 1, marginBottom: 0, borderWidth: 0}]} placeholder="Phone Number" onChangeText={t => setForm({...form, phone: t})} keyboardType="numeric" maxLength={10} />
          </View>
          
          <View style={{flexDirection: 'row', gap: 10}}>
            <TextInput style={[styles.input, {flex: 1}]} placeholder="Age" onChangeText={t => setForm({...form, age: t})} keyboardType="numeric" />
            <TextInput style={[styles.input, {flex: 1}]} placeholder="Gender (M/F)" onChangeText={t => setForm({...form, gender: t})} />
          </View>
          <TextInput style={styles.input} placeholder="Password" onChangeText={t => setForm({...form, password: t})} secureTextEntry />
        </View>

        <View style={styles.methodContainer}>
          <Text style={styles.methodLabel}>Send OTP via:</Text>
          <View style={styles.radioRow}>
            <TouchableOpacity onPress={() => setOtpMethod('phone')} style={styles.radioBtn}>
              <View style={otpMethod === 'phone' ? styles.radioSelected : styles.radioUnselected} />
              <Text>Phone</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setOtpMethod('email')} style={styles.radioBtn}>
              <View style={otpMethod === 'email' ? styles.radioSelected : styles.radioUnselected} />
              <Text>Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[styles.btn, isLoading && { opacity: 0.6 }]} onPress={handleRegister} disabled={isLoading}>
          <Text style={styles.btnText}>{isLoading ? "Please Wait..." : "Register Now"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7FE', paddingVertical: 50 },
  backBtn: { position: 'absolute', top: 40, left: 20, width: 40, height: 40, backgroundColor: '#ffffff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 5, zIndex: 10 },
  card: { width: '85%', backgroundColor: '#ffffff', borderRadius: 24, padding: 30, alignItems: 'center', elevation: 12 },
  iconBox: { width: 70, height: 70, backgroundColor: '#ECFDF5', borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 5 },
  subtitle: { fontSize: 13, color: '#64748B', marginBottom: 25, fontWeight: '600' },
  inputContainer: { width: '100%', gap: 12, marginBottom: 10 },
  input: { backgroundColor: '#F8FAFC', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 15, color: '#1E293B' },
  phoneBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingLeft: 15, marginBottom: 5 },
  prefix: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginRight: 5 },
  methodContainer: { width: '100%', marginVertical: 15 },
  methodLabel: { fontSize: 14, color: '#64748B', marginBottom: 8 },
  radioRow: { flexDirection: 'row', gap: 20 },
  radioBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  radioSelected: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#10B981' },
  radioUnselected: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#CBD5E1' },
  btn: { width: '100%', backgroundColor: '#10B981', padding: 16, borderRadius: 12, alignItems: 'center', elevation: 5 },
  btnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});