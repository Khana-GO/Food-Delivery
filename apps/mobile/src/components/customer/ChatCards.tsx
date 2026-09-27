import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Radius, Shadow } from '@/constants/theme';

interface RestaurantData {
  id?: string;
  name?: string;
  logoUrl?: string;
  cuisineType?: string;
  rating?: number | null;
  isOpen?: boolean;
  deliveryFee?: number;
  estimatedDeliveryTime?: number;
  address?: string;
}

interface MenuItemData {
  id?: string;
  name?: string;
  price?: number;
  description?: string;
  restaurantId?: string;
  restaurantName?: string;
  restaurantLogoUrl?: string;
  isOpen?: boolean;
  categoryName?: string;
}

interface MenuData {
  restaurantId?: string;
  restaurantName?: string;
  restaurantLogoUrl?: string;
  isOpen?: boolean;
  categories?: Array<{
    categoryName?: string;
    items?: MenuItemData[];
  }>;
}

interface OrderData {
  id?: string;
  status?: string;
  totalAmount?: number;
  restaurantName?: string;
  estimatedDelivery?: string;
  createdAt?: string;
}

interface ChatData {
  restaurants?: RestaurantData[];
  menuItems?: MenuItemData[];
  menu?: MenuData;
  orders?: OrderData[];
  order?: OrderData;
}

interface Props {
  data: ChatData;
}

const MAX_ITEMS_PER_CARD = 4;

const openButton = (onPress: () => void) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    style={styles.openBtn}
  >
    <Text style={styles.openText}>Open</Text>
    <Feather name="arrow-up-right" size={11} color="#FFFFFF" />
  </TouchableOpacity>
);

const logoView = (url?: string, name?: string, size = 36) => (
  <View style={[styles.logoWrap, { width: size, height: size, borderRadius: size / 2 }]}>
    {url ? (
      <Image
        source={{ uri: url }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
    ) : (
      <Text style={[styles.logoInitial, { fontSize: size * 0.42 }]}>
        {(name || 'R').charAt(0).toUpperCase()}
      </Text>
    )}
  </View>
);

const RestaurantCard = ({ restaurant }: { restaurant: RestaurantData }) => {
  const go = () => {
    if (restaurant.id) router.push(`/(customer)/restaurant/${restaurant.id}` as any);
  };
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {logoView(restaurant.logoUrl, restaurant.name)}
        <View style={styles.cardHeaderText}>
          <View style={styles.titleRow}>
            <Text numberOfLines={1} style={styles.cardTitle}>
              {restaurant.name}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text numberOfLines={1} style={styles.metaText}>
              {restaurant.cuisineType || 'Restaurant'}
            </Text>
            {restaurant.rating != null && (
              <View style={styles.ratingPill}>
                <Feather name="star" size={8} color="#FFFFFF" />
                <Text style={styles.ratingText}>{Number(restaurant.rating).toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>
        {restaurant.isOpen != null && (
          <Text style={[styles.statusText, restaurant.isOpen ? styles.statusOpen : styles.statusClosed]}>
            {restaurant.isOpen ? 'Open' : 'Closed'}
          </Text>
        )}
      </View>
      {(restaurant.estimatedDeliveryTime != null || restaurant.deliveryFee != null) && (
        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>
            {restaurant.estimatedDeliveryTime != null ? `${restaurant.estimatedDeliveryTime} min` : ''}
            {restaurant.estimatedDeliveryTime != null && restaurant.deliveryFee != null ? ' • ' : ''}
            {restaurant.deliveryFee != null ? `Rs. ${restaurant.deliveryFee} delivery` : ''}
          </Text>
        </View>
      )}
      {restaurant.id ? (
        <View style={styles.btnWrap}>{openButton(go)}</View>
      ) : null}
    </View>
  );
};

const ItemRow = ({ item }: { item: MenuItemData }) => (
  <View style={styles.itemRow}>
    <Text numberOfLines={1} style={styles.itemName}>
      {item.name}
    </Text>
    {item.price != null ? (
      <Text style={styles.itemPrice}>Rs. {item.price}</Text>
    ) : null}
  </View>
);

const MenuItemsCard = ({ items }: { items: MenuItemData[] }) => {
  const groups: Record<string, { name?: string; logoUrl?: string; id?: string; isOpen?: boolean; items: MenuItemData[] }> = {};
  for (const i of items) {
    const key = i.restaurantId || i.restaurantName || 'Other';
    if (!groups[key]) {
      groups[key] = {
        id: i.restaurantId,
        name: i.restaurantName || i.restaurantId,
        logoUrl: i.restaurantLogoUrl,
        isOpen: i.isOpen,
        items: [],
      };
    }
    groups[key].items.push(i);
  }

  return (
    <View style={styles.stack}>
      {Object.values(groups).map((g, idx) => (
        <View key={g.id || String(idx)} style={[styles.card, { marginBottom: idx === Object.keys(groups).length - 1 ? 0 : 8 }]}>
          <View style={styles.cardHeader}>
            {logoView(g.logoUrl, g.name)}
            <View style={styles.cardHeaderText}>
              <Text numberOfLines={1} style={styles.cardTitle}>
                {g.name}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  {g.items.length} {g.items.length === 1 ? 'item' : 'items'}
                </Text>
                {g.isOpen != null && (
                  <Text style={[styles.statusText, g.isOpen ? styles.statusOpen : styles.statusClosed]}>
                    {g.isOpen ? 'Open' : 'Closed'}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View style={styles.itemsWrap}>
            {g.items.slice(0, MAX_ITEMS_PER_CARD).map((item, i) => (
              <ItemRow key={item.id || `${item.name}-${i}`} item={item} />
            ))}
            {g.items.length > MAX_ITEMS_PER_CARD ? (
              <Text style={styles.moreText}>
                +{g.items.length - MAX_ITEMS_PER_CARD} more items
              </Text>
            ) : null}
          </View>
          {g.id ? <View style={styles.btnWrap}>{openButton(() => router.push(`/(customer)/restaurant/${g.id}` as any))}</View> : null}
        </View>
      ))}
    </View>
  );
};

const MenuCard = ({ menu }: { menu: MenuData }) => {
  const items: MenuItemData[] = [];
  for (const c of menu.categories || []) {
    for (const i of c.items || []) {
      items.push({ ...i, categoryName: c.categoryName } as MenuItemData);
    }
  }
  const go = () => {
    if (menu.restaurantId) router.push(`/(customer)/restaurant/${menu.restaurantId}` as any);
  };
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {logoView(menu.restaurantLogoUrl, menu.restaurantName)}
        <View style={styles.cardHeaderText}>
          <Text numberOfLines={1} style={styles.cardTitle}>
            {menu.restaurantName || 'Restaurant'}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {items.length} {items.length === 1 ? 'item' : 'items'} on menu
            </Text>
            {menu.isOpen != null && (
              <Text style={[styles.statusText, menu.isOpen ? styles.statusOpen : styles.statusClosed]}>
                {menu.isOpen ? 'Open' : 'Closed'}
              </Text>
            )}
          </View>
        </View>
      </View>
      <View style={styles.itemsWrap}>
        {items.slice(0, MAX_ITEMS_PER_CARD).map((item, i) => (
          <View key={`${item.name}-${i}`}>
            {item.categoryName ? (
              <Text style={styles.categoryLabel}>{item.categoryName}</Text>
            ) : null}
            <ItemRow item={item} />
          </View>
        ))}
        {items.length > MAX_ITEMS_PER_CARD ? (
          <Text style={styles.moreText}>+{items.length - MAX_ITEMS_PER_CARD} more items</Text>
        ) : null}
      </View>
      {menu.restaurantId ? <View style={styles.btnWrap}>{openButton(go)}</View> : null}
    </View>
  );
};

const OrderCard = ({ order }: { order: OrderData }) => {
  const go = () => {
    if (order.id) router.push(`/(customer)/order/${order.id}` as any);
  };
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {logoView(undefined, order.restaurantName)}
        <View style={styles.cardHeaderText}>
          <Text numberOfLines={1} style={styles.cardTitle}>
            {order.restaurantName || 'Order'}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Order #{order.id ? order.id.slice(0, 8).toUpperCase() : '—'}
            </Text>
          </View>
        </View>
        <Text style={[styles.statusText, styles.statusOpen]}>{order.status || 'Placed'}</Text>
      </View>
      {order.totalAmount != null && (
        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>Total</Text>
          <Text style={styles.totalText}>Rs. {Number(order.totalAmount).toLocaleString()}</Text>
        </View>
      )}
      {order.id ? <View style={styles.btnWrap}>{openButton(go)}</View> : null}
    </View>
  );
};

export const ChatCards = ({ data }: Props) => {
  if (!data) return null;
  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled horizontal={false}>
        {data.menu ? <MenuCard menu={data.menu} /> : null}
        {data.menuItems && data.menuItems.length ? <MenuItemsCard items={data.menuItems} /> : null}
        {data.restaurants && data.restaurants.length
          ? (
            <View style={styles.stack}>
              {data.restaurants.map((r, i) => (
                <View key={r.id || i} style={{ marginBottom: i === data.restaurants!.length - 1 ? 0 : 8 }}>
                  <RestaurantCard restaurant={r} />
                </View>
              ))}
            </View>
          ) : null}
        {data.orders && data.orders.length
          ? (
            <View style={styles.stack}>
              {data.orders.map((o, i) => (
                <View key={o.id || i} style={{ marginBottom: i === data.orders!.length - 1 ? 0 : 8 }}>
                  <OrderCard order={o} />
                </View>
              ))}
            </View>
          ) : null}
        {data.order ? <OrderCard order={data.order} /> : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { marginTop: 6, width: '100%' },
  stack: { width: '100%' },
  card: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    ...Shadow.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoWrap: {
    backgroundColor: Colors.primaryBg,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoInitial: { fontWeight: '800' as const, color: Colors.primary },
  cardHeaderText: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 13, fontWeight: '800' as const, color: Colors.textDark, letterSpacing: -0.2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  metaText: { fontSize: 10.5, color: Colors.textSecondary, fontWeight: '500' as const, flexShrink: 1 },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.ratingGold,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radius.full,
  },
  ratingText: { fontSize: 9, fontWeight: '800' as const, color: '#FFFFFF' },
  statusText: { fontSize: 9.5, fontWeight: '800' as const, letterSpacing: 0.3 },
  statusOpen: { color: Colors.success },
  statusClosed: { color: Colors.error },
  itemsWrap: { marginTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#F1F5F9', paddingTop: 6 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 3 },
  itemName: { fontSize: 11.5, color: Colors.textDark, fontWeight: '600' as const, flex: 1, paddingRight: 8 },
  itemPrice: { fontSize: 11.5, color: Colors.primary, fontWeight: '800' as const },
  categoryLabel: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    marginTop: 4,
    marginBottom: 1,
    textTransform: 'uppercase' as const,
  },
  moreText: { fontSize: 10, color: Colors.textTertiary, fontWeight: '600' as const, marginTop: 3 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },
  footerText: { fontSize: 10.5, color: Colors.textSecondary, fontWeight: '600' as const },
  totalText: { fontSize: 12, fontWeight: '800' as const, color: Colors.textDark },
  btnWrap: { alignItems: 'flex-end', marginTop: 8 },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    ...Shadow.primary,
    minWidth: 64,
  },
  openText: { fontSize: 11, fontWeight: '800' as const, color: '#FFFFFF', letterSpacing: 0.3 },
});