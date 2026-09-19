import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotifications } from '@/hooks/owner/notification/useNotifications';
import { useUnreadCount } from '@/hooks/owner/notification/useUnreadCount';
import { useMarkAsRead } from '@/hooks/owner/notification/useMarkAsRead';
import { useMarkAllAsRead } from '@/hooks/owner/notification/useMarkAllAsRead';
import { useDeleteNotification } from '@/hooks/owner/notification/useDeleteNotification';
import { notificationService } from '@/services/owner/notification/notification.service';
import { useNotificationStore } from '@/stores/owner/notificationStore';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { DriverNotificationItem } from '@/components/driver/DriverNotificationItem';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { goBack } from '@/lib/navigation';

export default function CustomerNotifications() {
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch, isFetching } = useNotifications({ page, limit: 20 });
  const { data: unreadData } = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: markingAll } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { notifications, clearAll } = useNotificationStore();
  const unreadCount = unreadData?.count ?? 0;
  const [deleteKind, setDeleteKind] = useState<{ kind: 'one'; id: string } | { kind: 'all' } | null>(null);

  const loadMore = () => {
    if (data && page < data.totalPages) setPage(page + 1);
  };

  const handlePress = useCallback((n: any) => {
    if (n.data?.orderId) router.push(`/(customer)/order/${n.data.orderId}` as any);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteKind({ kind: 'one', id });
  }, []);

  const handleClearAll = useCallback(() => {
    if (notifications.length === 0) return;
    setDeleteKind({ kind: 'all' });
  }, [notifications.length]);

  const handleMarkAll = useCallback(() => { if (unreadCount === 0) return; markAllAsRead(); }, [markAllAsRead, unreadCount]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Premium crimson header — same as admin/owner/driver */}
      <View
        style={{
          backgroundColor: Colors.primary,
          paddingTop: insets.top + 8,
          paddingBottom: 16,
          paddingHorizontal: 16,
          borderBottomLeftRadius: Radius['3xl'],
          borderBottomRightRadius: Radius['3xl'],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <TouchableOpacity
              onPress={() => goBack('/(customer)/(tabs)')}
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
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.white, letterSpacing: -0.2 }} numberOfLines={1}>Notifications</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 }}>
                <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: unreadCount > 0 ? '#4ADE80' : 'rgba(255,255,255,0.5)' }} />
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600' }} numberOfLines={1}>
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'} • {notifications.length} total
                </Text>
              </View>
            </View>
          </View>
          {notifications.length > 0 ? (
            <TouchableOpacity
              onPress={handleClearAll}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
                flexShrink: 0,
              }}
              activeOpacity={0.7}
            >
              <Feather name="trash-2" size={14} color={Colors.white} />
            </TouchableOpacity>
          ) : null}
        </View>

        {notifications.length > 0 ? (
          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            <TouchableOpacity
              onPress={handleMarkAll}
              disabled={unreadCount === 0 || markingAll}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 9,
                borderRadius: Radius.full,
                backgroundColor: unreadCount > 0 ? Colors.white : 'rgba(255,255,255,0.18)',
                borderWidth: 1,
                borderColor: unreadCount > 0 ? Colors.white : 'rgba(255,255,255,0.25)',
                opacity: unreadCount === 0 ? 0.6 : 1,
              }}
              activeOpacity={0.8}
            >
              <Feather name="check-circle" size={14} color={unreadCount > 0 ? Colors.primary : Colors.white} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: unreadCount > 0 ? Colors.primary : Colors.white }}>
                {markingAll ? 'Marking…' : 'Mark all as read'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <DriverNotificationItem notification={item as any} onPress={handlePress} onMarkAsRead={markAsRead} onDelete={handleDelete} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isFetching && page === 1} onRefresh={() => refetch()} tintColor={Colors.primary} colors={[Colors.primary]} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        updateCellsBatchingPeriod={50}
        ListEmptyComponent={
          <View style={{ paddingVertical: 56, alignItems: 'center', paddingHorizontal: 32 }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: Colors.white,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                borderWidth: 1,
                borderColor: Colors.borderLight,
                ...Shadow.sm,
              }}
            >
              <Feather name="bell-off" size={32} color={Colors.textMuted} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textDark }}>No Notifications</Text>
            <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 6, textAlign: 'center', lineHeight: 18 }}>
              You're all caught up! New orders and updates will appear here in real time.
            </Text>
            <View
              style={{
                marginTop: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: Colors.primaryBg,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: Radius.full,
                borderWidth: 1,
                borderColor: '#FECDD3',
              }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success }} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.primary }}>Real-time updates active</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          isLoading && notifications.length > 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      {deleteKind ? (
        <ConfirmDialog
          visible
          title={deleteKind.kind === 'one' ? 'Remove notification?' : 'Delete all notifications?'}
          message={deleteKind.kind === 'one' ? 'This will permanently delete the notification.' : 'This will permanently delete all notifications.'}
          confirmLabel={deleteKind.kind === 'one' ? 'Remove' : 'Delete All'}
          icon="trash-2"
          tone="danger"
          onClose={() => setDeleteKind(null)}
          onConfirm={() => {
            const kind = deleteKind.kind;
            const id = kind === 'one' ? deleteKind.id : null;
            setDeleteKind(null);
            if (kind === 'all') {
              (async () => {
                try { await notificationService.deleteAll(); clearAll(); refetch(); } catch (e: any) { Alert.alert('Error', e?.response?.data?.message || 'Failed'); }
              })();
            } else if (id) {
              deleteNotification(id);
            }
          }}
        />
      ) : null}
    </View>
  );
}
