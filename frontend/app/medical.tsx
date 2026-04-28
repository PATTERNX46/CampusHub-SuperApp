import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Dimensions, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location'; 
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function MedicalScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [locationText, setLocationText] = useState('Fetching location...');
  const [city, setCity] = useState('');
  const [loadingLoc, setLoadingLoc] = useState(true);

  // 🎓 ডাইনামিক কলেজ লজিক
  const collegeName = user?.college || user?.university || 'RCCIIT'; 
  const isRCCIIT = collegeName.toUpperCase().includes('RCCIIT');

  const gateTitle = isRCCIIT ? 'Main Gate Security' : `${collegeName} Security`;
  const gatePhone = isRCCIIT ? '03312345678' : '100'; 
  const antiRaggingSub = isRCCIIT ? 'Strict Confidentiality' : 'National UGC Helpline';

  // 🏥 ডাইনামিক হসপিটাল লজিক
  const hospitalData: any = {
    'Kolkata': [
      { name: 'AMRI Hospital, Salt Lake', phone: '03323639999', dist: 'Approx. 4 km away' },
      { name: 'Ruby General Hospital', phone: '03339871800', dist: 'Approx. 6 km away' },
      { name: 'Beliaghata ID Hospital (Govt.)', phone: '03323537722', dist: 'Approx. 3.5 km away' },
    ],
    'Delhi': [
      { name: 'AIIMS Delhi', phone: '01126588500', dist: 'Approx. 5 km away' },
      { name: 'Safdarjung Hospital', phone: '01126165060', dist: 'Approx. 4.5 km away' },
      { name: 'Max Super Speciality', phone: '01126515050', dist: 'Approx. 6 km away' },
    ],
    'Default': [
      { name: 'Nearest Govt. Hospital', phone: '102', dist: 'Nearby' },
      { name: 'City Central Hospital', phone: '112', dist: 'Nearby' },
      { name: 'Emergency Medical Center', phone: '108', dist: 'Nearby' },
    ]
  };

  const currentHospitals = hospitalData[city] || hospitalData['Default'];

  // 📍 লাইভ লোকেশন লজিক
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationText('RCCIIT, Kolkata (Default)');
          setCity('Kolkata');
          setLoadingLoc(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        let geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
        
        if (geocode.length > 0) {
          const detectedCity = geocode[0].city || geocode[0].district || 'Kolkata';
          setCity(detectedCity);
          setLocationText(`${detectedCity}, ${geocode[0].region}`);
        }
      } catch (error) {
        setCity('Kolkata');
        setLocationText('Location Offline');
      } finally {
        setLoadingLoc(false);
      }
    })();
  }, []);

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      Alert.alert('Error', 'Unable to open dialer. Emergency Number: ' + number);
    });
  };

  const openMap = (query: string) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    if (url) {
      Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open maps.'));
    }
  };

  return (
    <View style={styles.container}>
      {/* 🌟 Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Emergency & SOS</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <Ionicons name="location" size={14} color="#FEE2E2" />
            {loadingLoc ? (
               <ActivityIndicator size="small" color="#ffffff" style={{marginLeft: 5}} />
            ) : (
               <Text style={styles.headerSubtitle} numberOfLines={1}> {locationText}</Text>
            )}
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* 🚨 MAIN SOS BUTTON */}
        <View style={styles.sosContainer}>
          <View style={styles.pulseRing}>
            <TouchableOpacity 
              style={styles.sosBtn} 
              activeOpacity={0.7} 
              onPress={() => handleCall('112')} 
            >
              <Ionicons name="warning" size={40} color="#ffffff" />
              <Text style={styles.sosBtnText}>SOS</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sosDesc}>Tap to call National Emergency (112)</Text>
        </View>

        {/* ⚡ Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Dials</Text>
          <View style={styles.gridRow}>
            <TouchableOpacity style={[styles.gridItem, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]} onPress={() => handleCall('102')}>
              <Ionicons name="medical" size={28} color="#EF4444" />
              <Text style={[styles.gridText, { color: '#B91C1C' }]}>Ambulance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.gridItem, { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' }]} onPress={() => handleCall('100')}>
              <Ionicons name="shield-checkmark" size={28} color="#3B82F6" />
              <Text style={[styles.gridText, { color: '#1D4ED8' }]}>Police (100)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gridRow}>
            <TouchableOpacity style={[styles.gridItem, { backgroundColor: '#FFF7ED', borderColor: '#FDBA74' }]} onPress={() => handleCall('101')}>
              <Ionicons name="flame" size={28} color="#F97316" />
              <Text style={[styles.gridText, { color: '#C2410C' }]}>Fire (101)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.gridItem, { backgroundColor: '#FDF2F8', borderColor: '#F9A8D4' }]} onPress={() => handleCall('1091')}>
              <Ionicons name="woman" size={28} color="#EC4899" />
              <Text style={[styles.gridText, { color: '#BE185D' }]}>Women Help</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 🏫  Orbito Security (Restored Original UI) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> Orbito Helpline</Text>
          <View style={styles.campusCard}>
            <View style={styles.campusRow}>
              <View style={styles.iconBox}>
                <Ionicons name="business" size={20} color="#4361EE" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.campusTitle}>{gateTitle}</Text>
                <Text style={styles.campusSub}>Available 24x7</Text>
              </View>
              <TouchableOpacity style={styles.callSmallBtn} onPress={() => handleCall(gatePhone)}>
                <Ionicons name="call" size={16} color="#ffffff" />
                <Text style={styles.callSmallText}>CALL</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            <View style={styles.campusRow}>
              <View style={styles.iconBox}>
                <Ionicons name="people" size={20} color="#8B5CF6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.campusTitle}>Anti-Ragging Squad</Text>
                <Text style={styles.campusSub}>{antiRaggingSub}</Text>
              </View>
              <TouchableOpacity style={[styles.callSmallBtn, { backgroundColor: '#8B5CF6' }]} onPress={() => handleCall('18001805522')}>
                <Ionicons name="call" size={16} color="#ffffff" />
                <Text style={styles.callSmallText}>CALL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 🏥 Nearby Hospitals (Restored Original UI) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Hospitals</Text>
          
          {currentHospitals.map((hosp: any, index: number) => (
            <View key={index} style={styles.hospitalCard}>
              <View style={styles.hospInfo}>
                <Text style={styles.hospName}>{hosp.name}</Text>
                <Text style={styles.hospDistance}>{hosp.dist}</Text>
              </View>
              <View style={styles.hospActions}>
                <TouchableOpacity style={styles.actionIconBtn} onPress={() => openMap(hosp.name)}>
                  <Ionicons name="navigate-circle" size={32} color="#10B981" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionIconBtn} onPress={() => handleCall(hosp.phone)}>
                  <Ionicons name="call" size={30} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#EF4444', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 10, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#ffffff' },
  headerSubtitle: { fontSize: 13, color: '#FEE2E2', fontWeight: '600' },
  
  sosContainer: { alignItems: 'center', marginTop: 30, marginBottom: 10 },
  pulseRing: { width: 160, height: 160, borderRadius: 80, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  sosBtn: { width: 130, height: 130, borderRadius: 65, backgroundColor: '#DC2626', justifyContent: 'center', alignItems: 'center', elevation: 15, shadowColor: '#DC2626', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15, borderWidth: 4, borderColor: '#ffffff' },
  sosBtnText: { color: '#ffffff', fontSize: 24, fontWeight: '900', marginTop: 5, letterSpacing: 2 },
  sosDesc: { marginTop: 15, fontSize: 14, color: '#64748B', fontWeight: '700' },

  section: { paddingHorizontal: 20, marginTop: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginBottom: 15 },
  
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  gridItem: { width: (width / 2) - 26, padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, elevation: 2 },
  gridText: { marginTop: 8, fontSize: 14, fontWeight: '800' },

  campusCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 15, elevation: 5, shadowColor: '#1E293B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  campusRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  iconBox: { width: 40, height: 40, backgroundColor: '#F1F5F9', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  campusTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  campusSub: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '600' },
  callSmallBtn: { flexDirection: 'row', backgroundColor: '#4361EE', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  callSmallText: { color: '#ffffff', fontSize: 12, fontWeight: '900', marginLeft: 4 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 5 },

  hospitalCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 15, borderRadius: 16, marginBottom: 12, elevation: 3, shadowColor: '#1E293B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', borderLeftWidth: 5, borderLeftColor: '#EF4444' },
  hospInfo: { flex: 1 },
  hospName: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  hospDistance: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  hospActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionIconBtn: { padding: 4 }
});