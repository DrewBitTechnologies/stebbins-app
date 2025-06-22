import React from 'react';
import GuideListScreen from '@/components/guide-list-screen';

export default function WildflowerGuidePage() {
  // Define the parameters for this specific screen
  const routeParams = {
    params: {
      screenName: 'guide_wildflower', // The API key from ApiContext.tsx
      title: 'Wildflower',            // The title to display on the screen
    },
  };

  return <GuideListScreen route={routeParams} />;
}