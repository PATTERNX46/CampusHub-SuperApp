import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function VerifyOTPScreen() {
  const { userId, method } = useLocalSearchParams();
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
      // 🚀 ফোন বা ইমেইল যাই হোক, ব্যাকএন্ড ডেটাবেস থেকে মেলাবে[cite: 5]
      const res = await api.post('/auth/verify-otp', { userId, otp });
      await setAndSaveUser(res.data);
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
          <Text style={styles.title}>Verify Account</Text>
          <Text style={styles.subtitle}>Enter 6-digit code sent via {method === 'phone' ? 'SMS' : 'Email'}</Text>
        </View>

        <View style={styles.form}>
          <TextInput 
            style={styles.input} 
            placeholder="••••••" 
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
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 30, elevation: 5 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748B', textAlign: 'center' },
  form: { width: '100%' },
  input: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 15, marginBottom: 25, borderWidth: 2, borderColor: '#CBD5E1', fontSize: 32, color: '#1E293B', textAlign: 'center', letterSpacing: 8, fontWeight: 'bold' },
  button: { backgroundColor: '#4361EE', padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});