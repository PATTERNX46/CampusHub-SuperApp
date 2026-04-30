import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import auth from '@react-native-firebase/auth'; // 🚀 [NEW] Firebase ইমপোর্ট করা হলো

export default function VerifyOTPScreen() {
  // 🚀 [NEW] আগের userId-এর সাথে firebaseVerificationId-ও রিসিভ করা হচ্ছে
  const { userId, firebaseVerificationId } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAndSaveUser } = useAuth();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid', 'Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    
    try {
      // 🚀 [NEW] লজিক: যদি Firebase থেকে SMS গিয়ে থাকে, তাহলে আগে ফোনের OTP মেলাবে
      if (firebaseVerificationId) {
        const credential = auth.PhoneAuthProvider.credential(firebaseVerificationId as string, otp);
        await auth().signInWithCredential(credential); // Firebase মেলাচ্ছে
        
        // Firebase সাকসেস হলে ব্যাকএন্ডকে একটা গ্রিন সিগন্যাল (firebaseVerified: true) পাঠানো হচ্ছে
        const res = await api.post('/auth/verify-otp', { userId, otp, firebaseVerified: true });
        await setAndSaveUser(res.data);
      } 
      // 🚀 [OLD] আর যদি ইমেইল থেকে আসে, তাহলে তোমার আগের লজিকটাই কাজ করবে (কোনো চেঞ্জ নেই)
      else {
        const res = await api.post('/auth/verify-otp', { userId, otp });
        await setAndSaveUser(res.data);
      }
      // সাকসেস হলে AuthContext নিজে থেকেই ড্যাশবোর্ডে নিয়ে যাবে
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Verification failed. Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          {/* তোমার আগের UI একদম সেম রাখা হয়েছে */}
          <Text style={styles.title}>Verify Account</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code sent to you</Text>
        </View>

        <View style={styles.form}>
          <TextInput 
            style={styles.input} 
            placeholder="• • • • • •" 
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad" 
            value={otp} 
            onChangeText={setOtp}
            maxLength={6}
          />

          <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>VERIFY NOW</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E2E8F0', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 30, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', fontWeight: '500', paddingHorizontal: 10 },
  form: { width: '100%' },
  input: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 15, marginBottom: 25, borderWidth: 2, borderColor: '#CBD5E1', fontSize: 32, color: '#1E293B', textAlign: 'center', letterSpacing: 8, fontWeight: 'bold' },
  button: { backgroundColor: '#4361EE', padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: '#4361EE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }
});