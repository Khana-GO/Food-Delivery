import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

const { width } = Dimensions.get('window');

// Mock route coordinates (Brampton / Toronto area demo)
const RESTAURANT_LOCATION = { latitude: 43.7315, longitude: -79.7624 };
const CUSTOMER_LOCATION = { latitude: 43.7540, longitude: -79.7380 };

const ROUTE_POINTS = [
  RESTAURANT_LOCATION,
  { latitude: 43.7380, longitude: -79.7550 },
  { latitude: 43.7450, longitude: -79.7460 },
  CUSTOMER_LOCATION,
];

const ORDER_STEPS = [
  { id: '1', title: 'Order Confirmed', subtitle: '12:15 PM', completed: true },
  { id: '2', title: 'Kitchen Preparing', subtitle: 'Food is cooking', completed: true },
  { id: '3', title: 'Out for Delivery', subtitle: 'Driver picked up your order', active: true },
  { id: '4', title: 'Delivered', subtitle: 'En route to your door', pending: true },
];

export default function LiveOrderTrackScreen() {
  const { orderId } = useLocalSearchParams();
  const mapRef = useRef<MapView | null>(null);

  // Driver simulation animation state
  const [driverIndex, setDriverIndex] = useState(1);
  const [isSimulating, setIsSimulating] = useState(true);
  const [etaMinutes, setEtaMinutes] = useState(12);

  const currentDriverPos = ROUTE_POINTS[driverIndex] || ROUTE_POINTS[1];

  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      setDriverIndex((prev) => {
        const next = (prev + 1) % ROUTE_POINTS.length;
        if (next === ROUTE_POINTS.length - 1) {
          setEtaMinutes(2);
        } else if (next === 0) {
          setEtaMinutes(15);
        } else {
          setEtaMinutes((m) => Math.max(2, m - 3));
        }
        return next;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [isSimulating]);

  const handleCallDriver = () => {
    Alert.alert('Call Delivery Partner', 'Do you want to call Marcus (Driver)?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call +1 (555) 234-5678',
        onPress: () => Linking.openURL('tel:+15552345678'),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Live Order Tracking</Text>
          <Text style={styles.orderIdText}>Order #{orderId || 'FD-89241'}</Text>
        </View>

        <TouchableOpacity
          style={styles.simBtn}
          onPress={() => setIsSimulating(!isSimulating)}
        >
          <Ionicons
            name={isSimulating ? 'pause' : 'play'}
            size={16}
            color="#38BDF8"
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Map Container */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: 43.742,
              longitude: -79.750,
              latitudeDelta: 0.045,
              longitudeDelta: 0.045,
            }}
          >
            {/* Polyline Route */}
            <Polyline
              coordinates={ROUTE_POINTS}
              strokeColor="#38BDF8"
              strokeWidth={4}
            />

            {/* Restaurant Marker */}
            <Marker coordinate={RESTAURANT_LOCATION} title="McDonald's">
              <View style={styles.markerContainer}>
                <Text style={{ fontSize: 20 }}>🍔</Text>
              </View>
            </Marker>

            {/* Driver Live Marker */}
            <Marker coordinate={currentDriverPos} title="Driver Marcus">
              <View style={[styles.markerContainer, styles.driverMarker]}>
                <Ionicons name="bicycle" size={20} color="#FFFFFF" />
              </View>
            </Marker>

            {/* Customer Marker */}
            <Marker coordinate={CUSTOMER_LOCATION} title="Your Address">
              <View style={[styles.markerContainer, styles.customerMarker]}>
                <Ionicons name="home" size={18} color="#FFFFFF" />
              </View>
            </Marker>
          </MapView>

          {/* Live ETA Card Floating on Map */}
          <View style={styles.etaFloatingCard}>
            {etaMinutes <= 3 && (
              <View style={styles.arrivalAlertBanner}>
                <Ionicons name="notifications" size={16} color="#FFFFFF" />
                <Text style={styles.arrivalAlertText}>Driver is nearby! Get ready to receive your order.</Text>
              </View>
            )}

            <View style={styles.etaBadgeRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTag}>LIVE DRIVER LOCATION</Text>
            </View>

            <View style={styles.etaTextRow}>
              <View>
                <Text style={styles.etaMainText}>{etaMinutes} mins</Text>
                <Text style={styles.etaSubText}>Estimated Arrival 12:45 PM</Text>
              </View>
              <Ionicons name="time" size={32} color="#38BDF8" />
            </View>
          </View>
        </View>

        {/* Order Progress Status Bar */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Order Progression</Text>
          <View style={styles.stepperContainer}>
            {ORDER_STEPS.map((step, idx) => (
              <View key={step.id} style={styles.stepRow}>
                <View style={styles.stepIndicatorColumn}>
                  <View
                    style={[
                      styles.stepCircle,
                      step.completed && styles.stepCircleCompleted,
                      step.active && styles.stepCircleActive,
                    ]}
                  >
                    {step.completed ? (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    ) : step.active ? (
                      <View style={styles.activeInnerDot} />
                    ) : (
                      <View style={styles.pendingDot} />
                    )}
                  </View>
                  {idx < ORDER_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        step.completed && styles.stepLineCompleted,
                      ]}
                    />
                  )}
                </View>

                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, step.active && styles.stepTitleActive]}>
                    {step.title}
                  </Text>
                  <Text style={styles.stepSub}>{step.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Driver Details Card */}
        <View style={styles.sectionCard}>
          <View style={styles.driverRow}>
            <View style={styles.driverAvatar}>
              <Text style={{ fontSize: 24 }}>👨‍✈️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.driverName}>Marcus Vance</Text>
              <Text style={styles.vehicleInfo}>Honda Civic • Red • ABC-1234</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>4.9 (240+ deliveries)</Text>
              </View>
            </View>
          </View>

          <View style={styles.driverActions}>
            <TouchableOpacity style={styles.callBtn} onPress={handleCallDriver}>
              <Ionicons name="call" size={18} color="#FFFFFF" />
              <Text style={styles.callBtnText}>Call Driver</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.msgBtn} onPress={() => Alert.alert('In-App Chat', 'Opening chat with Marcus...')}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="#1E293B" />
              <Text style={styles.msgBtnText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery Address & Notes */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Delivery Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color="#38BDF8" />
            <View style={{ flex: 1 }}>
              <Text style={styles.detailTitle}>Home Address</Text>
              <Text style={styles.detailSub}>32 Kingston Lane, Apt 4B, Brampton, ON</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={20} color="#F59E0B" />
            <View style={{ flex: 1 }}>
              <Text style={styles.detailTitle}>Instructions for Driver</Text>
              <Text style={styles.detailSub}>Gate Code #1234. Please leave at the front door.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  orderIdText: { fontSize: 13, color: '#64748B' },
  simBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mapContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  driverMarker: {
    backgroundColor: '#38BDF8',
  },
  customerMarker: {
    backgroundColor: '#10B981',
  },

  etaFloatingCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  arrivalAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 10,
  },
  arrivalAlertText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
  },
  etaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  liveTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#22C55E',
    letterSpacing: 0.5,
  },
  etaTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etaMainText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
  },
  etaSubText: {
    fontSize: 13,
    color: '#64748B',
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },

  stepperContainer: {
    paddingLeft: 4,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 14,
  },
  stepIndicatorColumn: {
    alignItems: 'center',
    width: 24,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleCompleted: {
    backgroundColor: '#22C55E',
  },
  stepCircleActive: {
    backgroundColor: '#38BDF8',
    borderWidth: 3,
    borderColor: '#BAE6FD',
  },
  activeInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
  },
  stepLine: {
    width: 2,
    height: 28,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  stepLineCompleted: {
    backgroundColor: '#22C55E',
  },
  stepContent: {
    flex: 1,
    paddingBottom: 16,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  stepTitleActive: {
    color: '#1E293B',
    fontWeight: '800',
  },
  stepSub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },

  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  driverAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  vehicleInfo: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },

  driverActions: {
    flexDirection: 'row',
    gap: 10,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    height: 44,
    borderRadius: 12,
    gap: 8,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  msgBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    height: 44,
    borderRadius: 12,
    gap: 8,
  },
  msgBtnText: {
    color: '#1E293B',
    fontWeight: '700',
    fontSize: 14,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  detailSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
});
