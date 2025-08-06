import React from 'react';
import GuideListScreen from '@/components/guide-list-screen';

export default function InvertebratesGuidePage() {
  // Define the parameters for this specific screen
  const routeParams = {
    params: {
      screenName: 'guide_invertebrate', // The API key from api.config.ts
      title: 'Invertebrate',            // The title to display on the screen
    },
  };

  return <GuideListScreen route={routeParams} />;
}