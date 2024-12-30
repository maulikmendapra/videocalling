import React, { useState, useEffect, useRef } from 'react';
import { View, Button, Text, TextInput, StyleSheet } from 'react-native';
import ZegoExpressEngine from 'zego-express-engine-reactnative';
import Share from 'react-native-share';



const appID = 144919046; 
const appSignalingKey = '9077f5ac7988aa383be1ac320f8f599c';

const App = () => {
  const [state, setState] = useState({
    roomID: '',
    userID: '',
    userName: '',
    isInRoom: false,
    isScreenSharing: false,
  });

  const engine = useRef(null);

  useEffect(() => {
 
    engine.current = ZegoExpressEngine.createEngine(
      appID,
      appSignalingKey,
      false
    );

    return () => {
     
      engine.current?.logoutRoom(state.roomID);
      ZegoExpressEngine.destroyEngine();
    };
  }, []);

  const joinRoom = async () => {
    if (!engine.current) return;
    try {
      await engine.current.loginRoom(state.roomID, {
        userID: state.userID,
        userName: state.userName,
      });
      setState(prev => ({ ...prev, isInRoom: true }));
      console.log('Joined the room:', state.roomID);
    } catch (error) {
      console.error('Error joining the room:', error);
    }
  };

  const leaveRoom = async () => {
    if (!engine.current) return;
    try {
      await engine.current.logoutRoom(state.roomID);
      setState(prev => ({ ...prev, isInRoom: false }));
      console.log('Left the room:', state.roomID);
    } catch (error) {
      console.error('Error leaving the room:', error);
    }
  };

  const startScreenShare = async () => {
    if (!engine.current) return;
    try {
      const screenStream = await engine.current.startScreenCapture();
      engine.current.publishStream(screenStream);
      setState(prev => ({ ...prev, isScreenSharing: true }));
      console.log('Started screen sharing');
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  };

  const stopScreenShare = async () => {
    if (!engine.current) return;
    try {
      await engine.current.stopScreenCapture();
      setState(prev => ({ ...prev, isScreenSharing: false }));
      console.log('Stopped screen sharing');
    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  };

  const shareRoomID = async () => {
    const shareOptions = {
      title: 'Join My Live Video Call',
      message: `Hi, join me in my live video call! Here's the room ID: ${state.roomID}`,
      url: `https://myapp.com/room/${state.roomID}`,
    };
    try {
      await Share.open(shareOptions);
      console.log('Room ID shared!');
    } catch (error) {
      console.error('Error sharing room ID:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ZEGOCLOUD Live Video Call</Text>
      {!state.isInRoom ? (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter Room ID"
            value={state.roomID}
            onChangeText={text => setState(prev => ({ ...prev, roomID: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter User ID"
            value={state.userID}
            onChangeText={text => setState(prev => ({ ...prev, userID: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter User Name"
            value={state.userName}
            onChangeText={text =>
              setState(prev => ({ ...prev, userName: text }))
            }
          />
          <Button title="Join Room" onPress={joinRoom} />
        </View>
      ) : (
        <View>
          <Text>Welcome to Room {state.roomID}</Text>
          <Button title="Leave Room" onPress={leaveRoom} />
          <Button
            title={
              state.isScreenSharing ? 'Stop Screen Share' : 'Start Screen Share'
            }
            onPress={
              state.isScreenSharing ? stopScreenShare : startScreenShare
            }
          />
          <Button title="Share Room ID" onPress={shareRoomID} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  input: {
    width: '80%',
    height: 40,
    marginVertical: 10,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 10,
    fontSize: 16,
  },
});


export default App;
