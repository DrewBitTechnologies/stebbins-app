import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar"
import { Image } from "react-native"

export default function RootLayout() {
  return (
    <>
    <StatusBar style="auto"/>
      <Stack screenOptions={{
        headerTitle: () => (
          <Image
          source={require('../assets/images/splash-icon.png')}
          style={{ height: 35, resizeMode: 'contain'}}/>
        ),
      }}>
        <Stack.Screen name="(tabs)"/>
        <Stack.Screen name="splash" options={{ headerShown: false }}/>
      </Stack>
    </>
  );
}
