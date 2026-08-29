import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { RestaurantStatusBadge } from './RestaurantStatusBadge';
import { Restaurant } from '@food_delivery/types';

interface Props {
  restaurant: Restaurant;
  onToggleVerification: () => void;
  onToggleActive: () => void;
  onToggleOpen: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onHardDelete?: () => void;
  isPending: boolean;
}

export const RestaurantDetails = ({
  restaurant,
  onToggleVerification,
  onToggleActive,
  onToggleOpen,
  onDelete,
  onRestore,
  onHardDelete,
  isPending,
}: Props) => {
  const isDeleted = !!restaurant.deletedAt;

  return (
    <ScrollView className="flex-1 bg-[#F8F9FB]" showsVerticalScrollIndicator={false}>
      {/* Cover */}
      <View className="h-[210px] bg-gray-100 relative overflow-hidden">
        {restaurant.coverImageUrl ? (
          <Image source={{ uri: restaurant.coverImageUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="flex-1 bg-[#0F172A] items-center justify-center">
            <Feather name="image" size={42} color="rgba(255,255,255,0.6)" />
            <Text className="text-white/60 text-xs mt-2 font-medium">No cover image</Text>
          </View>
        )}
        <View className="absolute inset-0 bg-black/25" />
        <View className="absolute top-4 right-4">
          <RestaurantStatusBadge
            isOpen={restaurant.isOpen}
            isActive={restaurant.isActive}
            isVerified={restaurant.isVerified}
            isDeleted={isDeleted}
          />
        </View>
        {isDeleted && (
          <View className="absolute bottom-3 left-4 right-4 bg-red-600 rounded-xl px-3 py-2 flex-row items-center gap-2">
            <Feather name="alert-triangle" size={14} color="white" />
            <Text className="text-white text-xs font-bold flex-1">Soft deleted on {restaurant.deletedAt ? new Date(restaurant.deletedAt).toLocaleDateString() : ''}</Text>
          </View>
        )}
      </View>

      {/* Title card */}
      <View className="mx-4 -mt-10 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex-row gap-4" style={{ elevation: 3 }}>
        <View className="w-[72px] h-[72px] rounded-2xl bg-white border border-gray-100 overflow-hidden items-center justify-center">
          {restaurant.logoUrl ? (
            <Image source={{ uri: restaurant.logoUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="flex-1 bg-gray-50 items-center justify-center w-full">
              <Text className="text-2xl font-black text-gray-400">{restaurant.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-[18px] font-black text-[#0F172A] leading-5" numberOfLines={2}>{restaurant.name}</Text>
          <View className="flex-row items-center gap-1.5 mt-1">
            <Feather name="tag" size={12} color="#94A3B8" />
            <Text className="text-xs font-bold text-gray-600">{restaurant.cuisineType}</Text>
            <Text className="text-xs text-gray-400">•</Text>
            <Feather name="star" size={12} color="#F59E0B" />
            <Text className="text-xs font-bold text-[#0F172A]">{restaurant.averageRating ? Number(restaurant.averageRating).toFixed(1) : 'New'}</Text>
            <Text className="text-xs text-gray-400">({restaurant.totalReviews || 0})</Text>
          </View>
          <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>{restaurant.address}{restaurant.wardNumber ? ` • Ward ${restaurant.wardNumber}` : ''}</Text>
          <Text className="text-[11px] text-gray-400 mt-1 font-mono" numberOfLines={1}>{restaurant.slug}</Text>
        </View>
        {!isDeleted && (
          <TouchableOpacity
            onPress={() => router.push(`/(admin)/restaurants/${restaurant.id}/edit` as any)}
            className="self-start w-9 h-9 rounded-full bg-[#0F172A] items-center justify-center"
          >
            <Feather name="edit-2" size={16} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Metrics */}
      <View className="flex-row gap-3 px-4 mt-4">
        {[
          { label: 'Rating', value: restaurant.averageRating ? Number(restaurant.averageRating).toFixed(1) : '—', sub: `${restaurant.totalReviews || 0} reviews`, icon: 'star' as const },
          { label: 'Delivery', value: `Rs. ${restaurant.deliveryFee}`, sub: `Min Rs. ${restaurant.minimumOrderAmount}`, icon: 'truck' as const },
          { label: 'ETA', value: restaurant.estimatedDeliveryTime ? `${restaurant.estimatedDeliveryTime}m` : '—', sub: restaurant.isOpen ? 'Open now' : 'Closed', icon: 'clock' as const },
        ].map((m) => (
          <View key={m.label} className="flex-1 bg-white rounded-2xl border border-gray-100 p-3">
            <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center">
              <Feather name={m.icon} size={14} color="#0F172A" />
            </View>
            <Text className="text-sm font-black text-[#0F172A] mt-2">{m.value}</Text>
            <Text className="text-[11px] font-bold text-gray-600">{m.label}</Text>
            <Text className="text-[10px] text-gray-400">{m.sub}</Text>
          </View>
        ))}
      </View>

      {/* Details */}
      <View className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 p-4">
        <Text className="text-xs font-black tracking-widest text-[#0F172A] uppercase">Details</Text>
        <View className="mt-3 gap-0">
          <DetailRow icon="map-pin" label="Address" value={restaurant.address} />
          {restaurant.wardNumber ? <DetailRow icon="hash" label="Ward" value={`Ward ${restaurant.wardNumber}`} /> : null}
          <DetailRow icon="navigation" label="Location" value={`${restaurant.latitude.toFixed(4)}, ${restaurant.longitude.toFixed(4)}`} />
          {restaurant.phone ? <DetailRow icon="phone" label="Phone" value={restaurant.phone} /> : null}
          {restaurant.email ? <DetailRow icon="mail" label="Email" value={restaurant.email} /> : null}
          <DetailRow icon="coffee" label="Cuisine" value={restaurant.cuisineType} />
          <DetailRow icon="clock" label="Hours" value={`${restaurant.openingTime || '—'} — ${restaurant.closingTime || '—'}`} />
          <DetailRow icon="calendar" label="Created" value={new Date(restaurant.createdAt).toLocaleDateString()} />
          <DetailRow icon="refresh-cw" label="Updated" value={new Date(restaurant.updatedAt).toLocaleDateString()} />
          <DetailRow icon="hash" label="Owner ID" value={restaurant.ownerId} mono />
          {isDeleted ? <DetailRow icon="trash-2" label="Deleted" value={restaurant.deletedAt ? new Date(restaurant.deletedAt).toLocaleString() : ''} danger /> : null}
        </View>
        {restaurant.description ? (
          <View className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <Text className="text-xs font-bold text-gray-600">Description</Text>
            <Text className="text-sm text-[#0F172A] mt-1 leading-5">{restaurant.description}</Text>
          </View>
        ) : null}
      </View>

      {/* Admin actions */}
      <View className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 p-4">
        <Text className="text-xs font-black tracking-widest text-[#0F172A] uppercase">Admin Actions</Text>
        <Text className="text-[11px] text-gray-400 mt-1">Manage verification, availability and lifecycle</Text>

        {!isDeleted ? (
          <View className="mt-4 gap-3">
            <View className="flex-row gap-3">
              <ActionButton
                label={restaurant.isVerified ? 'Unverify' : 'Verify'}
                sub={restaurant.isVerified ? 'Revoke' : 'Approve'}
                icon={restaurant.isVerified ? 'shield-off' : 'shield'}
                colors={restaurant.isVerified ? ['#FEF3C7', '#F59E0B'] : ['#DBEAFE', '#2563EB']}
                onPress={onToggleVerification}
                disabled={isPending}
              />
              <ActionButton
                label={restaurant.isActive ? 'Deactivate' : 'Activate'}
                sub={restaurant.isActive ? 'Hide' : 'Publish'}
                icon={restaurant.isActive ? 'pause-circle' : 'play-circle'}
                colors={restaurant.isActive ? ['#F1F5F9', '#64748B'] : ['#DCFCE7', '#16A34A']}
                onPress={onToggleActive}
                disabled={isPending}
              />
            </View>

            <ActionButton
              label={restaurant.isOpen ? 'Close Restaurant' : 'Open Restaurant'}
              sub={restaurant.isOpen ? 'Stop orders' : 'Accept orders'}
              icon={restaurant.isOpen ? 'moon' : 'sun'}
              colors={restaurant.isOpen ? ['#F3F4F6', '#6B7280'] : ['#ECFDF5', '#0E9F6E']}
              onPress={onToggleOpen}
              disabled={isPending}
              full
            />

            <TouchableOpacity
              onPress={onDelete}
              disabled={isPending}
              className="flex-row items-center justify-center gap-2 py-3.5 rounded-xl border border-red-200 bg-red-50"
            >
              <Feather name="trash-2" size={16} color="#DC2626" />
              <Text className="font-black text-red-600 text-sm">Soft Delete</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="mt-4 gap-3">
            <TouchableOpacity
              onPress={onRestore}
              disabled={isPending}
              className="flex-row items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600"
            >
              <Feather name="refresh-cw" size={16} color="white" />
              <Text className="font-black text-white">Restore Restaurant</Text>
            </TouchableOpacity>
            {onHardDelete && (
              <TouchableOpacity
                onPress={onHardDelete}
                disabled={isPending}
                className="flex-row items-center justify-center gap-2 py-3.5 rounded-xl border border-red-200 bg-white"
              >
                <Feather name="alert-triangle" size={16} color="#DC2626" />
                <Text className="font-black text-red-600">Permanently Delete</Text>
              </TouchableOpacity>
            )}
            <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex-row gap-2">
              <Feather name="alert-circle" size={14} color="#D97706" />
              <Text className="text-xs text-amber-800 flex-1 leading-4">Deleted restaurants are hidden from customers and owners until restored.</Text>
            </View>
          </View>
        )}
      </View>

      <View className="h-6" />
    </ScrollView>
  );
};

function DetailRow({ icon, label, value, mono, danger }: { icon: any; label: string; value: string; mono?: boolean; danger?: boolean }) {
  return (
    <View className="flex-row items-center py-3 border-b border-gray-50">
      <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center">
        <Feather name={icon} size={14} color={danger ? '#DC2626' : '#64748B'} />
      </View>
      <Text className="ml-3 text-xs font-bold text-gray-500 flex-1">{label}</Text>
      <Text className={`text-xs font-bold max-w-[60%] text-right ${danger ? 'text-red-600' : 'text-[#0F172A]'} ${mono ? 'font-mono text-[11px]' : ''}`} numberOfLines={2} selectable>
        {value || '—'}
      </Text>
    </View>
  );
}

function ActionButton({
  label,
  sub,
  icon,
  colors,
  onPress,
  disabled,
  full,
}: {
  label: string;
  sub: string;
  icon: any;
  colors: [string, string];
  onPress: () => void;
  disabled?: boolean;
  full?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white ${full ? 'flex-1' : 'flex-1'}`}
      style={{ opacity: disabled ? 0.6 : 1 }}
    >
      <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: colors[0] }}>
        <Feather name={icon} size={16} color={colors[1]} />
      </View>
      <View className="flex-1">
        <Text className="text-xs font-black text-[#0F172A]">{label}</Text>
        <Text className="text-[11px] text-gray-500">{sub}</Text>
      </View>
    </TouchableOpacity>
  );
}
