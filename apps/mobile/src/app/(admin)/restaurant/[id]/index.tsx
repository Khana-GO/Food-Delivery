import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { goBack } from '@/lib/navigation';
import { useAdminRestaurant } from '@/hooks/admin/restaurant/useAdminRestaurant';
import { useToggleVerification } from '@/hooks/admin/restaurant/useToggleVerification';
import { useToggleActive } from '@/hooks/admin/restaurant/useToggleActive';
import { useSoftDeleteRestaurant } from '@/hooks/admin/restaurant/useSoftDeleteRestaurant';
import { useRestoreRestaurant } from '@/hooks/admin/restaurant/useRestoreRestaurant';
import { useHardDeleteRestaurant } from '@/hooks/admin/restaurant/useHardDeleteRestaurant';
import { useToggleOpen } from '@/hooks/admin/restaurant/useToggleOpen';
import { RestaurantDetails } from '@/components/admin/restaurants/RestaurantDetails';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Colors, Radius, Shadow } from '@/constants/theme';

export default function RestaurantDetailsScreenLegacy() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: restaurant, isLoading } = useAdminRestaurant(id as string);
  const { mutate: toggleVerification, isPending: isVerifying } = useToggleVerification();
  const { mutate: toggleActive, isPending: isTogglingActive } = useToggleActive();
  const { mutate: toggleOpen, isPending: isTogglingOpen } = useToggleOpen();
  const { mutate: deleteRestaurant, isPending: isDeleting } = useSoftDeleteRestaurant();
  const { mutate: restoreRestaurant, isPending: isRestoring } = useRestoreRestaurant();
  const { mutate: hardDelete, isPending: isHardDeleting } = useHardDeleteRestaurant();

  const isPending = isVerifying || isTogglingActive || isTogglingOpen || isDeleting || isRestoring || isHardDeleting;

  const [confirm, setConfirm] = useState<'delete' | 'restore' | 'permanent' | null>(null);

  const handleDelete = () => setConfirm('delete');
  const handleRestore = () => setConfirm('restore');
  const handleHardDelete = () => setConfirm('permanent');

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  if (!restaurant) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: Colors.background }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
          <Feather name="package" size={32} color={Colors.primary} />
        </View>
        <Text style={{ marginTop: 16, fontSize: 16, fontWeight: '700', color: Colors.textDark }}>Restaurant Not Found</Text>
        <TouchableOpacity onPress={() => goBack('/(admin)/(tabs)/restaurants')} style={{ marginTop: 16, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radius.full, ...Shadow.primary }} activeOpacity={0.8}>
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
          paddingBottom: 20,
          paddingHorizontal: 20,
          borderBottomLeftRadius: Radius['3xl'],
          borderBottomRightRadius: Radius['3xl'],
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => goBack('/(admin)/(tabs)/restaurants')}
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
        <View>
          <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '800' }}>Restaurant</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }} numberOfLines={1}>{(restaurant as any).name}</Text>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <RestaurantDetails
            restaurant={restaurant}
            onToggleVerification={() => toggleVerification(id as string)}
            onToggleActive={() => toggleActive(id as string)}
            onToggleOpen={() => toggleOpen(id as string)}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onHardDelete={handleHardDelete}
            isPending={isPending}
          />
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirm === 'delete'}
        onClose={() => setConfirm(null)}
        onConfirm={() => { setConfirm(null); deleteRestaurant(id as string); }}
        title="Delete Restaurant"
        message="Soft delete this restaurant?"
        confirmLabel="Delete"
        icon="trash-2"
        tone="danger"
        busy={isDeleting}
      />
      <ConfirmDialog
        visible={confirm === 'restore'}
        onClose={() => setConfirm(null)}
        onConfirm={() => { setConfirm(null); restoreRestaurant(id as string); }}
        title="Restore Restaurant"
        message="Restore this restaurant?"
        confirmLabel="Restore"
        icon="rotate-ccw"
        tone="info"
        busy={isRestoring}
      />
      <ConfirmDialog
        visible={confirm === 'permanent'}
        onClose={() => setConfirm(null)}
        onConfirm={() => { setConfirm(null); hardDelete(id as string); }}
        title="Permanently Delete"
        message="This cannot be undone."
        confirmLabel="Delete Forever"
        icon="alert-octagon"
        tone="danger"
        busy={isHardDeleting}
      />
    </View>
  );
}
