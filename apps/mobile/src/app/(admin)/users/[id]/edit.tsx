import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useUser } from '@/hooks/admin/user/useUser';
import { useUpdateUser } from '@/hooks/admin/user/useUpdateUser';
import { UserForm } from '@/components/admin/users/UserForm';
import { Colors, Radius, Shadow } from '@/constants/theme';
import PremiumCard from '@/components/ui/PremiumCard';

export default function EditUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: user, isLoading } = useUser(id);
  const { mutate: updateUser, isPending } = useUpdateUser();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: Colors.background }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
          <Feather name="user-x" size={32} color={Colors.primary} />
        </View>
        <Text style={{ marginTop: 16, fontSize: 16, fontWeight: '700', color: Colors.textDark }}>User Not Found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radius.full }} activeOpacity={0.7}>
          <Text style={{ fontWeight: '700', color: Colors.white }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View
        style={{
          backgroundColor: Colors.primary,
          paddingTop: 52,
          paddingBottom: 32,
          paddingHorizontal: 20,
          borderBottomLeftRadius: Radius['3xl'],
          borderBottomRightRadius: Radius['3xl'],
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(255,255,255,0.18)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.25)',
          }}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
            <Feather name="edit-2" size={18} color={Colors.white} />
          </View>
          <View>
            <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '800' }}>Edit User</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }} numberOfLines={1}>{user.firstName} {user.lastName} • {user.role}</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ paddingHorizontal: 16, marginTop: -16 }}>
          <PremiumCard elevation="md" padding={16}>
            <UserForm
              initialData={{
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone || '',
                role: user.role,
              }}
              onSubmit={(data) => updateUser({ id, data })}
              isLoading={isPending}
              submitLabel="Update User"
              isEdit
            />
          </PremiumCard>
        </View>
      </ScrollView>
    </View>
  );
}
