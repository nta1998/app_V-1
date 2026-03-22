import { View, Text, StyleSheet, Platform } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { type Project } from '../../services/api';

// react-native-maps doesn't support web — conditionally require it
const MapView = Platform.OS !== 'web' ? require('react-native-maps').default : null;
const Marker = Platform.OS !== 'web' ? require('react-native-maps').Marker : null;
const Callout = Platform.OS !== 'web' ? require('react-native-maps').Callout : null;

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a1709' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1709' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a7d5a' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2a2616' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#6b5e3e' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#221f10' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#2a2616' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#8a7d5a' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#2a3a1a' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b8a3e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2616' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1709' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a3520' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#2a2616' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#c8a455' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2a2616' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#8a7d5a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0d07' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4a4530' }] },
];

// Default region: Israel center
const INITIAL_REGION = {
  latitude: 32.0853,
  longitude: 34.7818,
  latitudeDelta: 1.8,
  longitudeDelta: 1.2,
};

type GeoProject = Project & { latitude: number; longitude: number };

const RealMap = React.forwardRef<any, { projects: Project[]; isDark: boolean }>(
  function RealMap({ projects, isDark }, ref) {
    const [geoProjects, setGeoProjects] = useState<GeoProject[]>([]);

    useEffect(() => {
      if (projects.length === 0) return;
      let cancelled = false;

      (async () => {
        const results: GeoProject[] = [];
        for (const p of projects) {
          if (!p.project_address) continue;
          try {
            const coords = await Location.geocodeAsync(p.project_address);
            if (coords.length > 0 && !cancelled) {
              results.push({ ...p, latitude: coords[0].latitude, longitude: coords[0].longitude });
            }
          } catch {
            // skip projects that fail to geocode
          }
        }
        if (!cancelled) setGeoProjects(results);
      })();

      return () => { cancelled = true; };
    }, [projects]);

    if (Platform.OS === 'web' || !MapView) {
      return (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1a1709', alignItems: 'center', justifyContent: 'center' }]}>
          <Ionicons name="map-outline" size={48} color="#8a7d5a" />
          <Text style={{ color: '#8a7d5a', marginTop: 8, fontSize: 14 }}>Map not available on web</Text>
        </View>
      );
    }

    return (
      <MapView
        ref={ref}
        style={StyleSheet.absoluteFill}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={isDark ? DARK_MAP_STYLE : []}
      >
        {Marker && geoProjects.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            pinColor="#c8a455"
          >
            {Callout && (
              <Callout onPress={() => router.push(`/project/${p.id}` as never)}>
                <View style={{ padding: 8, maxWidth: 200 }}>
                  <Text style={{ fontWeight: '700', fontSize: 14, textAlign: 'right' }}>{p.title}</Text>
                  <Text style={{ fontSize: 12, color: '#666', textAlign: 'right' }}>{p.project_address}</Text>
                  <Text style={{ fontSize: 12, color: '#c8a455', marginTop: 4 }}>{p.percentage}% הושלם</Text>
                </View>
              </Callout>
            )}
          </Marker>
        ))}
      </MapView>
    );
  }
);

export default RealMap;
