import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Dimensions } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';

// Obtenez les dimensions de l'écran pour la carte
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.005; // Zoom plus proche pour une meilleure vue de la géolocalisation
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);

  useEffect(() => {
    (async () => {
      // 1. Demander la permission de localisation
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // 2. Commencer à observer la position
      const subscriber = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation, // Haute précision
            timeInterval: 1000, // Mettre à jour chaque seconde
            distanceInterval: 1, // Mettre à jour si la position change d'au moins 1 mètre
          },
          (loc) => {
            // Mettre à jour la position actuelle
            setLocation(loc);

            // Mettre à jour la région de la carte pour suivre l'utilisateur
            setMapRegion({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            });
          }
      );

      // Nettoyer le souscripteur lorsque le composant est démonté
      return () => {
        if (subscriber) {
          subscriber.remove();
        }
      };
    })();
  }, []); // Le tableau vide assure que l'effet ne s'exécute qu'une fois au montage

  let text = 'Waiting for location...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Latitude: ${location.coords.latitude}, Longitude: ${location.coords.longitude}\nAccuracy: ${location.coords.accuracy}m`;
  }

  return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>{text}</Text>
        {mapRegion ? (
            <MapView
                style={styles.map}
                initialRegion={mapRegion} // Région initiale au démarrage
                region={mapRegion} // Permet à la carte de suivre la position (centrée sur l'utilisateur)
                showsUserLocation={false} // On va afficher notre propre marqueur pour plus de contrôle
                // loadingEnabled={true} // Affiche un indicateur de chargement si la carte met du temps
                // Si vous voulez un style de carte spécifique, par exemple Google Maps
                // provider={MapView.PROVIDER_GOOGLE} // Nécessite la clé API dans app.json pour Android
            >
              {location && (
                  <>
                    {/* Marqueur de la position actuelle */}
                    <Marker
                        coordinate={{
                          latitude: location.coords.latitude,
                          longitude: location.coords.longitude,
                        }}
                        title="You are here"
                        description={`Accuracy: ${location.coords.accuracy}m`}
                    />
                    {/* Cercle d'incertitude autour de la position */}
                    <Circle
                        center={{
                          latitude: location.coords.latitude,
                          longitude: location.coords.longitude,
                        }}
                        radius={location.coords.accuracy || 1} // Utilisez l'exactitude comme rayon
                        strokeWidth={1}
                        strokeColor={'rgba(0,0,255,0.5)'}
                        fillColor={'rgba(0,0,255,0.2)'}
                    />
                  </>
              )}
            </MapView>
        ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text>Loading Map...</Text>
            </View>
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50, // Pour éviter le notch en haut de l'écran
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: 'center',
  },
  map: {
    width: width,
    height: height * 0.8, // La carte prend 80% de la hauteur
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});