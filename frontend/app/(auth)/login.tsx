import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router'; // 👈 Router ইম্পোর্ট করা হলো

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter(); // 👈 Router ইনিশিয়ালাইজ করা হলো

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      // Login successful, RootLayout will handle the redirect
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to Campus Super App</Text>
        </View>

        <View style={styles.form}>
          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            placeholderTextColor="#94a3b8"
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput 
            style={styles.input} 
            placeholder="Password"
            placeholderTextColor="#94a3b8" 
            secureTextEntry 
            value={password} 
            onChangeText={setPassword} 
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>LOGIN</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            {/* 👇 একদম সলিড বাটন, ক্লিক মিস হবে না */}
            <TouchableOpacity 
              onPress={() => router.push('/role-selection')}
              style={{ paddingHorizontal: 10, paddingVertical: 5, marginTop: -5 }} // টাচ এরিয়া বড় করা হলো
              activeOpacity={0.6}
            >
              <Text style={styles.link}>Register Here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E2E8F0', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 25, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  header: { alignItems: 'center', marginBottom: 35 },
  title: { fontSize: 30, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B', fontWeight: '500' },
  form: { width: '100%' },
  input: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#CBD5E1', fontSize: 16, color: '#1E293B' },
  button: { backgroundColor: '#4361EE', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#4361EE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  footerText: { fontSize: 15, color: '#64748B' },
  link: { fontSize: 16, color: '#4361EE', fontWeight: '900' } // লেখাটা একটু বোল্ড করা হলো
});