import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export const useUserLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<Location.LocationGeocodedAddress | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        let geocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        if (geocode.length > 0) {
          setAddress(geocode[0]);
        }
      } catch (error) {
        setErrorMsg('Failed to fetch location');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return {
    location,
    address,
    errorMsg,
    loading,
  };
};
