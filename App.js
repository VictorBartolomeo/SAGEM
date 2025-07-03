import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [location, setLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [points, setPoints] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPointName, setNewPointName] = useState('');
  const [tempCoordinate, setTempCoordinate] = useState(null);
  const [showCoordModal, setShowCoordModal] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  useEffect(() => {
    startLocationTracking();
  }, []);

  const startLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (loc) => {
          setLocation(loc);
          setMapRegion({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
        }
    );
  };

  const handleMapPress = (event) => {
    setTempCoordinate(event.nativeEvent.coordinate);
    setShowModal(true);
  };

  const savePoint = () => {
    if (!newPointName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom');
      return;
    }

    const newPoint = {
      id: Date.now().toString(),
      coordinate: tempCoordinate,
      name: newPointName.trim(),
    };

    setPoints([...points, newPoint]);
    setShowModal(false);
    setNewPointName('');
    setTempCoordinate(null);
  };

  const saveManualPoint = () => {
    if (!newPointName.trim() || !manualLat || !manualLng) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    const coordinate = {
      latitude: parseFloat(manualLat),
      longitude: parseFloat(manualLng),
    };

    const newPoint = {
      id: Date.now().toString(),
      coordinate,
      name: newPointName.trim(),
    };

    setPoints([...points, newPoint]);
    setShowCoordModal(false);
    setNewPointName('');
    setManualLat('');
    setManualLng('');
  };

  return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

        {/* En-tête avec position */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MyGeoApp</Text>
          {location && (
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>
                  📍 {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                </Text>
                <Text style={styles.accuracyText}>
                  Précision: {location.coords.accuracy?.toFixed(1)}m
                </Text>
              </View>
          )}
        </View>

        {/* Carte */}
        <View style={styles.mapContainer}>
          {mapRegion ? (
              <MapView
                  style={styles.map}
                  region={mapRegion}
                  onPress={handleMapPress}
                  showsUserLocation={false}
                  showsMyLocationButton={false}
              >
                {/* Position actuelle */}
                {location && (
                    <>
                      <Marker
                          coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                          }}
                          title="Ma position"
                          pinColor="red"
                      />
                      <Circle
                          center={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                          }}
                          radius={location.coords.accuracy || 5}
                          strokeWidth={1}
                          strokeColor="rgba(74, 144, 226, 0.5)"
                          fillColor="rgba(74, 144, 226, 0.2)"
                      />
                    </>
                )}

                {/* Points personnalisés */}
                {points.map((point) => (
                    <Marker
                        key={point.id}
                        coordinate={point.coordinate}
                        title={point.name}
                        pinColor="blue"
                    />
                ))}
              </MapView>
          ) : (
              <View style={styles.loadingContainer}>
                <Text>Chargement de la carte...</Text>
              </View>
          )}
        </View>

        {/* Bouton + flottant */}
        <TouchableOpacity
            style={styles.fab}
            onPress={() => setShowCoordModal(true)}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

        {/* Modal pour point cliqué */}
        <Modal
            visible={showModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Nouveau Point</Text>

              <TextInput
                  style={styles.input}
                  placeholder="Nom du point"
                  value={newPointName}
                  onChangeText={setNewPointName}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setShowModal(false)}
                >
                  <Text style={styles.buttonText}>Annuler</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={savePoint}
                >
                  <Text style={styles.buttonText}>Sauvegarder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal pour coordonnées manuelles */}
        <Modal
            visible={showCoordModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowCoordModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Ajouter un Point</Text>

              <TextInput
                  style={styles.input}
                  placeholder="Nom du point"
                  value={newPointName}
                  onChangeText={setNewPointName}
              />

              <TextInput
                  style={styles.input}
                  placeholder="Latitude"
                  value={manualLat}
                  onChangeText={setManualLat}
                  keyboardType="numeric"
              />

              <TextInput
                  style={styles.input}
                  placeholder="Longitude"
                  value={manualLng}
                  onChangeText={setManualLng}
                  keyboardType="numeric"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setShowCoordModal(false)}
                >
                  <Text style={styles.buttonText}>Annuler</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={saveManualPoint}
                >
                  <Text style={styles.buttonText}>Ajouter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    textAlign: 'center',
  },
  locationInfo: {
    marginTop: 10,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '500',
  },
  accuracyText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    margin: 10,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: width * 0.85,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  saveButton: {
    backgroundColor: '#1976d2',
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});