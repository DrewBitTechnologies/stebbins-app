import { ApiProvider } from "@/contexts/api";
import { ReportDraftProvider } from "@/contexts/report-draft";
import AppHeader from "@/components/app-header";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ApiProvider>
      <ReportDraftProvider>
        <StatusBar style="auto"/>
          <Stack screenOptions={{
            headerTitle: () => <AppHeader />,
            animation: 'fade',
            headerShadowVisible: true,
          }}>
            <Stack.Screen name="(tabs)"/>
            <Stack.Screen name="splash" options={{ headerShown: false }}/>
          </Stack>
      </ReportDraftProvider>
    </ApiProvider>
  );
}
