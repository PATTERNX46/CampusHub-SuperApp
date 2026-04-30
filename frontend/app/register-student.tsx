import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import api from '../services/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterStudentScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ 
    name: '', phone: '', email: '', password: '', isStudent: true, roles: ['student'] 
  });
  const [otpMethod, setOtpMethod] = useState('phone');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.name || !form.phone || !form.email || !form.password) {
      return Alert.alert('Error', 'Please fill all the fields');
    }

    setIsLoading(true);

    try {
      // 🚀 ব্যাকএন্ডে কল করা হচ্ছে[cite: 6]
      const res = await api.post('/auth/register', { ...form, otpMethod });
      
      setIsLoading(false);
      
      Alert.alert(
        'Success', 
        `OTP sent to your ${otpMethod === 'phone' ? 'Phone' : 'Institute Email'}!`, 
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
        <View style={styles.iconBox}><Ionicons name="school" size={40} color="#4361EE" /></View>
        <Text style={styles.title}>Student Portal</Text>
        <Text style={styles.subtitle}>Strictly for verified students only</Text>

        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Full Name" onChangeText={t => setForm({...form, name: t})} />
          <TextInput style={styles.input} placeholder="Institute Email" onChangeText={t => setForm({...form, email: t})} autoCapitalize="none" keyboardType="email-address" />
          
          <View style={styles.phoneBox}>
            <Text style={styles.prefix}>+91</Text>
            <TextInput style={[styles.input, {flex: 1, marginBottom: 0, borderWidth: 0}]} placeholder="Phone Number" onChangeText={t => setForm({...form, phone: t})} keyboardType="numeric" maxLength={10} />
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
          <Text style={styles.btnText}>{isLoading ? "Please Wait..." : "Verify & Register"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7FE', paddingVertical: 40 },
  backBtn: { position: 'absolute', top: 40, left: 20, width: 40, height: 40, backgroundColor: '#ffffff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  card: { width: '85%', backgroundColor: '#ffffff', borderRadius: 24, padding: 30, alignItems: 'center', elevation: 12 },
  iconBox: { width: 80, height: 80, backgroundColor: '#EEF2FF', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginBottom: 5 },
  subtitle: { fontSize: 12, color: '#EF4444', marginBottom: 25, fontWeight: '700' },
  inputContainer: { width: '100%', gap: 12, marginBottom: 10 },
  input: { backgroundColor: '#F8FAFC', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 15, color: '#1E293B' },
  phoneBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingLeft: 15, marginBottom: 5 },
  prefix: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginRight: 5 },
  methodContainer: { width: '100%', marginVertical: 15 },
  methodLabel: { fontSize: 14, color: '#64748B', marginBottom: 8 },
  radioRow: { flexDirection: 'row', gap: 20 },
  radioBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  radioSelected: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#4361EE' },
  radioUnselected: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#CBD5E1' },
  btn: { width: '100%', backgroundColor: '#4361EE', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }
});