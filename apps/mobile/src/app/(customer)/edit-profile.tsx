import React, { useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Text } from '@/components/ui/Text';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useProfile, useUpdateProfile } from '@/api/users';
import { Colors } from '@/constants/theme';

const editProfileSchema = z.object({
  firstName: z.string().min(2, 'First name is too short'),
  lastName: z.string().min(2, 'Last name is too short'),
  phone: z.string().optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export default function EditProfileScreen() {
  const { data: userProfile, isLoading: isProfileLoading } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      reset({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        phone: userProfile.phone || '',
      });
    }
  }, [userProfile, reset]);

  const onSubmit = (data: EditProfileFormData) => {
    updateProfile(data, {
      onSuccess: () => {
        alert('Profile updated successfully!');
        router.back();
      },
      onError: (err) => {
        alert('Failed to update profile.');
        console.error(err);
      }
    });
  };

  if (isProfileLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-200">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mr-3">
          <Text className="text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-extrabold text-slate-800">Edit Profile</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-8">
          <View className="relative">
            <View className="w-24 h-24 rounded-full bg-slate-200 items-center justify-center border border-slate-300">
              <Text className="text-5xl">👤</Text>
            </View>
            <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary items-center justify-center border-2 border-white">
              <Text className="text-sm">📷</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <View className="mb-4">
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="First Name"
                  placeholder="Enter your first name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.firstName?.message}
                />
              )}
            />
          </View>

          <View className="mb-4">
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Last Name"
                  placeholder="Enter your last name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.lastName?.message}
                />
              )}
            />
          </View>

          <View className="mb-4">
            <Input
              label="Email Address"
              value={userProfile?.email || ''}
              editable={false}
              className="bg-slate-50 text-slate-500"
            />
            <Text className="text-xs text-slate-400 mt-1">Email address cannot be changed</Text>
          </View>

          <View className="mb-6">
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.phone?.message}
                />
              )}
            />
          </View>

          <Button
            label="Save Changes"
            onPress={handleSubmit(onSubmit)}
            loading={isUpdating}
            disabled={isUpdating}
          />
        </View>
        
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
