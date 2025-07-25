import { ApiProvider } from "@/contexts/api";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, View } from "react-native";

export default function RootLayout() {
  return (
    <ApiProvider>
      <StatusBar style="auto"/>
        <Stack screenOptions={{
          headerTitle: () => (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Image
                source={require('@/assets/dev/bat-horizontal.png')}
                style={{ height: 35, width: 250, resizeMode: 'contain' }}
              />
            </View>
          ),
        }}>
          <Stack.Screen name="(tabs)"/>
          <Stack.Screen name="splash" options={{ headerShown: false }}/>
        </Stack>
    </ApiProvider>
  );
}
