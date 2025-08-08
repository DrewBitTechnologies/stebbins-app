import React from 'react';
import GuideListScreen from '@/components/guide-list-screen';

export default function BirdsGuidePage() {
  // Define the parameters for this specific screen
  const routeParams = {
    params: {
      screenName: 'guide_bird',   // The API key from api.config.ts
      title: 'Bird',              // The title to display on the screen
    },
  };

  return <GuideListScreen route={routeParams} />;
}