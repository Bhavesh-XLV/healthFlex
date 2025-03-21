import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ListOfCategory = () => {
  const [data, setData] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [timers, setTimers] = useState<
    {
      name: string;
      totalduration: number;
      category: string;
      status: string;
      remainingDuration: number;
      intervalId?: NodeJS.Timeout;
    }[]
  >([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const categoryData = await AsyncStorage.getItem('ListOfCategory');
        if (categoryData) {
          setData(JSON.parse(categoryData));
        }
        const storedTimers = await AsyncStorage.getItem('Timers');
        if (storedTimers) {
          setTimers(
            JSON.parse(storedTimers).map((timer: any) => ({
              ...timer,
            })),
          );
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    getData();
  }, []);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleStart = (timer: any) => {
    if (timer.intervalId) return;

    const intervalId = setInterval(async () => {
      let newTimers: any;
      setTimers(prevTimers => {
        newTimers = prevTimers.map(t => {
          if (t.name === timer.name) {
            const newTime = t.remainingDuration - 1;

            if (newTime <= 0) {
              clearInterval(intervalId);
              const updatedTimer = {
                ...t,
                remainingDuration: 0,
                status: 'Completed',
                intervalId: undefined,
              };

              Alert.alert(
                'Congratulation',
                `${t.name} of ${t.category} is completed`,
              );

              // Save updated status to AsyncStorage
              AsyncStorage.setItem('Timers', JSON.stringify(newTimers));

              return updatedTimer;
            }

            return {...t, remainingDuration: newTime};
          }
          return t;
        });

        return newTimers;
      });

      try {
        await AsyncStorage.setItem('Timers', JSON.stringify(newTimers));
      } catch (error) {
        console.error('Error updating timer status:', error);
      }
    }, 1000);

    setTimers(prevTimers =>
      prevTimers.map(t =>
        t.name === timer.name ? {...t, status: 'In Progress', intervalId} : t,
      ),
    );
  };

  const handlePause = async (timer: any) => {
    if (timer.intervalId) {
      clearInterval(timer.intervalId);
    }

    let updatedTimers;

    setTimers(prevTimers => {
      updatedTimers = prevTimers.map(t =>
        t.name === timer.name
          ? {
              ...t,
              status: 'Paused',
              intervalId: undefined,
            }
          : t,
      );
      return updatedTimers;
    });

    try {
      await AsyncStorage.setItem('Timers', JSON.stringify(updatedTimers));
    } catch (error) {
      console.error('Error saving paused timer:', error);
    }
  };

  const handleReset = async (timer: any) => {
    if (timer.intervalId) {
      clearInterval(timer.intervalId);
    }

    let updatedTimers;

    setTimers(prevTimers => {
      updatedTimers = prevTimers.map(t =>
        t.name === timer.name
          ? {
              ...t,
              remainingDuration: t.totalduration,
              status: 'N/A',
              intervalId: undefined,
            }
          : t,
      );

      return updatedTimers;
    });

    try {
      await AsyncStorage.setItem('Timers', JSON.stringify(updatedTimers));
    } catch (error) {
      console.error('Error saving reset timer:', error);
    }
  };

  const groupedTimers = timers.reduce<{
    [key: string]: {
      name: string;
      totalduration: number;
      category: string;
      status: string;
      remainingDuration: number;
    }[];
  }>((acc, timer) => {
    if (!acc[timer.category]) acc[timer.category] = [];
    acc[timer.category].push(timer);
    return acc;
  }, {});

  const addCategory = async () => {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    const isDuplicate = data.some(
      item => item.toLowerCase() === trimmedText.toLowerCase(),
    );
    if (isDuplicate) {
      Alert.alert('Duplicate Category', 'This category is already added.');
      return;
    }
    const updatedData = [...data, trimmedText];
    setData(updatedData);
    setModalVisible(false);
    setText('');
    try {
      await AsyncStorage.setItem('ListOfCategory', JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleBulkAction = (
    action: 'start' | 'pause' | 'reset',
    category: string,
  ) => {
    setTimers(prevTimers =>
      prevTimers.map(timer => {
        if (timer.category === category) {
          if (action === 'start' && !timer.intervalId) {
            const intervalId = setInterval(() => {
              setTimers(prevTimers =>
                prevTimers.map(t => {
                  if (t.name === timer.name) {
                    const newTime = t.remainingDuration - 1;
                    if (newTime <= 0) {
                      clearInterval(intervalId);
                      return {
                        ...t,
                        remainingDuration: 0,
                        status: 'Completed',
                        intervalId: undefined,
                      };
                    }
                    return {...t, remainingDuration: newTime};
                  }
                  return t;
                }),
              );
            }, 1000);
            return {...timer, status: 'In Progress', intervalId};
          }

          if (action === 'pause' && timer.intervalId) {
            clearInterval(timer.intervalId);
            return {...timer, status: 'Paused', intervalId: undefined};
          }

          if (action === 'reset') {
            if (timer.intervalId) clearInterval(timer.intervalId);
            return {
              ...timer,
              remainingDuration: timer.totalduration,
              status: 'N/A',
              intervalId: undefined,
            };
          }
        }
        return timer;
      }),
    );
  };

  return (
    <View style={{flex: 1, padding: 20}}>
      <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 10}}>
        Timer List
      </Text>
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item: category}) => (
          <View>
            <TouchableOpacity
              onPress={() => toggleCategory(category)}
              style={{backgroundColor: '#ddd', padding: 10, marginVertical: 5}}>
              <Text
                style={{fontSize: 16, fontWeight: 'bold', textAlign: 'center'}}>
                {category}
              </Text>
            </TouchableOpacity>
            {expandedCategories[category] && (
              <FlatList
                data={groupedTimers[category] || []}
                keyExtractor={timer => timer.name}
                ListEmptyComponent={
                  <Text style={{textAlign: 'center', marginTop: 10}}>
                    No data available in this category
                  </Text>
                }
                ListHeaderComponent={
                  groupedTimers[category] && (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        padding: 10,
                        backgroundColor: '#f5f5f5',
                      }}>
                      <TouchableOpacity
                        onPress={() => handleBulkAction('start', category)}
                        style={{
                          backgroundColor: 'green',
                          padding: 10,
                          borderRadius: 5,
                        }}>
                        <Text style={{color: 'white', fontWeight: 'bold'}}>
                          Start All
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleBulkAction('pause', category)}
                        style={{
                          backgroundColor: 'orange',
                          padding: 10,
                          borderRadius: 5,
                        }}>
                        <Text style={{color: 'white', fontWeight: 'bold'}}>
                          Pause All
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleBulkAction('reset', category)}
                        style={{
                          backgroundColor: 'red',
                          padding: 10,
                          borderRadius: 5,
                        }}>
                        <Text style={{color: 'white', fontWeight: 'bold'}}>
                          Reset All
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )
                }
                renderItem={({item}) => {
                  const progress =
                    (item.remainingDuration / item.totalduration) * 100;
                  return (
                    <View style={{padding: 10, borderBottomWidth: 1}}>
                      <Text>Name: {item.name}</Text>
                      <Text>Remaining Time: {item.remainingDuration}s</Text>
                      <Text>Status: {item.status}</Text>
                      <View style={{flexDirection: 'row', marginTop: 10}}>
                        <TouchableOpacity
                          onPress={() => handleStart(item)}
                          style={{
                            marginRight: 10,
                            padding: 5,
                            backgroundColor: 'green',
                          }}>
                          <Text style={{color: 'white'}}>Start</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handlePause(item)}
                          style={{
                            marginRight: 10,
                            padding: 5,
                            backgroundColor: 'orange',
                          }}>
                          <Text style={{color: 'white'}}>Pause</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleReset(item)}
                          style={{padding: 5, backgroundColor: 'red'}}>
                          <Text style={{color: 'white'}}>Reset</Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={{
                          width: '100%',
                          height: 10,
                          backgroundColor: '#ddd',
                          borderRadius: 5,
                          marginTop: 5,
                        }}>
                        <View
                          style={{
                            width: `${100 - progress}%`,
                            height: '100%',
                            backgroundColor: 'green',
                            borderRadius: 5,
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: 'bold',
                          textAlign: 'right',
                          marginTop: 2,
                        }}>
                        {progress.toFixed(1)}%
                      </Text>
                    </View>
                  );
                }}
              />
            )}
          </View>
        )}
      />
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          height: 50,
          width: 50,
          borderRadius: 25,
          backgroundColor: 'red',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          bottom: 30,
          right: 30,
          zIndex: 1,
        }}>
        <Text style={{color: 'white', fontWeight: 'bold'}}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
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
            <Text style={{textAlign: 'center', fontSize: 18, marginBottom: 10}}>
              Add Category
            </Text>
            <TextInput
              style={{
                height: 40,
                borderWidth: 1,
                borderColor: 'gray',
                borderRadius: 5,
                paddingHorizontal: 10,
                marginBottom: 10,
              }}
              placeholder="Enter category"
              value={text}
              onChangeText={setText}
            />
            <TouchableOpacity
              style={{
                backgroundColor: 'red',
                padding: 10,
                borderRadius: 5,
                alignItems: 'center',
              }}
              onPress={addCategory}>
              <Text style={{color: 'white', fontWeight: 'bold'}}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: 'red',
                padding: 10,
                borderRadius: 5,
                alignItems: 'center',
                marginTop: 10,
              }}
              onPress={() => setModalVisible(false)}>
              <Text style={{color: 'white', fontWeight: 'bold'}}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ListOfCategory;
