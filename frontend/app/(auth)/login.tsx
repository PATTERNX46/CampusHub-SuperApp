import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Animated, Dimensions, Easing } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  // 🛑 তোমার অরিজিনাল লজিক এবং স্টেট (একদম সেম আছে)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

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

  // 🚀 অ্যানিমেশনের জন্য নতুন লজিক
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const circle1Anim = useRef(new Animated.Value(0)).current;
  const circle2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // পেজ লোড হওয়ার অ্যানিমেশন (নিচ থেকে উপরে উঠবে)
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      
      // ব্যাকগ্রাউন্ডের ভাসমান 3D গোলকগুলোর অ্যানিমেশন
      Animated.loop(
        Animated.sequence([
          Animated.timing(circle1Anim, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(circle1Anim, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(circle2Anim, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(circle2Anim, { toValue: 0, duration: 5000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      )
    ]).start();
  }, []);

  // 3D বাটনে ক্লিক করার অ্যানিমেশন
  const onPressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
  };

  // ব্যাকগ্রাউন্ডের গোলকগুলোর নড়াচড়া
  const circle1TranslateY = circle1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
  const circle2TranslateY = circle2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 40] });

  return (
    <View style={styles.container}>
      {/* 🎨 কালারফুল ভাসমান 3D ব্যাকগ্রাউন্ড */}
      <Animated.View style={[styles.bgCircle1, { transform: [{ translateY: circle1TranslateY }] }]} />
      <Animated.View style={[styles.bgCircle2, { transform: [{ translateY: circle2TranslateY }] }]} />

      {/* 🚀 অ্যানিমেটেড গ্লাস 3D কার্ড */}
      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to Orbito </Text>
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

          {/* 🔘 3D রিয়েলিস্টিক বাটন */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity 
              style={styles.button3DBase} 
              onPress={handleLogin} 
              disabled={loading}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              activeOpacity={0.9}
            >
              <View style={styles.buttonInner}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>LOGIN</Text>}
              </View>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity 
              onPress={() => router.push('/role-selection')}
              style={{ paddingHorizontal: 10, paddingVertical: 5, marginTop: -5 }} 
              activeOpacity={0.6}
            >
              <Text style={styles.link}>Register Here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F1F5F9', // পরিষ্কার ব্যাকগ্রাউন্ড
    justifyContent: 'center', 
    padding: 20,
    overflow: 'hidden'
  },
  // 🎈 3D ডেপথ দেওয়ার জন্য ভাসমান সার্কেল
  bgCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#4361EE',
    opacity: 0.15,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#F72585',
    opacity: 0.12,
  },
  card: { 
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Glassmorphism এফেক্ট
    borderRadius: 24, 
    padding: 30, 
    elevation: 15, 
    shadowColor: '#4361EE', 
    shadowOffset: { width: 0, height: 12 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)', // 3D এজের জন্য
  },
  header: { alignItems: 'center', marginBottom: 35 },
  title: { fontSize: 32, fontWeight: '900', color: '#1E293B', marginBottom: 8, letterSpacing: 0.5 },
  subtitle: { fontSize: 16, color: '#64748B', fontWeight: '600' },
  form: { width: '100%' },
  input: { 
    backgroundColor: '#ffffff', 
    padding: 18, 
    borderRadius: 16, 
    marginBottom: 18, 
    borderWidth: 1.5, 
    borderColor: '#E2E8F0', 
    fontSize: 16, 
    color: '#1E293B',
    elevation: 2, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  // 🔘 3D বাটনের স্টাইল
  button3DBase: {
    backgroundColor: '#2A41B3', // বাটনের নিচের অংশের গাঢ় শ্যাডো রঙ
    borderRadius: 16,
    marginTop: 10,
    elevation: 8,
    shadowColor: '#4361EE', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 10,
  },
  buttonInner: {
    backgroundColor: '#4361EE', // বাটনের ওপরের মেইন রঙ
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    transform: [{ translateY: -5 }], // এই লাইনটাই 3D ফিল দিচ্ছে!
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 1.5 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 35 },
  footerText: { fontSize: 15, color: '#64748B', fontWeight: '500' },
  link: { fontSize: 16, color: '#F72585', fontWeight: '900' } // নজর কাড়া কালার
});