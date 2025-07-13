import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Modal, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import MonitorPanel from './components/MonitorView';
import NotificationPanel from './components/NotificationPanel';
import HomeScreen from './components/HomeScreen';
import WelcomeScreen from './components/WelcomeScreen';
import AdminLoginPopup from './components/AdminLoginPopup';
import AdminPanel from './components/AdminPanel';
import BottomNavBar from './components/BottomNavBar';
import TutorialComponent from './components/TutorialComponent';
import RatingPanel from './components/rating';
import { Ionicons } from '@expo/vector-icons';

const App: React.FC = () => {
  const [screen, setScreen] = useState<'home' | 'adminlogin' | 'adminpanel' | 'monitor' | 'notifications' | 'rating'>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [cameras, setCameras] = useState<{ name: string; streamUrl: string }[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Check authentication status from AsyncStorage
  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedAuth = await AsyncStorage.getItem('isAuthenticated');
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      }
    };
    checkAuthStatus();
  }, []);

  const handleWelcomeComplete = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setShowWelcome(false));
  };

  const handleLogin = async (password: string) => {
    if (password === 'admin123') {
      await AsyncStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      setScreen('adminpanel');
    } else {
      alert('Incorrect Password');
    }
  };

  const addCamera = (name: string, streamUrl: string) => {
    setCameras((prevCameras) => [...prevCameras, { name, streamUrl }]);
  };

  const removeCamera = (name: string) => {
    setCameras((prevCameras) => prevCameras.filter((camera) => camera.name !== name));
  };

  return (
    <View style={styles.container}>
      {showWelcome ? (
        <WelcomeScreen onAnimationComplete={handleWelcomeComplete} />
      ) : (
        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          <View style={styles.foreground}>
            {screen === 'home' && <HomeScreen setScreen={setScreen} />}

            {screen === 'adminlogin' && (
              isAuthenticated ? (
                setScreen('adminpanel')
              ) : (
                <AdminLoginPopup goBack={() => setScreen('home')} onLogin={handleLogin} />
              )
            )}

            {screen === 'adminpanel' && isAuthenticated && (
              <AdminPanel
                goBack={() => setScreen('home')}
                isAuthenticated={isAuthenticated}
                addCamera={addCamera}
                removeCamera={removeCamera}
                cameras={cameras}
              />
            )}

            {screen === 'monitor' && <MonitorPanel goBack={() => setScreen('home')} />}
            {screen === 'notifications' && <NotificationPanel goBack={() => setScreen('home')} />}
            {screen === 'rating' && <RatingPanel goBack={() => setScreen('home')} />}
          </View>

          {/* Bottom Navigation Bar */}
          {screen !== 'adminlogin' && screen !== 'adminpanel' && (
            <BottomNavBar setScreen={setScreen} setShowTutorial={setShowTutorial} />
          )}

          {/* Tutorial Modal */}
          <Modal
            visible={showTutorial}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowTutorial(false)}
          >
            <View style={styles.modalContainer}>
              <TutorialComponent />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowTutorial(false)}
              >
                <Ionicons name="close" size={30} color="#fff" />
              </TouchableOpacity>
            </View>
          </Modal>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001f20',
  },
  mainContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foreground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 20,
  },
});

export default App;
