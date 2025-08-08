import { Stack } from 'expo-router';

export default function GuidesLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
      animation: 'fade',
    }}>
      <Stack.Screen name="mammals" />
      <Stack.Screen name="birds" />
      <Stack.Screen name="herps" />
      <Stack.Screen name="invertebrates" />
      <Stack.Screen name="trees-and-shrubs" />
      <Stack.Screen name="wildflowers" />
      <Stack.Screen name="trail-tracks" />
    </Stack>
  );
}