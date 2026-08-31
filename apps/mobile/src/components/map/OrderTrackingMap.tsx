import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import { OrderTrackingData } from '@/types/tracking.types';

interface OrderTrackingMapProps {
  data: OrderTrackingData | null;
  isLoading: boolean;
  onReady?: () => void;
}

export const OrderTrackingMap = ({ data, isLoading, onReady }: OrderTrackingMapProps) => {
  const webViewRef = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);
  const lastDriverPos = useRef<[number, number] | null>(null);

  // Generate initial HTML once - uses data at mount for centering
  const initialHTML = useMemo(() => {
    const center: [number, number] =
      data?.restaurant?.lat && data?.restaurant?.lng
        ? [data.restaurant.lat, data.restaurant.lng]
        : data?.delivery?.lat && data?.delivery?.lng
          ? [data.delivery.lat, data.delivery.lng]
          : [27.7172, 85.324]; // Kathmandu

    // Only initial markers: restaurant + delivery; driver added dynamically
    const restaurant = data?.restaurant;
    const delivery = data?.delivery;

    return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  body { margin:0; padding:0; }
  #map { width:100vw; height:100vh; }
  .marker-icon { background:transparent; border:none; font-size:32px; text-align:center; line-height:40px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
  .marker-icon-driver { font-size:42px; animation: pulse 1.5s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { transform:scale(1);} 50% { transform:scale(1.15);} }
  .leaflet-popup-content { font-size:13px; font-weight:600; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', { center:[${center[0]}, ${center[1]}], zoom:13, zoomControl:false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'&copy; OSM', maxZoom:19 }).addTo(map);
  window.map = map;

  var restaurantMarker = null;
  var deliveryMarker = null;
  var driverMarker = null;
  var routeLine = null;
  var historyLine = null;

  // Helpers
  function makeIcon(html, isDriver){
    return L.divIcon({ className: isDriver ? 'marker-icon marker-icon-driver' : 'marker-icon', html: html, iconSize:[40,40], iconAnchor:[20,40] });
  }

  // Initial restaurant + delivery
  ${restaurant ? `restaurantMarker = L.marker([${restaurant.lat}, ${restaurant.lng}], {icon: makeIcon('📍', false)}).addTo(map).bindPopup('${restaurant.name || 'Restaurant'}');` : ''}
  ${delivery ? `deliveryMarker = L.marker([${delivery.lat}, ${delivery.lng}], {icon: makeIcon('🏠', false)}).addTo(map).bindPopup('Delivery: ${(delivery.address || 'Customer').replace(/'/g, "\\'")}');` : ''}

  // Fit bounds initially
  (function(){
    var points = [];
    ${restaurant ? `points.push([${restaurant.lat}, ${restaurant.lng}]);` : ''}
    ${delivery ? `points.push([${delivery.lat}, ${delivery.lng}]);` : ''}
    if(points.length>1){ map.fitBounds(L.latLngBounds(points), {padding:[60,60], maxZoom:16}); }
  })();

  window.updateDriverLocation = function(lat,lng, heading, speed, isOnline){
    var pos = [lat,lng];
    if(!driverMarker){
      driverMarker = L.marker(pos, {icon: makeIcon('🚗', true)}).addTo(map).bindPopup('Driver');
    } else {
      driverMarker.setLatLng(pos);
    }
    if(heading !== null && heading !== undefined){
      // rotate visual if needed - use CSS transform on icon
      var el = driverMarker.getElement();
      if(el){ el.style.transform = el.style.transform + ' rotate(' + heading + 'deg)'; }
    }
    // auto follow driver if map is near driver (within ~0.02 deg)
    // keep manual pan respected - we just ensure driver visible if far
  };

  window.updateRoute = function(geometry){
    if(routeLine){ map.removeLayer(routeLine); routeLine=null; }
    if(geometry && geometry.length>1){
      var latlngs = geometry.map(function(p){ return [p[0], p[1]]; });
      routeLine = L.polyline(latlngs, {color:'#E23744', weight:5, opacity:0.9, lineJoin:'round'}).addTo(map);
    }
  };

  window.updateHistory = function(points){
    if(historyLine){ map.removeLayer(historyLine); historyLine=null; }
    if(points && points.length>1){
      var latlngs = points.map(function(p){ return [p.lat, p.lng]; });
      historyLine = L.polyline(latlngs, {color:'#22C55E', weight:3, opacity:0.6, dashArray:'6 8'}).addTo(map);
    }
  };

  window.fitAll = function(){
    var pts = [];
    if(restaurantMarker) pts.push(restaurantMarker.getLatLng());
    if(deliveryMarker) pts.push(deliveryMarker.getLatLng());
    if(driverMarker) pts.push(driverMarker.getLatLng());
    if(routeLine){
      try{ pts = pts.concat(routeLine.getLatLngs()); }catch(e){}
    }
    if(pts.length>0){ map.fitBounds(L.latLngBounds(pts), {padding:[50,50], maxZoom:17}); }
  };
  window.fitDriver = function(){
    if(driverMarker) map.setView(driverMarker.getLatLng(), 16, {animate:true});
  };
  window.zoomIn = function(){ map.zoomIn(1); };
  window.zoomOut = function(){ map.zoomOut(1); };

  window.ReactNativeWebView.postMessage(JSON.stringify({type:'ready'}));
  document.addEventListener('message', function(e){ handleMsg(e.data); });
  window.addEventListener('message', function(e){ handleMsg(e.data); });
  function handleMsg(raw){
    try{
      var d = JSON.parse(raw);
      if(d.type==='updateDriver') window.updateDriverLocation(d.lat,d.lng,d.heading,d.speed,d.isOnline);
      if(d.type==='updateRoute') window.updateRoute(d.geometry);
      if(d.type==='updateHistory') window.updateHistory(d.points);
      if(d.type==='fitAll') window.fitAll();
      if(d.type==='fitDriver') window.fitDriver();
    }catch(err){}
  }
</script>
</body>
</html>`;
  }, []); // once

  const handleMessage = (event: any) => {
    try {
      const d = JSON.parse(event.nativeEvent.data);
      if (d.type === 'ready') {
        setMapReady(true);
        onReady?.();
      }
    } catch {}
  };

  // Live update driver when data changes (inject JS)
  useEffect(() => {
    if (!mapReady || !data?.driver) return;
    const { latitude, longitude, heading, speed, isOnline } = data.driver;
    if (lastDriverPos.current?.[0] === latitude && lastDriverPos.current?.[1] === longitude) return;
    lastDriverPos.current = [latitude, longitude];
    const js = `window.updateDriverLocation(${latitude}, ${longitude}, ${heading ?? 'null'}, ${speed ?? 'null'}, ${isOnline}); true;`;
    webViewRef.current?.injectJavaScript(js);
  }, [data?.driver, mapReady]);

  useEffect(() => {
    if (!mapReady || !data?.route?.geometry) return;
    const js = `window.updateRoute(${JSON.stringify(data.route.geometry)}); true;`;
    webViewRef.current?.injectJavaScript(js);
  }, [data?.route?.geometry, mapReady]);

  useEffect(() => {
    if (!mapReady || !data?.history?.length) return;
    const js = `window.updateHistory(${JSON.stringify(data.history)}); true;`;
    webViewRef.current?.injectJavaScript(js);
  }, [data?.history, mapReady]);

  const inject = (js: string) => webViewRef.current?.injectJavaScript(js + '; true;');

  if (isLoading || !data) {
    return (
      <View className="items-center justify-center flex-1 bg-gray-50">
        <ActivityIndicator size="large" color="#E23744" />
        <Text className="mt-4 text-sm text-gray-500">Loading map…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <WebView
        ref={webViewRef}
        source={{ html: initialHTML }}
        onMessage={handleMessage}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View className="items-center justify-center flex-1 bg-gray-50">
            <ActivityIndicator size="large" color="#E23744" />
          </View>
        )}
      />

      {/* Controls */}
      <View className="absolute gap-2 bottom-28 right-4">
        <TouchableOpacity className="items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-full shadow-md" onPress={() => inject('window.zoomIn()')}>
          <Feather name="plus" size={20} color="#1A1A1A" />
        </TouchableOpacity>
        <TouchableOpacity className="items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-full shadow-md" onPress={() => inject('window.zoomOut()')}>
          <Feather name="minus" size={20} color="#1A1A1A" />
        </TouchableOpacity>
        <TouchableOpacity className="items-center justify-center w-12 h-12 shadow-md bg-primary rounded-full" onPress={() => inject('window.fitDriver()')}>
          <Feather name="crosshair" size={20} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity className="items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-full shadow-md" onPress={() => inject('window.fitAll()')}>
          <Feather name="maximize-2" size={18} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {/* Driver Status / ETA */}
      {data?.driver && (
        <View className="absolute p-4 bg-white border border-gray-100 shadow-lg bottom-4 left-4 right-4 rounded-2xl">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className={`w-2.5 h-2.5 rounded-full ${data.driver.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <Text className="text-sm font-semibold text-black">{data.driver.isOnline ? 'Driver Online' : 'Driver Offline'}</Text>
            </View>
            {data.driver.speed !== undefined && (
              <Text className="text-xs font-medium text-gray-600">{Math.round((data.driver.speed || 0) * 3.6)} km/h</Text>
            )}
          </View>
          <View className="flex-row gap-4 mt-2">
            {data.route && (
              <>
                <Text className="text-xs text-gray-500">{(data.route.distance / 1000).toFixed(1)} km • {Math.round(data.route.duration / 60)} min</Text>
              </>
            )}
            <Text className="ml-auto text-xs text-gray-400">
              {new Date(data.driver.lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      )}

      {/* No driver yet */}
      {!data.driver && (
        <View className="absolute px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl bottom-4 left-4 right-4">
          <Text className="text-xs font-medium text-amber-800">Waiting for driver assignment…</Text>
          <Text className="text-xs text-amber-700">Map will update live once driver is on the way.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  webview: { flex: 1, backgroundColor: '#F8F9FB' },
});
