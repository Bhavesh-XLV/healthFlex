import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddTimer = () => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [timers, setTimers] = useState<
    {name: string; duration: number; category: string}[]
  >([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const storedCategories = await AsyncStorage.getItem('ListOfCategory');
        if (storedCategories) {
          setCategories(JSON.parse(storedCategories));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchTimers = async () => {
      try {
        const storedTimers = await AsyncStorage.getItem('Timers');
        if (storedTimers) {
          setTimers(JSON.parse(storedTimers));
        }
      } catch (error) {
        console.error('Error fetching timers:', error);
      }
    };

    fetchCategories();
    fetchTimers();
  }, []);

  const saveTimer = async () => {
    if (!name.trim() || !duration.trim() || !category) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    const newTimer = {
      name: name.trim(),
      totalduration: parseInt(duration, 10),
      remainingDuration: parseInt(duration, 10),
      category,
      status: 'N/A',
    };
    const updatedTimers: any = [...timers, newTimer];
    setTimers(updatedTimers);
    setName('');
    setDuration('');
    setCategory('');

    try {
      await AsyncStorage.setItem('Timers', JSON.stringify(updatedTimers));
    } catch (error) {
      console.error('Error saving timer:', error);
    }
  };

  return (
    <View style={{flex: 1, padding: 20}}>
      <Text style={{fontSize: 18, fontWeight: 'bold'}}>Add Timer</Text>

      <TextInput
        placeholder="Timer Name"
        style={{borderWidth: 1, padding: 10, marginVertical: 10}}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Duration (seconds)"
        keyboardType="numeric"
        style={{borderWidth: 1, padding: 10, marginVertical: 10}}
        value={duration}
        onChangeText={setDuration}
      />

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{borderWidth: 1, padding: 10, marginVertical: 10}}>
        <Text>{category || 'Select Category'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={saveTimer}
        style={{backgroundColor: 'green', padding: 10, alignItems: 'center'}}>
        <Text style={{color: 'white'}}>Save Timer</Text>
      </TouchableOpacity>

      {/* Category Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 10,
              width: 250,
            }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text
                style={{fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>
                Select a Category
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'red',
                }}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>x</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  onPress={() => {
                    setCategory(item);
                    setModalVisible(false);
                  }}
                  style={{padding: 10, borderBottomWidth: 1}}>
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddTimer;
