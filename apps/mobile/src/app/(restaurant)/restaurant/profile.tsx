import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/contexts/AuthContext";

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

interface RestaurantData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  cuisine: string[];
  description: string;
  logo: string | null;
  coverImage: string | null;
  isOpen: boolean;
  deliveryFee: number;
  minOrderAmount: number;
  estimatedDeliveryTime: number;
  rating: number;
  totalOrders: number;
  joinDate: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

export default function OwnerProfile() {
  const { user, logout } = useAuth();

  // ─── State ───
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const scrollViewRef = useRef<ScrollView>(null);

  // ─── Mock Restaurant Data ───
  const [restaurant, setRestaurant] = useState<RestaurantData>({
    id: "1",
    name: "Spice Garden",
    email: "spicegarden@restaurant.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    cuisine: ["Indian", "Chinese", "Continental"],
    description:
      "Authentic Indian cuisine with a modern twist. We bring the rich flavors of India to your table, using fresh ingredients and traditional recipes passed down through generations.",
    logo: null,
    coverImage: null,
    isOpen: true,
    deliveryFee: 2.99,
    minOrderAmount: 10.0,
    estimatedDeliveryTime: 30,
    rating: 4.8,
    totalOrders: 1247,
    joinDate: "January 2024",
  });

  // ─── Stats ───
  const stats = [
    {
      label: "Total Orders",
      value: restaurant.totalOrders,
      icon: "shopping-bag",
    },
    { label: "Rating", value: `${restaurant.rating} ⭐`, icon: "star" },
    { label: "Open Since", value: restaurant.joinDate, icon: "calendar" },
    {
      label: "Avg. Delivery",
      value: `${restaurant.estimatedDeliveryTime} min`,
      icon: "clock",
    },
  ];

  // ─── Handlers ───
  const handleUpdateRestaurant = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccessMessage("Restaurant profile updated successfully!");
      setShowSuccessModal(true);
      setIsEditing(false);
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to update restaurant profile. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleImagePick = useCallback(async (type: "logo" | "cover") => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "logo" ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (type === "logo") {
        setRestaurant((prev) => ({ ...prev, logo: uri }));
      } else {
        setRestaurant((prev) => ({ ...prev, coverImage: uri }));
      }
    }
  }, []);

  const handleToggleOpen = useCallback(() => {
    setRestaurant((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const handleLogout = useCallback(async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace("/(auth)/login");
  }, [logout]);

  const renderStat = useCallback(
    (stat: {
      label: string;
      value: string | number;
      icon: React.ComponentProps<typeof Feather>["name"];
    }) => (
      <View
        key={stat.label}
        className="flex-1 bg-white rounded-xl p-4 items-center border border-gray-100"
      >
        <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mb-2">
          <Feather name={stat.icon} size={20} color="#E23744" />
        </View>
        <Text className="text-lg font-bold text-black">{stat.value}</Text>
        <Text className="text-xs text-gray-500 font-medium">{stat.label}</Text>
      </View>
    ),
    [],
  );

  const renderField = useCallback(
    (
      label: string,
      value: string,
      key: keyof RestaurantData,
      multiline = false,
    ) => (
      <View className="mb-4">
        <Text className="text-sm font-semibold text-black mb-1.5">{label}</Text>
        {isEditing ? (
          <TextInput
            className={`border border-gray-200 rounded-xl px-4 py-3 text-base text-black bg-white ${
              multiline ? "min-h-[100px] text-left pt-3" : ""
            }`}
            value={value}
            onChangeText={(text) =>
              setRestaurant((prev) => ({ ...prev, [key]: text }))
            }
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
            textAlignVertical={multiline ? "top" : "center"}
            placeholder={`Enter ${label.toLowerCase()}`}
            placeholderTextColor="#999"
          />
        ) : (
          <View className="border border-gray-100 rounded-xl px-4 py-3 bg-gray-50">
            <Text className="text-base text-black">
              {value || "Not provided"}
            </Text>
          </View>
        )}
      </View>
    ),
    [isEditing],
  );

  // ─── Main Render ───
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <Feather name="arrow-left" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-black">
              Restaurant Profile
            </Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center"
              onPress={() => setIsEditing(!isEditing)}
            >
              <Feather
                name={isEditing ? "x" : "edit-2"}
                size={20}
                color="#E23744"
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-red-50 items-center justify-center"
              onPress={() => setShowLogoutModal(true)}
            >
              <Feather name="log-out" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Cover Image */}
        <View className="relative">
          {restaurant.coverImage ? (
            <Image
              source={{ uri: restaurant.coverImage }}
              className="w-full h-48"
            />
          ) : (
            <View className="w-full h-48 bg-gradient-to-r from-primary/20 to-primary/10 items-center justify-center">
              <MaterialCommunityIcons name="food" size={64} color="#E23744" />
              <Text className="text-gray-500 text-sm mt-2">
                Add Cover Image
              </Text>
            </View>
          )}
          {isEditing && (
            <TouchableOpacity
              className="absolute bottom-4 right-4 bg-black/70 px-4 py-2 rounded-full flex-row items-center gap-2"
              onPress={() => handleImagePick("cover")}
            >
              <Feather name="camera" size={16} color="#FFF" />
              <Text className="text-white text-xs font-medium">
                Change Cover
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Section */}
        <View className="px-6 -mt-12">
          <View className="flex-row items-end gap-4">
            {/* Logo */}
            <TouchableOpacity
              className={`relative ${isEditing ? "active:opacity-70" : ""}`}
              onPress={() => isEditing && handleImagePick("logo")}
              disabled={!isEditing}
            >
              {restaurant.logo ? (
                <Image
                  source={{ uri: restaurant.logo }}
                  className="w-24 h-24 rounded-2xl border-4 border-white"
                />
              ) : (
                <View className="w-24 h-24 rounded-2xl bg-primary border-4 border-white items-center justify-center">
                  <Text className="text-3xl font-bold text-white">
                    {restaurant.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {isEditing && (
                <View className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 border-2 border-white">
                  <Feather name="camera" size={12} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* Restaurant Info */}
            <View className="flex-1 pb-1">
              <Text className="text-2xl font-bold text-black">
                {restaurant.name}
              </Text>
              <View className="flex-row items-center gap-2 mt-1">
                <View
                  className={`px-2 py-0.5 rounded-full ${
                    restaurant.isOpen ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      restaurant.isOpen ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {restaurant.isOpen ? "● Open" : "● Closed"}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Feather name="star" size={14} color="#F59E0B" />
                  <Text className="text-sm font-semibold text-black">
                    {restaurant.rating}
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-gray-500 mt-0.5">
                {restaurant.cuisine.join(" • ")}
              </Text>
            </View>

            {/* Status Toggle */}
            {isEditing && (
              <View className="items-center pb-1">
                <Text className="text-xs text-gray-500 mb-1">Open Status</Text>
                <Switch
                  value={restaurant.isOpen}
                  onValueChange={handleToggleOpen}
                  trackColor={{ false: "#D1D5DB", true: "#E23744" }}
                  thumbColor={restaurant.isOpen ? "#FFF" : "#F3F4F6"}
                />
              </View>
            )}
          </View>
        </View>

        {/* Stats Grid */}
        <View className="px-6 mt-6">
          <View className="flex-row flex-wrap gap-3">
            {stats.map((stat) => renderStat(stat))}
          </View>
        </View>

        {/* Restaurant Details */}
        <View className="px-6 mt-6">
          <View className="bg-white rounded-2xl p-5 border border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-black">
                Restaurant Details
              </Text>
              {isEditing && (
                <TouchableOpacity
                  className="bg-primary px-4 py-2 rounded-lg flex-row items-center gap-2"
                  onPress={handleUpdateRestaurant}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Feather name="check" size={16} color="#FFF" />
                      <Text className="text-white text-sm font-semibold">
                        Save Changes
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {renderField("Restaurant Name", restaurant.name, "name")}
            {renderField("Email", restaurant.email, "email")}
            {renderField("Phone", restaurant.phone, "phone")}
            {renderField("Address", restaurant.address, "address")}
            {renderField("City", restaurant.city, "city")}
            {renderField("State", restaurant.state, "state")}
            {renderField("Zip Code", restaurant.zipCode, "zipCode")}

            {/* Cuisine Tags */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-black mb-1.5">
                Cuisine Types
              </Text>
              {isEditing ? (
                <TextInput
                  className="border border-gray-200 rounded-xl px-4 py-3 text-base text-black bg-white"
                  value={restaurant.cuisine.join(", ")}
                  onChangeText={(text) =>
                    setRestaurant((prev) => ({
                      ...prev,
                      cuisine: text.split(",").map((item) => item.trim()),
                    }))
                  }
                  placeholder="Indian, Chinese, Italian"
                  placeholderTextColor="#999"
                />
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {restaurant.cuisine.map((cuisine, index) => (
                    <View
                      key={index}
                      className="bg-primary/10 px-3 py-1.5 rounded-full"
                    >
                      <Text className="text-primary text-sm font-medium">
                        {cuisine}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {renderField(
              "Description",
              restaurant.description,
              "description",
              true,
            )}

            {/* Business Settings */}
            <View className="mt-4 pt-4 border-t border-gray-100">
              <Text className="text-lg font-bold text-black mb-4">
                Business Settings
              </Text>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm text-gray-600">Delivery Fee</Text>
                {isEditing ? (
                  <TextInput
                    className="border border-gray-200 rounded-lg px-3 py-2 text-base text-black bg-white w-24 text-right"
                    value={String(restaurant.deliveryFee)}
                    onChangeText={(text) =>
                      setRestaurant((prev) => ({
                        ...prev,
                        deliveryFee: parseFloat(text) || 0,
                      }))
                    }
                    keyboardType="decimal-pad"
                    placeholderTextColor="#999"
                  />
                ) : (
                  <Text className="text-base font-semibold text-black">
                    ${restaurant.deliveryFee.toFixed(2)}
                  </Text>
                )}
              </View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm text-gray-600">Minimum Order</Text>
                {isEditing ? (
                  <TextInput
                    className="border border-gray-200 rounded-lg px-3 py-2 text-base text-black bg-white w-24 text-right"
                    value={String(restaurant.minOrderAmount)}
                    onChangeText={(text) =>
                      setRestaurant((prev) => ({
                        ...prev,
                        minOrderAmount: parseFloat(text) || 0,
                      }))
                    }
                    keyboardType="decimal-pad"
                    placeholderTextColor="#999"
                  />
                ) : (
                  <Text className="text-base font-semibold text-black">
                    ${restaurant.minOrderAmount.toFixed(2)}
                  </Text>
                )}
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-600">
                  Est. Delivery Time
                </Text>
                {isEditing ? (
                  <TextInput
                    className="border border-gray-200 rounded-lg px-3 py-2 text-base text-black bg-white w-24 text-right"
                    value={String(restaurant.estimatedDeliveryTime)}
                    onChangeText={(text) =>
                      setRestaurant((prev) => ({
                        ...prev,
                        estimatedDeliveryTime: parseInt(text) || 0,
                      }))
                    }
                    keyboardType="number-pad"
                    placeholderTextColor="#999"
                  />
                ) : (
                  <Text className="text-base font-semibold text-black">
                    {restaurant.estimatedDeliveryTime} min
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Spacer */}
        <View className="h-6" />
      </ScrollView>

      {/* ─── Logout Modal ─── */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowLogoutModal(false)}
        >
          <View className="flex-1 items-center justify-center px-6">
            <Pressable className="bg-white rounded-2xl w-full max-w-sm p-6">
              <View className="items-center mb-4">
                <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center">
                  <Feather name="log-out" size={32} color="#EF4444" />
                </View>
              </View>
              <Text className="text-xl font-bold text-black text-center">
                Log Out
              </Text>
              <Text className="text-gray-500 text-center mt-2">
                Are you sure you want to log out of your restaurant account?
              </Text>
              <View className="flex-row gap-3 mt-6">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl bg-gray-100"
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text className="text-black font-semibold text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl bg-red-500"
                  onPress={handleLogout}
                >
                  <Text className="text-white font-semibold text-center">
                    Log Out
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* ─── Success Modal ─── */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowSuccessModal(false)}
        >
          <View className="flex-1 items-center justify-center px-6">
            <Pressable className="bg-white rounded-2xl w-full max-w-sm p-6">
              <View className="items-center">
                <View className="w-16 h-16 rounded-full bg-green-50 items-center justify-center">
                  <Feather name="check-circle" size={32} color="#22C55E" />
                </View>
                <Text className="text-xl font-bold text-black text-center mt-4">
                  Success!
                </Text>
                <Text className="text-gray-500 text-center mt-2">
                  {successMessage}
                </Text>
                <TouchableOpacity
                  className="w-full py-3 rounded-xl bg-primary mt-6"
                  onPress={() => setShowSuccessModal(false)}
                >
                  <Text className="text-white font-semibold text-center">
                    Got it
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
