import React from 'react';
import GuideListScreen from '@/components/guide-list-screen';

export default function FungiGuidePage() {
  // Define the parameters for this specific screen
  const routeParams = {
    params: {
      screenName: 'guide_fungi', // The API key from ApiContext.tsx
      title: 'Fungi',            // The title to display on the screen
    },
  };

  return <GuideListScreen route={routeParams} />;
}