import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useRouter } from 'expo-router';

const AdminPanel = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [adminMsg, setAdminMsg] = useState('');
  const [actionType, setActionType] = useState<'verify' | 'reject'>('verify');
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openActionModal = (user: any, type: 'verify' | 'reject') => {
    setSelectedUser(user);
    setActionType(type);
    setAdminMsg(type === 'verify' ? 'Your account has been verified by Admin. Enjoy all features!' : 'Your account verification was rejected due to incorrect details.');
    setModalVisible(true);
  };

  const handleAdminAction = async () => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      const isVerified = actionType === 'verify';
      await api.patch('/admin/update-user', { 
        userId: selectedUser._id, 
        isVerified: isVerified,
        status: isVerified ? 'active' : 'rejected',
        adminMessage: adminMsg 
      });
      Alert.alert('Success', `User has been ${isVerified ? 'Verified' : 'Rejected'}.`);
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      Alert.alert('Error', 'Action failed.');
    } finally {
      setLoading(false);
    }
  };

  const renderUser = ({ item }: { item: any }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.userName}>{item.name}</Text>
          {/* Admin Verification Badge */}
          <View style={[styles.badge, { backgroundColor: item.isVerified ? '#DCFCE7' : '#FEE2E2' }]}>
            <Text style={[styles.badgeText, { color: item.isVerified ? '#166534' : '#991B1B' }]}>
              {item.isVerified ? 'Verified' : 'Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={14} color="#64748B" />
          <Text style={styles.detailText}>{item.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={14} color="#64748B" />
          <Text style={styles.detailText}>{item.phone || 'No Phone'}</Text>
        </View>
        
        {/* 🚀 FIXED: OTP Status (Since they are in DB, they logged in via OTP) */}
        <View style={styles.detailRow}>
           <Ionicons name="shield-checkmark-outline" size={14} color="#10B981" />
           <Text style={[styles.detailText, {color: "#10B981", fontWeight: 'bold'}]}>
             OTP Verified
           </Text>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        {!item.isVerified ? (
          <TouchableOpacity onPress={() => openActionModal(item, 'verify')}>
            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
          </TouchableOpacity>
        ) : null}
        
        <TouchableOpacity onPress={() => openActionModal(item, 'reject')} style={{marginTop: item.isVerified ? 0 : 15}}>
          <Ionicons name="close-circle" size={32} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#ffffff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>User Verification</Text>
      </View>
      
      {loading && !modalVisible ? (
        <ActivityIndicator size="large" color="#EF4444" style={{marginTop: 50}} /> 
      ) : (
        <FlatList data={users} keyExtractor={(item) => item._id} renderItem={renderUser} contentContainerStyle={{ padding: 15 }} />
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{actionType === 'verify' ? 'Verify User' : 'Reject User'}</Text>
            <TextInput style={styles.msgInput} multiline numberOfLines={4} value={adminMsg} onChangeText={setAdminMsg} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: actionType === 'verify' ? '#10B981' : '#EF4444' }]} onPress={handleAdminAction}>
                <Text style={styles.confirmText}>Submit Action</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminPanel;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { backgroundColor: '#EF4444', padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  userCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, marginBottom: 15, flexDirection: 'row', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: {width: 0, height: 2} },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  userName: { fontSize: 17, fontWeight: 'bold', color: '#1E293B', marginRight: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  detailText: { fontSize: 13, color: '#64748B', marginLeft: 6 },
  actionButtons: { justifyContent: 'center', alignItems: 'center', paddingLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  msgInput: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', height: 100, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  cancelBtn: { padding: 12 },
  cancelText: { color: '#64748B', fontWeight: 'bold' },
  confirmBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, marginLeft: 10 },
  confirmText: { color: '#ffffff', fontWeight: 'bold' }
});