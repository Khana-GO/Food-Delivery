import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateProfile } from '@/hooks/user';
import { useUploadProfileImage, useDeleteProfileImage } from '@/hooks/user';
import { Colors, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

export default function DriverEditProfile() {
  const { user, setUser } = useAuth();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: uploadImage, isPending: isUploading } = useUploadProfileImage();
  const { mutate: deleteImage, isPending: isDeleting } = useDeleteProfileImage();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(user?.imageUrl || null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      setProfileImage(user.imageUrl || null);
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      uploadImage(result.assets[0]);
    }
  };

  const handleDeleteImage = () => {
    Alert.alert('Remove Profile Image', 'Are you sure you want to remove your profile image?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteImage() },
    ]);
  };

  const handleSave = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }
    updateProfile({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.trim() || undefined,
    });
  };

  const getInitials = () => {
    return `${formData.firstName?.charAt(0).toUpperCase() || ''}${formData.lastName?.charAt(0).toUpperCase() || ''}` || 'D';
  };

  const hasProfileImage = !!profileImage;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.background }}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 32, paddingHorizontal: 20, borderBottomLeftRadius: Radius['3xl'], borderBottomRightRadius: Radius['3xl'] }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ position: 'relative', marginBottom: 16 }}>
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: Colors.white,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: 'rgba(255,255,255,0.3)',
                ...Shadow.lg,
              }}>
                {hasProfileImage ? (
                  <Image source={{ uri: profileImage! }} style={{ width: '100%', height: '100%', borderRadius: 50 }} />
                ) : (
                  <Text style={{ fontSize: 36, fontWeight: '800', color: Colors.primary }}>
                    {getInitials()}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={handlePickImage}
                disabled={isUploading || isUpdating}
                activeOpacity={0.7}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: Colors.primary,
                  borderRadius: 20,
                  padding: 10,
                  borderWidth: 3,
                  borderColor: Colors.white,
                  ...Shadow.md,
                }}
              >
                <Feather name="camera" size={16} color={Colors.white} />
              </TouchableOpacity>
              {hasProfileImage && !isUploading && (
                <TouchableOpacity
                  onPress={() => setIsRemoving(true)}
                  activeOpacity={0.7}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    backgroundColor: Colors.error,
                    borderRadius: 20,
                    padding: 10,
                    borderWidth: 3,
                    borderColor: Colors.white,
                    ...Shadow.md,
                  }}
                >
                  <Feather name="trash-2" size={16} color={Colors.white} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.white, marginBottom: 4 }}>
              {formData.firstName} {formData.lastName}
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{formData.email}</Text>

            {isRemoving && (
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, paddingHorizontal: 20 }}>
                <TouchableOpacity
                  onPress={() => { deleteImage(); setIsRemoving(false); }}
                  style={{ flex: 1, backgroundColor: Colors.error, paddingVertical: 12, borderRadius: Radius.full, alignItems: 'center' }}
                >
                  <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 14 }}>Remove</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsRemoving(false)}
                  style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 12, borderRadius: Radius.full, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 14 }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: -20 }}>
          <PremiumCard elevation="md" padding={20} style={{ marginBottom: 16 }}>
            <Text style={{ ...Typography.titleMedium, color: Colors.textDark, marginBottom: 20 }}>Personal Information</Text>

            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...Typography.labelMedium, color: Colors.textSecondary, marginBottom: 6 }}>First Name</Text>
                  <TextInput
                    style={{
                      backgroundColor: Colors.surface,
                      borderWidth: 1,
                      borderColor: Colors.border,
                      borderRadius: Radius.lg,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 16,
                      color: Colors.textDark,
                    }}
                    value={formData.firstName}
                    onChangeText={v => handleChange('firstName', v)}
                    placeholder="First Name"
                    autoCapitalize="words"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...Typography.labelMedium, color: Colors.textSecondary, marginBottom: 6 }}>Last Name</Text>
                  <TextInput
                    style={{
                      backgroundColor: Colors.surface,
                      borderWidth: 1,
                      borderColor: Colors.border,
                      borderRadius: Radius.lg,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 16,
                      color: Colors.textDark,
                    }}
                    value={formData.lastName}
                    onChangeText={v => handleChange('lastName', v)}
                    placeholder="Last Name"
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View>
                <Text style={{ ...Typography.labelMedium, color: Colors.textSecondary, marginBottom: 6 }}>Email</Text>
                <TextInput
                  style={{
                    backgroundColor: Colors.backgroundAlt,
                    borderWidth: 1,
                    borderColor: Colors.borderLight,
                    borderRadius: Radius.lg,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    color: Colors.textMuted,
                  }}
                  value={formData.email}
                  editable={false}
                  placeholder="Email"
                />
              </View>

              <View>
                <Text style={{ ...Typography.labelMedium, color: Colors.textSecondary, marginBottom: 6 }}>Phone Number</Text>
                <TextInput
                  style={{
                    backgroundColor: Colors.surface,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    borderRadius: Radius.lg,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    color: Colors.textDark,
                  }}
                  value={formData.phone}
                  onChangeText={v => handleChange('phone', v)}
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </PremiumCard>

          <TouchableOpacity
            onPress={handleSave}
            disabled={isUpdating || isUploading || isDeleting}
            activeOpacity={0.8}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: Radius.xl,
              paddingVertical: 16,
              alignItems: 'center',
              ...Shadow.primary,
              opacity: (isUpdating || isUploading || isDeleting) ? 0.7 : 1,
            }}
          >
            {(isUpdating || isUploading || isDeleting) ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 16 }}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}