import React, { useState, useEffect } from 'react';
// 🚀 [NEW] Platform টা react-native থেকে ইম্পোর্ট করা হলো
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Dimensions, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext'; 
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// 🚀 [NEW] PDF ওপেন করার সিকিউরিটি বাইপাস টুলস
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [savedNotes, setSavedNotes] = useState<any[]>([]);

  // Load profile pic
  useEffect(() => {
    const loadProfilePic = async () => {
      if (!user?._id) return;
      try {
        const savedPic = await AsyncStorage.getItem(`userProfilePic_${user._id}`);
        if (savedPic) setProfilePic(savedPic);
      } catch (error) {
        console.log("Error loading image", error);
      }
    };
    loadProfilePic();
  }, [user?._id]);

  // 📄 Load Saved OCR Notes
  useEffect(() => {
    const loadNotes = async () => {
      if (!user?._id) return;
      const notes = await AsyncStorage.getItem(`savedNotes_${user._id}`);
      if (notes) setSavedNotes(JSON.parse(notes));
    };
    loadNotes();
  }, [user?._id]);

  // 🚀 [FIXED] Android Security Bypass - একদম ডাইরেক্ট PDF খুলবে!
  const handleOpenPdf = async (fileUri: string) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        // 💡 এতে শেয়ার শিট খুলবে, যেখান থেকে তুমি 'Download / Save to Device' বা ভিউ করতে পারবে
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Download, Share or View PDF',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Error', 'Sharing/Viewing is not supported on this device.');
      }
    } catch (error) {
      console.log("PDF Error:", error);
      Alert.alert('Error', 'Could not open the PDF document.');
    }
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && user?._id) {
      const uri = result.assets[0].uri;
      setProfilePic(uri);
      await AsyncStorage.setItem(`userProfilePic_${user._id}`, uri);
      Alert.alert('Success', 'Profile picture updated successfully!');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
          if (logout) await logout();
          else { await AsyncStorage.removeItem('token'); router.replace('/login'); }
        }
      }
    ]);
  };

  // 🛠️ Role Display Logic
  const getRoleDisplay = () => {
    const role = Array.isArray(user?.roles) ? user.roles[0] : (user?.role || 'user');
    const roleMap: any = {
      student: { label: 'Verified Student', icon: 'school', color: '#4361EE', bg: '#EEF2FF' },
      user: { label: 'Normal User', icon: 'person', color: '#10B981', bg: '#ECFDF5' },
      service: { label: 'Service Provider', icon: 'build', color: '#F59E0B', bg: '#FFFBEB' },
      shop: { label: 'Shop Owner', icon: 'storefront', color: '#F72585', bg: '#FFF0F6' },
      teacher: { label: 'Teacher / Tutor', icon: 'book', color: '#8B5CF6', bg: '#F5F3FF' },
      pg: { label: 'PG / Hostel Owner', icon: 'home', color: '#14B8A6', bg: '#F0FDFA' },
      admin: { label: 'Administrator', icon: 'shield-checkmark', color: '#EF4444', bg: '#FEF2F2' },
    };
    return roleMap[role] || roleMap['user'];
  };

  const roleInfo = getRoleDisplay();

  return (
    <View style={styles.mainContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerBackground}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: roleInfo.color }]}>
                <Text style={styles.avatarLetter}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.cameraBtn} onPress={handlePickImage}>
              <Ionicons name="camera" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
          
          <View style={[styles.roleBadge, { backgroundColor: roleInfo.bg }]}>
            <Text style={[styles.roleBadgeText, { color: roleInfo.color }]}>{roleInfo.label}</Text>
          </View>
        </View>

        {/* 🛡️ Admin Notifications Section */}
        {user?.adminMessage ? (
          <View style={styles.adminNotifyCard}>
            <View style={styles.notifyHeader}>
              <Ionicons name="notifications-circle" size={24} color="#EF4444" />
              <Text style={styles.notifyTitle}>Admin Message</Text>
            </View>
            <Text style={styles.notifyBody}>{user.adminMessage}</Text>
            <View style={styles.notifyFooter}>
              <Text style={styles.notifyTime}>Important Update</Text>
            </View>
          </View>
        ) : null}

        {/* 📚 My Saved OCR Notes Section */}
        {savedNotes.length > 0 && (
          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>My Saved Notes (PDF)</Text>
            {savedNotes.map((note, index) => (
              <View key={index} style={styles.noteCard}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Ionicons name="document-text" size={24} color="#EF4444" />
                  <View style={{marginLeft: 10}}>
                    <Text style={styles.noteTitle}>{note.title}.pdf</Text>
                    <Text style={styles.noteDate}>{note.date}</Text>
                  </View>
                </View>
                {/* 🚀 [FIXED] router.push এর জায়গায় handleOpenPdf কল করা হলো */}
                <TouchableOpacity onPress={() => handleOpenPdf(note.uri)} style={styles.viewNoteBtn}>
                  <Text style={styles.viewNoteText}>View Note</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={[styles.iconBox, { backgroundColor: roleInfo.bg }]}>
                <Ionicons name={roleInfo.icon as any} size={20} color={roleInfo.color} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>{roleInfo.label}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="mail" size={20} color="#64748B" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Registered Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>
            
            {user?.phone && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <View style={[styles.iconBox, { backgroundColor: '#FFF0F6' }]}>
                    <Ionicons name="call" size={20} color="#F72585" />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Phone Number</Text>
                    <Text style={styles.infoValue}>{user.phone}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#ffffff" style={{marginRight: 8}} />
          <Text style={styles.logoutText}>LOGOUT</Text>
        </TouchableOpacity>

        <View style={{height: 100}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F4F7FE' },
  headerBackground: { backgroundColor: '#4361EE', height: 180, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, alignItems: 'center', paddingTop: 60 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', letterSpacing: 1 },
  profileCard: { backgroundColor: '#ffffff', marginHorizontal: 20, marginTop: -60, borderRadius: 24, padding: 25, alignItems: 'center', elevation: 10, shadowColor: '#4361EE', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 15, borderWidth: 1, borderColor: '#ffffff' },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#ffffff' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#ffffff' },
  avatarLetter: { fontSize: 40, color: '#ffffff', fontWeight: 'bold' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#F72585', width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#ffffff', elevation: 5 },
  userName: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#64748B', marginBottom: 12 },
  roleBadge: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
  roleBadgeText: { fontWeight: 'bold', fontSize: 12 },
  
  adminNotifyCard: { backgroundColor: '#FFF1F2', marginHorizontal: 20, marginTop: 20, padding: 16, borderRadius: 16, borderLeftWidth: 5, borderLeftColor: '#EF4444', elevation: 3 },
  notifyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  notifyTitle: { fontSize: 15, fontWeight: 'bold', color: '#9F1239', marginLeft: 8 },
  notifyBody: { fontSize: 14, color: '#4C0519', lineHeight: 20 },
  notifyFooter: { marginTop: 10, alignItems: 'flex-end' },
  notifyTime: { fontSize: 10, color: '#F43F5E', fontWeight: '800', textTransform: 'uppercase' },

  detailsContainer: { padding: 20, marginTop: 5 }, 
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
  infoCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, elevation: 5, shadowColor: '#1E293B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 15 },
  
  noteCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  noteTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  noteDate: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  viewNoteBtn: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  viewNoteText: { color: '#4361EE', fontWeight: 'bold', fontSize: 12 },

  logoutBtn: { flexDirection: 'row', backgroundColor: '#EF4444', marginHorizontal: 20, marginTop: 10, paddingVertical: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10 },
  logoutText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});