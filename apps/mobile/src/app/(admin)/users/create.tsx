import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { goBack } from '@/lib/navigation';
import { UserForm } from '@/components/admin/users/UserForm';
import { useCreateUser } from '@/hooks/admin/user/useCreateUser';
import { Colors, Radius } from '@/constants/theme';
import PremiumCard from '@/components/ui/PremiumCard';

export default function CreateUserScreen() {
  const { mutate: createUser, isPending } = useCreateUser();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View
        style={{
          backgroundColor: Colors.primary,
          paddingTop: 40,
          paddingBottom: 18,
          paddingHorizontal: 16,
          borderBottomLeftRadius: Radius['3xl'],
          borderBottomRightRadius: Radius['3xl'],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            onPress={() => goBack('/(admin)/(tabs)/users')}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.25)',
            }}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={16} color={Colors.white} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: Colors.white, fontSize: 15, fontWeight: '800', textAlign: 'right' }}>Create User</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 1, textAlign: 'right' }}>Add a new platform user</Text>
          </View>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
            <Feather name="user-plus" size={15} color={Colors.white} />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ paddingHorizontal: 16, marginTop: -16 }}>
          <PremiumCard elevation="md" padding={16}>
            <UserForm onSubmit={createUser} isLoading={isPending} submitLabel="Create User" />
          </PremiumCard>
        </View>
      </ScrollView>
    </View>
  );
}
