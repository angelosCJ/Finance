import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Theme from './Theme';
import Main from './main';

export default function App() {
  return (
    <View style={styles.container}>
       <Theme>
        <Main/>
       </Theme>
      <StatusBar style="auto" backgroundColor='white' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
