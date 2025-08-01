import { HomeData, 
         AboutData,
         GuideData,
         SafetyData,
         RulesData,
         DonateData,
         EmergencyData,
         ReportData,
         } from '../contexts/api';

export const getBackgroundSource = (screenData: HomeData | AboutData | DonateData | GuideData | EmergencyData | RulesData | SafetyData | ReportData | null,
                                  getImagePath: (imageName: string) => string | undefined) => {
    const backgroundId = screenData?.background;

    if (backgroundId) {
    
    const localUri = getImagePath(backgroundId);
    if (localUri) {
        return { uri: localUri };
    }
    }

    return require('@/assets/dev/fallback.jpeg');
};