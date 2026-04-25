import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

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
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedRole(id);
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    
    // রোল অনুযায়ী আলাদা সাইনআপ পেজে পাঠাবো (যেটা আমরা এর পরের ধাপে বানাবো)
    if (selectedRole === 'student') {
      router.push('/register-student');
    } else {
      router.push(`/register-normal?role=${selectedRole}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* 🌟 3D Curved Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Join Campus App</Text>
        <Text style={styles.headerSubtitle}>Choose how you want to use the platform</Text>
      </View>

      {/* 🚀 3D Role Grid */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
                  isSelected && { shadowColor: role.color }
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
      </ScrollView>

      {/* 🟢 3D Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueBtn, !selectedRole && styles.continueBtnDisabled]} 
          disabled={!selectedRole}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#ffffff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FE' },
  
  // Header
  header: { padding: 25, paddingTop: 60, backgroundColor: '#ffffff', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 8, shadowColor: '#4361EE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, zIndex: 10 },
  backBtn: { width: 40, height: 40, backgroundColor: '#F1F5F9', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#1E293B', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 5, fontWeight: '500' },
  
  // Grid
  scrollContent: { padding: 20, paddingBottom: 120 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  
  // 3D Card
  card: { 
    width: (width / 2) - 28, 
    backgroundColor: '#ffffff', 
    borderRadius: 20, 
    padding: 15, 
    marginBottom: 16, 
    borderWidth: 2, 
    borderColor: '#ffffff',
    elevation: 6, 
    shadowColor: '#1E293B', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 10,
    alignItems: 'center'
  },
  cardSelected: {
    elevation: 12,
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 15,
    transform: [{ translateY: -4 }] // 3D Pop-up effect
  },
  iconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 12, position: 'relative' },
  checkBadge: { position: 'absolute', top: 0, right: -5, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ffffff' },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 6, textAlign: 'center' },
  cardDesc: { fontSize: 11, color: '#64748B', textAlign: 'center', fontWeight: '500', lineHeight: 16 },

  // Footer
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: 'rgba(255,255,255,0.9)', borderTopWidth: 1, borderColor: '#F1F5F9' },
  continueBtn: { flexDirection: 'row', backgroundColor: '#4361EE', paddingVertical: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#4361EE', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10 },
  continueBtnDisabled: { backgroundColor: '#CBD5E1', shadowOpacity: 0, elevation: 0 },
  continueText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }
});