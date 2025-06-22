import React from 'react';
import GuideListScreen from '@/components/guide-list-screen';

export default function TreesAndShrubsGuidePage() {
  // Define the parameters for this specific screen
  const routeParams = {
    params: {
      screenName: 'guide_track', // The API key from ApiContext.tsx
      title: 'Track',            // The title to display on the screen
    },
  };

  return <GuideListScreen route={routeParams} />;
}