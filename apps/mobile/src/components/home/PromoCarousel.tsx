import React from 'react';
import { ScrollView, View, StyleSheet, Dimensions, Image } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Colors, Radius } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
}

interface PromoCarouselProps {
  banners: Banner[];
}

export function PromoCarousel({ banners }: PromoCarouselProps) {
  if (!banners || banners.length === 0) {
    // Fallback if no banners from API
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.offersContainer}
      >
        <View style={[styles.offerCard, { backgroundColor: Colors.primary }]}>
          <Text style={styles.offerTitle}>50% OFF</Text>
          <Text style={styles.offerSub}>On your first 3 orders</Text>
          <View style={styles.promoChip}>
            <Text style={styles.promoText}>Use KHANA50</Text>
          </View>
          <Text style={styles.offerEmoji}>🍜</Text>
        </View>
        <View style={[styles.offerCard, { backgroundColor: '#1E3A5F' }]}>
          <Text style={styles.offerTitle}>Free{'\n'}Delivery</Text>
          <Text style={styles.offerSub}>On orders above Rs. 500</Text>
          <View style={[styles.promoChip, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={[styles.promoText, { color: '#fff' }]}>Limited time</Text>
          </View>
          <Text style={styles.offerEmoji}>🍕</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.offersContainer}
    >
      {banners.map((banner, index) => (
        <View 
          key={banner.id} 
          style={[styles.offerCard, { backgroundColor: index % 2 === 0 ? Colors.primary : '#1E3A5F' }]}
        >
          {banner.imageUrl ? (
            <Image source={{ uri: banner.imageUrl }} style={StyleSheet.absoluteFillObject} />
          ) : null}
          <View style={styles.overlay}>
            <Text style={styles.offerTitle}>{banner.title}</Text>
            <Text style={styles.offerSub}>{banner.subtitle}</Text>
            <View style={styles.promoChip}>
              <Text style={styles.promoText}>{banner.ctaText}</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  offersContainer: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  offerCard: {
    width: width * 0.65,
    borderRadius: Radius['2xl'],
    padding: 18,
    overflow: 'hidden',
    position: 'relative',
    height: 140,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 18,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  offerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
    lineHeight: 26,
  },
  offerSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 12 },
  promoChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  promoText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  offerEmoji: { fontSize: 42, position: 'absolute', right: 16, bottom: 12 },
});
