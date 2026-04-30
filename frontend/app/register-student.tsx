import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import api from '../services/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth'; // 🚀 [NEW] Firebase ইমপোর্ট করা হলো

export default function RegisterStudentScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ 
    name: '', phone: '', email: '', password: '', isStudent: true, roles: ['student'] 
  });

  const [isLoading, setIsLoading] = useState(false); // 🚀 [NEW] Loading স্টেট অ্যাড করা হলো

 const handleRegister = async () => {
    if (!form.name || !form.phone || !form.email || !form.password) {
      return Alert.alert('Error', 'Please fill all the fields');
    }

    setIsLoading(true);

    try {
      // 🚀 [NEW] ১. ব্যাকএন্ডে কল
      const res = await api.post('/auth/register', form);
      
      // 🚀 [NEW] ২. Firebase দিয়ে ফোনে OTP পাঠানো
      try {
        const formattedPhone = form.phone.startsWith('+91') ? form.phone : `+91${form.phone}`;
        const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
        
        setIsLoading(false);

        Alert.alert('Success', 'Check your phone for OTP!', [
          { 
            text: 'OK', 
            onPress: () => router.push({
              pathname: '/(auth)/verify-otp',
              params: { 
                userId: res.data.userId,
                firebaseVerificationId: confirmation.verificationId // 🚀 [NEW]
              }
            }) 
          }
        ]);
      } catch (firebaseError: any) {
        setIsLoading(false);
        console.error("Firebase OTP Error:", firebaseError);
        Alert.alert('SMS Failed', 'Could not send OTP to your phone.');
      }

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
        <View style={styles.iconBox}>
          <Ionicons name="school" size={40} color="#4361EE" />
        </View>
        <Text style={styles.title}>Student Portal</Text>
        <Text style={styles.subtitle}>Strictly for verified students only</Text>

        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Full Name" onChangeText={t => setForm({...form, name: t})} />
          <TextInput style={styles.input} placeholder="Institute Email (e.g. @rcciit.org)" onChangeText={t => setForm({...form, email: t})} autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={styles.input} placeholder="Phone Number (e.g. 9876543210)" onChangeText={t => setForm({...form, phone: t})} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Password" onChangeText={t => setForm({...form, password: t})} secureTextEntry />
        </View>

        <TouchableOpacity 
          style={[styles.btn, isLoading && { opacity: 0.6 }]} 
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={styles.btnText}>
            {isLoading ? "Please Wait..." : "Verify & Register"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7FE', paddingVertical: 40 },
  backBtn: { position: 'absolute', top: 40, left: 20, width: 40, height: 40, backgroundColor: '#ffffff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 5, zIndex: 10 },
  card: { width: '85%', backgroundColor: '#ffffff', borderRadius: 24, padding: 30, alignItems: 'center', elevation: 12, shadowColor: '#4361EE', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20 },
  iconBox: { width: 80, height: 80, backgroundColor: '#EEF2FF', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginBottom: 5 },
  subtitle: { fontSize: 12, color: '#EF4444', marginBottom: 25, fontWeight: '700' },
  inputContainer: { width: '100%', gap: 12, marginBottom: 20 },
  input: { backgroundColor: '#F8FAFC', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 15, color: '#1E293B' },
  btn: { width: '100%', backgroundColor: '#4361EE', padding: 16, borderRadius: 12, alignItems: 'center', elevation: 5, shadowColor: '#4361EE', shadowOpacity: 0.4, shadowRadius: 8 },
  btnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});