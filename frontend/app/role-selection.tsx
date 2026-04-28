import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// 🛑 তোমার ডেটা একদম সেম আছে
const roles = [
  { id: 'student', title: 'Student', icon: 'school', color: '#4361EE', desc: 'Access notes, buy/rent, & more', bg: '#EEF2FF' },
  { id: 'user', title: 'Normal User', icon: 'person', color: '#10B981', desc: 'Hire services & buy new products', bg: '#ECFDF5' },
  { id: 'service', title: 'Service Provider', icon: 'build', color: '#F59E0B', desc: 'Provide local services (Maid, Plumber)', bg: '#FFFBEB' },
  { id: 'shop', title: 'Shop Owner', icon: 'storefront', color: '#F72585', desc: 'Sell new products & groceries', bg: '#FFF0F6' },
  { id: 'teacher', title: 'Teacher / Tutor', icon: 'book', color: '#8B5CF6', desc: 'Offer online/offline classes', bg: '#F5F3FF' },
  { id: 'pg', title: 'PG / Hostel Owner', icon: 'home', color: '#14B8A6', desc: 'List your properties & flats', bg: '#F0FDFA' },
];

export default function RoleSelectionScreen() {
  const router = useRouter();
  
  // 🛑 তোমার লজিক একদম সেম আছে
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedRole(id);
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    
    if (selectedRole === 'student') {
      router.push('/register-student');
    } else {
      router.push(`/register-normal?role=${selectedRole}`);
    }
  };

  // 🚀 নতুন অ্যানিমেশন লজিক (লগইনের মতো)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const circle1Anim = useRef(new Animated.Value(0)).current;
  const circle2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // পেজ লোড অ্যানিমেশন
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      
      // ব্যাকগ্রাউন্ডের ভাসমান 3D গোলক
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

  // 3D বাটনের প্রেস অ্যানিমেশন
  const onPressIn = () => {
    if(selectedRole) Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    if(selectedRole) Animated.spring(buttonScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
  };

  const circle1TranslateY = circle1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
  const circle2TranslateY = circle2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 40] });

  return (
    <View style={styles.container}>
      {/* 🎨 কালারফুল ভাসমান 3D ব্যাকগ্রাউন্ড */}
      <Animated.View style={[styles.bgCircle1, { transform: [{ translateY: circle1TranslateY }] }]} />
      <Animated.View style={[styles.bgCircle2, { transform: [{ translateY: circle2TranslateY }] }]} />

      {/* 🌟 3D Glass Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Join  Orbito</Text>
        <Text style={styles.headerSubtitle}>Choose how you want to use the platform</Text>
      </Animated.View>

      {/* 🚀 3D Role Grid */}
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        <View style={styles.grid}>
          {roles.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <TouchableOpacity
                key={role.id}
                activeOpacity={0.8}
                onPress={() => handleSelect(role.id)}
                style={[
                  styles.card,
                  { borderColor: isSelected ? role.color : '#ffffff' },
                  isSelected && styles.cardSelected,
                  isSelected && { shadowColor: role.color, borderBottomColor: role.color }
                ]}
              >
                <View style={[styles.iconContainer, { backgroundColor: role.bg }]}>
                  <Ionicons name={role.icon as any} size={32} color={role.color} />
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: role.color }]}>
                      <Ionicons name="checkmark-sharp" size={12} color="#ffffff" />
                    </View>
                  )}
                </View>
                <Text style={styles.cardTitle}>{role.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{role.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.ScrollView>

      {/* 🟢 3D Continue Button */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity 
            style={[styles.button3DBase, !selectedRole && styles.button3DBaseDisabled]} 
            disabled={!selectedRole}
            onPress={handleContinue}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            activeOpacity={1}
          >
            <View style={[styles.buttonInner, !selectedRole && styles.buttonInnerDisabled]}>
              <Text style={styles.continueText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" style={{ marginLeft: 8 }} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9', overflow: 'hidden' },
  
  // 🎈 3D ভাসমান সার্কেল
  bgCircle1: { position: 'absolute', top: -50, right: -50, width: 280, height: 280, borderRadius: 140, backgroundColor: '#10B981', opacity: 0.12 },
  bgCircle2: { position: 'absolute', bottom: 100, left: -80, width: 320, height: 320, borderRadius: 160, backgroundColor: '#4361EE', opacity: 0.1 },

  // Header (Glassmorphism)
  header: { padding: 25, paddingTop: 60, backgroundColor: 'rgba(255, 255, 255, 0.95)', borderBottomLeftRadius: 35, borderBottomRightRadius: 35, elevation: 10, shadowColor: '#4361EE', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 15, zIndex: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 1)' },
  backBtn: { width: 42, height: 42, backgroundColor: '#F1F5F9', borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  headerTitle: { fontSize: 30, fontWeight: '900', color: '#1E293B', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 15, color: '#64748B', marginTop: 5, fontWeight: '600' },
  
  // Grid
  scrollContent: { padding: 20, paddingBottom: 120 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  
  // 3D Card
  card: { 
    width: (width / 2) - 28, 
    backgroundColor: '#ffffff', 
    borderRadius: 22, 
    padding: 18, 
    marginBottom: 16, 
    borderWidth: 2, 
    borderBottomWidth: 5, // 3D Effect Base
    borderColor: '#ffffff',
    borderBottomColor: '#E2E8F0', // 3D Bottom color
    elevation: 4, 
    shadowColor: '#1E293B', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 8,
    alignItems: 'center'
  },
  cardSelected: {
    elevation: 12,
    borderBottomWidth: 6, // Pop-up effect on press
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 15,
    transform: [{ translateY: -4 }] 
  },
  iconContainer: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 15, position: 'relative' },
  checkBadge: { position: 'absolute', top: -2, right: -5, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ffffff', elevation: 3 },
  cardTitle: { fontSize: 15, fontWeight: '900', color: '#1E293B', marginBottom: 6, textAlign: 'center' },
  cardDesc: { fontSize: 12, color: '#64748B', textAlign: 'center', fontWeight: '600', lineHeight: 16 },

  // Footer & 3D Continue Button
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: 'rgba(255,255,255,0.95)', borderTopWidth: 1, borderColor: '#F1F5F9' },
  button3DBase: { backgroundColor: '#2A41B3', borderRadius: 18, elevation: 8, shadowColor: '#4361EE', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10 },
  button3DBaseDisabled: { backgroundColor: '#94A3B8', shadowOpacity: 0, elevation: 0 },
  buttonInner: { flexDirection: 'row', backgroundColor: '#4361EE', paddingVertical: 18, borderRadius: 18, justifyContent: 'center', alignItems: 'center', transform: [{ translateY: -6 }] },
  buttonInnerDisabled: { backgroundColor: '#CBD5E1', transform: [{ translateY: -2 }] },
  continueText: { color: '#ffffff', fontSize: 17, fontWeight: '900', letterSpacing: 1 }
});