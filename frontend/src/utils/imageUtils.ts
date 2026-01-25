/**
 * Image utilities for managing game asset paths
 */

const IMAGE_BASE_PATH = '/images';

export const imageUtils = {
  // Hero images
  getHeroImage: (heroName: string, className: string): string => {
    return `${IMAGE_BASE_PATH}/heroes/${className.toLowerCase()}_${heroName.toLowerCase().replace(/\s+/g, '_')}.png`;
  },
  
  getHeroPlaceholder: (className: string): string => {
    return `${IMAGE_BASE_PATH}/heroes/${className.toLowerCase()}_placeholder.png`;
  },

  // Race images
  getRaceImage: (raceName: string): string => {
    return `${IMAGE_BASE_PATH}/races/${raceName.toLowerCase()}.png`;
  },

  getRaceBanner: (raceName: string): string => {
    return `${IMAGE_BASE_PATH}/races/${raceName.toLowerCase()}_banner.png`;
  },

  // Building images
  getBuildingImage: (buildingType: string, level: number = 1): string => {
    return `${IMAGE_BASE_PATH}/buildings/${buildingType.toLowerCase()}_level${level}.png`;
  },

  getBuildingIcon: (buildingType: string): string => {
    return `${IMAGE_BASE_PATH}/buildings/${buildingType.toLowerCase()}_icon.png`;
  },

  // Unit images
  getUnitImage: (unitType: string): string => {
    return `${IMAGE_BASE_PATH}/units/${unitType.toLowerCase()}.png`;
  },

  getUnitIcon: (unitType: string): string => {
    return `${IMAGE_BASE_PATH}/units/${unitType.toLowerCase()}_icon.png`;
  },

  // Town images
  getTownBackground: (raceName: string): string => {
    return `${IMAGE_BASE_PATH}/towns/${raceName.toLowerCase()}_town.png`;
  },

  getTownThumb: (raceName: string): string => {
    return `${IMAGE_BASE_PATH}/towns/${raceName.toLowerCase()}_town.png`;
  },

  // Get fallback image with alt text
  getImageWithFallback: (imagePath: string, fallbackText: string): { src: string; alt: string } => {
    return {
      src: imagePath,
      alt: fallbackText,
    };
  },
};

export default imageUtils;
