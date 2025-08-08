import React from 'react';
import GuideListScreen from '@/components/guide-list-screen';

export default function HerpsGuidePage() {
  // Define the parameters for this specific screen
  const routeParams = {
    params: {
      screenName: 'guide_herp',   // The API key from api.config.ts
      title: 'Herp',              // The title to display on the screen
    },
  };

  return <GuideListScreen route={routeParams} />;
}