import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ListOfCategory')}
        style={styles.buttonContainer}>
        <Text style={styles.buttonText}>List of Category</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('AddTimer')}
        style={styles.buttonContainer}>
        <Text style={styles.buttonText}>Add Timer</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    height: 50,
    width: '90%',
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    margin: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
});
