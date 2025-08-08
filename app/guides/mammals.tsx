import React from 'react';
import GuideListScreen from '@/components/guide-list-screen';

export default function MammalsGuidePage() {
  // Define the parameters for this specific screen
  const routeParams = {
    params: {
      screenName: 'guide_mammal', // The API key from api.config.ts
      title: 'Mammal',            // The title to display on the screen
    },
  };

  return <GuideListScreen route={routeParams} />;
}