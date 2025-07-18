export interface CardStyle {
  bg: string;
  border: string;
  shadow: string;
  text: string;
}

export const cardStyles: CardStyle[] = [
  {
    bg: "bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-300",
    border: "border-yellow-400",
    shadow: "shadow-lg",
    text: "text-yellow-700",
  },
  {
    bg: "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300",
    border: "border-gray-400",
    shadow: "shadow-md",
    text: "text-gray-700",
  },
  {
    bg: "bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400",
    border: "border-amber-500",
    shadow: "shadow-md",
    text: "text-amber-800",
  },
];

// Default style untuk fallback
export const defaultCardStyle: CardStyle = {
  bg: "bg-white",
  border: "border-gray-200",
  shadow: "shadow-sm",
  text: "text-gray-700",
};

// Helper function untuk mendapatkan style berdasarkan index
export const getCardStyle = (index: number): CardStyle => {
  return cardStyles[index] || defaultCardStyle;
};

// Helper function untuk mendapatkan random card style
export const getRandomCardStyle = (): CardStyle => {
  const randomIndex = Math.floor(Math.random() * cardStyles.length);
  return cardStyles[randomIndex];
};

// Extended card styles untuk variasi lebih banyak
export const extendedCardStyles: CardStyle[] = [
  ...cardStyles,
  {
    bg: "bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300",
    border: "border-blue-400",
    shadow: "shadow-md",
    text: "text-blue-700",
  },
  {
    bg: "bg-gradient-to-r from-green-100 via-green-200 to-green-300",
    border: "border-green-400",
    shadow: "shadow-md",
    text: "text-green-700",
  },
  {
    bg: "bg-gradient-to-r from-purple-100 via-purple-200 to-purple-300",
    border: "border-purple-400",
    shadow: "shadow-md",
    text: "text-purple-700",
  },
  {
    bg: "bg-gradient-to-r from-rose-100 via-rose-200 to-rose-300",
    border: "border-rose-400",
    shadow: "shadow-md",
    text: "text-rose-700",
  },
];

// Helper function untuk extended styles
export const getExtendedCardStyle = (index: number): CardStyle => {
  return extendedCardStyles[index] || defaultCardStyle;
};
