import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; // 🚀 তোমার API সার্ভিস ইম্পোর্ট করা হলো

export default function OcrScannerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // 📷 ১. ছবি সিলেক্ট করা বা ছবি তোলা
  const pickImage = async (useCamera: boolean) => {
    let result;
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.6,
      base64: true,
    };

    if (useCamera) {
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled && result.assets[0].base64) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
      setExtractedText('');
    }
  };

  // 🔍 ২. আসল স্ক্যান করা (🚀 NEW: Gemini API via your Backend)
  const handleScanText = async () => {
    if (!imageBase64) return Alert.alert('Error', 'Please select or capture an image first.');
    
    setIsScanning(true);
    
    try {
      // 🚀 তোমার ব্যাকএন্ডের নতুন Gemini রাউটে কল যাচ্ছে
      const response = await api.post('/ocr/scan', { imageBase64 });
      
      const parsedText = response.data.extractedText;

      if (!parsedText || parsedText.trim() === '') {
        Alert.alert('No Text Found', 'Could not read any text. Please try a clearer picture.');
      } else {
        setExtractedText(parsedText);
        Alert.alert('Scan Complete', 'Text extracted perfectly using AI!');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Network Error', 'Check your internet connection and backend server.');
    } finally {
      setIsScanning(false);
    }
  };

  // 📄 ৩. PDF বানানো এবং প্রোফাইলে সেভ করা (আগের মতোই আছে)
  // 📄 ৩. PDF বানানো ( OrbitoHub Watermark সহ)
  const generateAndSavePDF = async () => {
    if (!extractedText) return Alert.alert('Error', 'No text available to convert to PDF.');

    setIsGeneratingPdf(true);
    try {
      // 🚀 [NEW] CSS দিয়ে  OrbitoHub এর জলছাপ (Watermark) যোগ করা হয়েছে
      const htmlContent = `
        <html>
          <head>
            <style>
              .watermark {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 80px;
                color: rgba(200, 200, 200, 0.25); /* হালকা গ্রে কালারের ট্রান্সপারেন্ট জলছাপ */
                z-index: -1;
                white-space: nowrap;
                font-weight: bold;
                pointer-events: none;
              }
            </style>
          </head>
          <body style="font-family: Arial, sans-serif; padding: 40px; color: #1E293B;">
            <div class="watermark"> OrbitoHub</div>
            <h1 style="color: #4361EE; border-bottom: 2px solid #E2E8F0; padding-bottom: 10px;">Scanned Note</h1>
            <p style="font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${extractedText.replace(/\n/g, '<br>')}</p>
            <footer style="margin-top: 50px; font-size: 12px; color: #94A3B8; text-align: center;">
              Generated via  Orbito Super App - AI Scanner
            </footer>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      const newNote = {
        id: Date.now().toString(),
        title: `Note_${new Date().toLocaleDateString().replace(/\//g, '-')}`,
        uri: uri,
        date: new Date().toLocaleString()
      };

      const existingNotes = await AsyncStorage.getItem(`savedNotes_${user?._id}`);
      const notesArray = existingNotes ? JSON.parse(existingNotes) : [];
      notesArray.unshift(newNote);
      await AsyncStorage.setItem(`savedNotes_${user?._id}`, JSON.stringify(notesArray));

      setIsGeneratingPdf(false);
      setImageUri(null);
      setImageBase64(null);
      setExtractedText('');

      Alert.alert(
        'Success', 
        'PDF created and saved to your profile!', 
        [
          { text: 'View Profile', onPress: () => router.push('/profile' as any) },
          { text: 'Share/Download PDF', onPress: () => Sharing.shareAsync(uri) },
          { text: 'Scan Another', style: 'cancel' }
        ]
      );

    } catch (error) {
      setIsGeneratingPdf(false);
      Alert.alert('Error', 'Failed to generate PDF.');
    }
  };
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Scanner</Text>
      </View>

      <View style={styles.warningBox}>
        <Ionicons name="information-circle" size={20} color="#D97706" />
        <Text style={styles.warningText}>
          Powered by Gemini AI. Works perfectly with <Text style={{fontWeight: 'bold'}}>Handwritten notes</Text> and Printed Text.
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="document-text-outline" size={60} color="#CBD5E1" />
              <Text style={styles.placeholderText}>No Image Selected</Text>
            </View>
          )}
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => pickImage(true)}>
            <Ionicons name="camera" size={20} color="#ffffff" />
            <Text style={styles.iconBtnText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#F72585' }]} onPress={() => pickImage(false)}>
            <Ionicons name="images" size={20} color="#ffffff" />
            <Text style={styles.iconBtnText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {imageUri && !extractedText && (
          <TouchableOpacity style={styles.scanBtn} onPress={handleScanText} disabled={isScanning}>
            {isScanning ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="scan-outline" size={20} color="#ffffff" style={{marginRight: 8}} />
                <Text style={styles.scanBtnText}>EXTRACT TEXT WITH AI</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {extractedText !== '' && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Scanned Text (Editable):</Text>
            <TextInput
              style={styles.textInput}
              multiline
              value={extractedText}
              onChangeText={setExtractedText}
            />
            
            <TouchableOpacity style={styles.pdfBtn} onPress={generateAndSavePDF} disabled={isGeneratingPdf}>
              {isGeneratingPdf ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="document-text" size={20} color="#ffffff" style={{marginRight: 8}} />
                  <Text style={styles.pdfBtnText}>SAVE AS PDF</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={{height: 100}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#ffffff', elevation: 4 },
  backBtn: { width: 40, height: 40, backgroundColor: '#F1F5F9', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B' },
  warningBox: { flexDirection: 'row', backgroundColor: '#FEF3C7', margin: 20, padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FDE68A' },
  warningText: { flex: 1, fontSize: 13, color: '#92400E', marginLeft: 10, lineHeight: 18 },
  content: { paddingHorizontal: 20 },
  imageContainer: { height: 250, backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', elevation: 2, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  placeholderText: { marginTop: 10, color: '#94A3B8', fontWeight: '600' },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  iconBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#4361EE', padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, elevation: 3 },
  iconBtnText: { color: '#ffffff', fontWeight: 'bold', marginLeft: 8 },
  scanBtn: { flexDirection: 'row', backgroundColor: '#10B981', padding: 18, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 4, marginBottom: 20 },
  scanBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  resultContainer: { marginTop: 10 },
  resultLabel: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  textInput: { backgroundColor: '#ffffff', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', minHeight: 150, textAlignVertical: 'top', fontSize: 15, color: '#334155', elevation: 1 },
  pdfBtn: { flexDirection: 'row', backgroundColor: '#EF4444', padding: 18, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 4, marginTop: 20 },
  pdfBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});