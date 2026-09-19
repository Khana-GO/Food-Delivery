import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const statuses = [
  { value: 'PENDING', label: 'Pending', color: '#F59E0B' },
  { value: 'CONFIRMED', label: 'Confirmed', color: '#2563EB' },
  { value: 'PREPARING', label: 'Preparing', color: '#8B5CF6' },
  { value: 'READY', label: 'Ready', color: '#0E9F6E' },
  { value: 'PICKED_UP', label: 'Picked Up', color: '#E23744' },
  { value: 'DELIVERED', label: 'Delivered', color: '#22C55E' },
  { value: 'CANCELLED', label: 'Cancelled', color: '#EF4444' },
];

interface AdminStatusUpdateModalProps {
  visible: boolean;
  currentStatus: string;
  onClose: () => void;
  onUpdate: (status: string) => void;
  isPending: boolean;
}

export const AdminStatusUpdateModal = ({
  visible,
  currentStatus,
  onClose,
  onUpdate,
  isPending,
}: AdminStatusUpdateModalProps) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const handleUpdate = () => {
    if (selectedStatus !== currentStatus) {
      onUpdate(selectedStatus);
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable className="flex-1 bg-black/50" onPress={onClose}>
        <View className="items-center justify-center flex-1 px-5">
          <View className="w-full max-w-sm p-5 bg-white rounded-2xl" style={{ maxWidth: 300 }}>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[15px] font-bold text-black">Update Status</Text>
              <TouchableOpacity onPress={onClose} hitSlop={6} className="p-1">
                <Feather name="x" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text className="mb-3 text-xs text-gray-500">
              Current: <Text className="font-semibold text-black">{currentStatus}</Text>
            </Text>

            <View className="gap-1.5">
              {statuses.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  className={`flex-row items-center px-3 py-2 rounded-lg border ${
                    selectedStatus === status.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-100'
                  }`}
                  onPress={() => setSelectedStatus(status.value)}
                >
                  <View
                    className="items-center justify-center w-3.5 h-3.5 mr-2.5 border-2 rounded-full"
                    style={{
                      borderColor: status.color,
                      backgroundColor: selectedStatus === status.value ? status.color : 'transparent',
                    }}
                  >
                    {selectedStatus === status.value && <View className="w-1 h-1 rounded-full bg-white" />}
                  </View>
                  <Text
                    className={`text-[13px] font-medium ${
                      selectedStatus === status.value ? 'text-black' : 'text-gray-600'
                    }`}
                  >
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className={`bg-primary rounded-xl py-3 mt-4 ${isPending ? 'opacity-50' : ''}`}
              onPress={handleUpdate}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text className="text-[13px] font-bold text-center text-white">
                  Update Status
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};