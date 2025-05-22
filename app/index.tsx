import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.setOptions({
  duration: 0,
  fade: true,
});

export default function Index() {
  // Redirect to the splash screen by default
  return <Redirect href="/splash" />;
}