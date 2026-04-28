import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Dimensions, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  // 🔍 Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Role Checker
  const userRole = Array.isArray(user?.roles) ? user.roles[0] : (user?.role || 'user');
  const isAdmin = userRole === 'admin';

  // 🌟 Categories
  const categories = [
    { id: '1', name: 'OCR Notes', icon: 'document-text', color: '#4361EE', route: '/ocr', bg: '#EEF2FF' }, 
    { id: '2', name: 'PG & Hostels', icon: 'home', color: '#10B981', route: '/pg-hostels', bg: '#ECFDF5' },
    { id: '3', name: 'Hire Services', icon: 'build', color: '#F59E0B', route: '/services', bg: '#FFFBEB' },
    { id: '4', name: 'Find Tutors', icon: 'school', color: '#8B5CF6', route: '/tutors', bg: '#F5F3FF' },
    { id: '5', name: 'Ghar ka Khana', icon: 'restaurant', color: '#F97316', route: '/food', bg: '#FFF7ED' },
    { id: '6', name: 'Medical & SOS', icon: 'medkit', color: '#EC4899', route: '/medical', bg: '#FDF2F8' },
    { id: '7', name: 'Internships', icon: 'briefcase', color: '#14B8A6', route: '/internships', bg: '#F0FDFA' },
    { id: '8', name: 'Student Market', icon: 'cart', color: '#F72585', route: '/marketplace', bg: '#FFF0F6' },
  ];

  // ⚡ Live Search Filter
  const filteredCategories = categories.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryPress = (route: string, name: string) => {
    
    // 🛡️ [ADMIN RESTRICTIONS]
    if (isAdmin) {
      const adminRestricted = ['OCR Notes', 'Internships',];
      if (adminRestricted.includes(name)) {
        return Alert.alert('Access Denied', `Admins are not allowed to access ${name}.`);
      }
    }

    // 🛡️ [STRICT RULEBOOK CHECK]
    const studentOnly = ['OCR Notes', 'Student Market', 'Internships'];
    const teacherAllowed = ['Find Tutors', 'PG & Hostels', 'Hire Services', 'Ghar ka Khana'];

    // স্টুডেন্টরা 'Ghar ka Khana' এ ঢুকতে পারবে (কারণ এটা studentOnly তে নেই)
    if (studentOnly.includes(name) && userRole !== 'student') {
      if (!(isAdmin && name === 'Student Market')) {
        return Alert.alert('Access Denied', `This feature is exclusively for Verified Students.`);
      }
    }

    if (name === 'Find Tutors' && (userRole !== 'student' && userRole !== 'teacher' && !isAdmin)) {
      return Alert.alert('Access Denied', 'Only Students and Teachers can access this section.');
    }

    if (userRole === 'teacher' && !teacherAllowed.includes(name)) {
       return Alert.alert('Access Denied', 'As a Teacher, you do not have permission to access this feature.');
    }
    
    // 🚀 [ROUTING - FIXED]
    // এখানে '/food' অ্যাড করা হলো যাতে গেট খুলে যায়!
    const completedRoutes = ['/pg-hostels', '/services', '/marketplace', '/tutors', '/ocr', '/medical', '/food','/internships'];

    if (completedRoutes.includes(route)) {
      router.push(route as any);
    } else {
      Alert.alert(name, 'Page is under development. We will build this next!');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 🌟 Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'User'} 👋</Text>
          <Text style={styles.subGreeting}>What do you need today?</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/profile')}>
          <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} style={styles.profilePic} />
        </TouchableOpacity>
      </View>

      {/* 🔍 3D Real Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search features (e.g. PG, Notes)..." 
          placeholderTextColor="#94A3B8" 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={{padding: 5}}>
            <Ionicons name="close-circle" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        )}
      </View>

      {/* 🛡️ ADMIN ONLY DASHBOARD BANNER */}
      {isAdmin && (
        <TouchableOpacity style={styles.adminBanner} onPress={() => router.push('/admin-panel' as any)}>
          <View style={styles.adminIconBox}>
            <Ionicons name="shield-checkmark" size={24} color="#ffffff" />
          </View>
          <View style={{flex: 1, marginLeft: 15}}>
            <Text style={styles.adminTitle}>Admin Control Center</Text>
            <Text style={styles.adminSub}>Verify Users & Manage Platform</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#EF4444" />
        </TouchableOpacity>
      )}

      {/* 🚀 Explore Categories Grid (Filtered) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explore  Orbito</Text>
        
        {filteredCategories.length > 0 ? (
          <View style={styles.gridContainer}>
            {filteredCategories.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.gridItem}
                activeOpacity={0.7}
                onPress={() => handleCategoryPress(item.route, item.name)}
              >
                <View style={[styles.iconCircle, { backgroundColor: item.bg, shadowColor: item.color }]}>
                  <Ionicons name={item.icon as any} size={28} color={item.color} />
                </View>
                <Text style={styles.gridText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptySearchContainer}>
            <Ionicons name="search-outline" size={40} color="#CBD5E1" />
            <Text style={styles.emptySearchText}>No matching features found!</Text>
          </View>
        )}
      </View>

      {/* 🚨 SOS Banner */}
      <TouchableOpacity style={styles.sosBanner} onPress={() => router.push('/medical' as any)}>
        <Ionicons name="alert-circle" size={24} color="#ffffff" />
        <Text style={styles.sosText}>Emergency SOS & Medical Help</Text>
        <Ionicons name="chevron-forward" size={20} color="#ffffff" />
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FE' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#ffffff', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, elevation: 8, shadowColor: '#4361EE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  greeting: { fontSize: 24, fontWeight: '900', color: '#1E293B', letterSpacing: -0.5 },
  subGreeting: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },
  profileBtn: { padding: 2, borderWidth: 2, borderColor: '#4361EE', borderRadius: 25 },
  profilePic: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#E2E8F0' },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', marginHorizontal: 20, marginTop: 20, paddingHorizontal: 15, height: 55, borderRadius: 16, elevation: 6, shadowColor: '#4361EE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, borderWidth: 1, borderColor: '#ffffff' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#1E293B', fontWeight: '500' },
  
  adminBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', marginHorizontal: 20, marginTop: 20, padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#FCA5A5' },
  adminIconBox: { width: 45, height: 45, backgroundColor: '#EF4444', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  adminTitle: { fontSize: 16, fontWeight: 'bold', color: '#991B1B' },
  adminSub: { fontSize: 12, color: '#DC2626', marginTop: 2 },
  
  section: { padding: 20, marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 20 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: (width - 60) / 4, alignItems: 'center', marginBottom: 25 },
  iconCircle: { width: 60, height: 60, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 5, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6 },
  gridText: { fontSize: 12, color: '#475569', textAlign: 'center', fontWeight: '700' },
  
  emptySearchContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30 },
  emptySearchText: { color: '#94A3B8', fontSize: 14, fontWeight: '600', marginTop: 10 },

  sosBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#EF4444', marginHorizontal: 20, padding: 18, borderRadius: 16, elevation: 8, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10 },
  sosText: { color: '#ffffff', fontSize: 16, fontWeight: '900', flex: 1, marginLeft: 12 }
});