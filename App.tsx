import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Accelerometer } from 'expo-sensors';

const { width, height } = Dimensions.get('window');
const diceSize = 100;

// @ts-ignore
const Dice = ({ delay }) => {
  const [value, setValue] = useState('?');
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const roll = () => {
    setValue('?');
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        setValue(Math.ceil(Math.random() * 6));
      }, delay);
    });
  };

  useEffect(() => {
    Accelerometer.setUpdateInterval(200);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      if (Math.abs(x) + Math.abs(y) + Math.abs(z) > 3) {
        roll();
      }
    });

    return () => subscription.remove();
  }, []);

  return (
      <Animated.View
          style={[
            styles.diceContainer,
            {
              transform: [
                {
                  translateY: shakeAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                  }),
                },
              ],
            },
          ]}
      >
        <View style={styles.dice}>
          <Text style={styles.diceNumber}>{value}</Text>
        </View>
      </Animated.View>
  );
};

export default function App() {
  const [numDice, setNumDice] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  return (
      <View style={styles.container}>
        <View style={styles.diceWrapper}>
          {Array.from({ length: numDice }).map((_, i) => (
              <Dice key={i} delay={300 * i} />
          ))}
        </View>
        <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowSettings(true)}
        >
          <Text style={styles.settingsButtonText}>Settings</Text>
        </TouchableOpacity>
        <Modal
            animationType="slide"
            transparent={false}
            visible={showSettings}
            onRequestClose={() => setShowSettings(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Number of Dice:</Text>
            <Picker
                selectedValue={numDice}
                style={styles.picker}
                onValueChange={(itemValue) => setNumDice(itemValue)}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                  <Picker.Item key={i} label={`${i + 1}`} value={i + 1} />
              ))}
            </Picker>
            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSettings(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  diceWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceContainer: {
    margin: 10,
  },
  dice: {
    width: diceSize,
    height: diceSize,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'black',
  },
  diceNumber: {
    fontSize: diceSize / 2,
    fontWeight: 'bold',
  },
  settingsButton: {
    backgroundColor: 'blue',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    position: 'absolute',
    left: 20,
    bottom: 20,
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    color: 'black',
  },
  picker: {
    height: 50,
    width: 100,
  },
  closeButton: {
    backgroundColor: 'blue',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 150,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
  },
});

