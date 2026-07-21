import { Text } from '@/components/ui/Text';
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

export default function ChatScreen() {
  const { user } = useAuthStore();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState([
    { 
      id: '1', 
      type: 'agent', 
      text: `Hi ${user?.firstName || 'there'} how can I help you?`, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);

  useEffect(() => {
    // Initialize the Chat Session on mount
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: `You are the customer support AI for Foodie Nepal.
Rules:
- Be polite and concise.
- Answer only questions related to the food delivery app.
- If the user asks about an order, request the order ID.
- If the issue requires staff intervention, tell the user that a support agent will contact them.
- Never invent order information.`,
      });

      const chat = model.startChat({
        history: [],
      });
      setChatSession(chat);
    } catch (e) {
      console.error('Failed to initialize Gemini chat session', e);
    }
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || !chatSession) return;
    
    const userText = inputText.trim();
    const newUserMsg = {
      id: Date.now().toString(),
      type: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsTyping(true);
    
    // Auto scroll
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const result = await chatSession.sendMessage(userText);
      const aiResponseText = result.response.text();
      
      const newAiMsg = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        text: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newAiMsg]);
    } catch (error) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        text: "I'm having trouble connecting to my brain right now. Please check if the API key is configured correctly in the .env file.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
      console.error("Gemini Error:", error);
    } finally {
      setIsTyping(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <View style={styles.avatarBg}>
            <Text style={styles.avatarEmoji}>🤖</Text>
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.headerTitle}>KhanaGo Support</Text>
            <Text style={styles.headerSub}>AI Assistant • Typically replies instantly</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.moreBtn}>
          <Text style={styles.moreIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.chatArea} 
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(msg => (
            <View 
              key={msg.id} 
              style={[
                styles.bubbleWrapper, 
                msg.type === 'user' ? styles.wrapperRight : styles.wrapperLeft
              ]}
            >
              <View 
                style={[
                  styles.bubble, 
                  msg.type === 'user' ? styles.bubbleUser : styles.bubbleAgent
                ]}
              >
                <Text 
                  style={[
                    styles.bubbleText,
                    msg.type === 'user' ? styles.textUser : styles.textAgent
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
              <Text style={styles.timeText}>{msg.time}</Text>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.bubbleWrapper, styles.wrapperLeft]}>
              <View style={[styles.bubble, styles.bubbleAgent, { paddingHorizontal: 16, paddingVertical: 12 }]}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputArea}>
          <View style={styles.inputBox}>
            <TouchableOpacity style={styles.attachBtn}>
              <Text style={styles.attachIcon}>📎</Text>
            </TouchableOpacity>
            <TextInput 
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor={Colors.textLight}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              editable={!isTyping}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={isTyping || !inputText.trim()}>
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 18 },
  headerTitleContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12 },
  avatarBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00C853',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 20, color: '#fff' },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00E676',
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerTitle: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
  headerSub: { fontSize: 11, color: Colors.textSecondary },
  moreBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreIcon: { fontSize: 18, fontWeight: '800' },
  container: { flex: 1, backgroundColor: Colors.background },
  chatArea: { padding: 16 },
  bubbleWrapper: { marginBottom: 16, maxWidth: '85%' },
  wrapperLeft: { alignSelf: 'flex-start' },
  wrapperRight: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubble: { padding: 14, borderRadius: Radius.xl },
  bubbleAgent: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  textAgent: { color: Colors.textDark },
  textUser: { color: '#fff' },
  timeText: { fontSize: 10, color: Colors.textLight, marginTop: 4, paddingHorizontal: 4 },
  quickActions: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  actionChip: {
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
  },
  actionText: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  inputArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  attachBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  attachIcon: { fontSize: 18 },
  input: { flex: 1, paddingHorizontal: 8, fontSize: 14, color: Colors.textDark },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: { color: '#fff', fontSize: 14 },
});
