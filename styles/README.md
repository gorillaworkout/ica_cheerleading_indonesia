# Card Styles Usage Guide

Panduan penggunaan `cardStyles` yang sudah dibuat dynamic dan reusable untuk berbagai komponen.

## ⭐ **Update: Olympic-Style Ranking**

Untuk komponen ranking (Province Point & Best Team), kini menggunakan **Olympic-style colors** yang lebih jelas:

### 🏆 **Ranking Colors:**
- **🥇 Rank 1 (Gold)**: Yellow gradient dengan gold border
- **🥈 Rank 2 (Silver)**: Gray gradient dengan silver border  
- **🥉 Rank 3 (Bronze)**: Amber gradient dengan bronze border
- **🏅 Rank 4+ (Others)**: Blue gradient dengan blue border

### 🎨 **Implementation Example:**
```tsx
// Olympic-style ranking dengan visual medals
let style;
if (index === 0) {
  // 🥇 Gold - Rank 1
  style = {
    bg: "bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-300",
    border: "border-yellow-400",
    shadow: "shadow-lg",
    text: "text-yellow-700",
  };
} else if (index === 1) {
  // 🥈 Silver - Rank 2
  style = {
    bg: "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300",
    border: "border-gray-400", 
    shadow: "shadow-md",
    text: "text-gray-700",
  };
} else if (index === 2) {
  // 🥉 Bronze - Rank 3
  style = {
    bg: "bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400",
    border: "border-amber-500",
    shadow: "shadow-md", 
    text: "text-amber-800",
  };
} else {
  // 🏅 Other ranks
  style = {
    bg: "bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200",
    border: "border-blue-300",
    shadow: "shadow-sm",
    text: "text-blue-700",
  };
}

// Visual medal dengan emoji
{index === 0 && <span className="text-4xl">🥇</span>}
{index === 1 && <span className="text-4xl">🥈</span>}
{index === 2 && <span className="text-4xl">🥉</span>}
{index >= 3 && <span className="text-4xl">🏅</span>}
```

---

## Imports

```typescript
import { 
  cardStyles, 
  getCardStyle, 
  getRandomCardStyle, 
  getExtendedCardStyle,
  CardStyle
} from "@/styles/cardStyles";
```

## Basic Usage

### 1. Menggunakan getCardStyle() - Recommended
```tsx
// Untuk mendapatkan style berdasarkan index dengan fallback otomatis
const style = getCardStyle(index);

// Penggunaan di JSX
<div className={`${style.bg} border ${style.border} ${style.shadow} ${style.text}`}>
  Content here
</div>
```

### 2. Menggunakan getExtendedCardStyle()
```tsx
// Untuk variasi lebih banyak (7 styles vs 3 styles basic)
const style = getExtendedCardStyle(index);
```

### 3. Menggunakan getRandomCardStyle()
```tsx
// Untuk mendapatkan style random
const style = getRandomCardStyle();
```

## Interface CardStyle

```typescript
interface CardStyle {
  bg: string;      // Background gradient
  border: string;  // Border color
  shadow: string;  // Shadow type
  text: string;    // Text color
}
```

## Contoh Implementasi

### Province Point Component
```tsx
{provinceRanking.map((provinceData, index) => {
  const style = getCardStyle(index);
  return (
    <div className={`${style.bg} border ${style.border} ${style.shadow} rounded-xl p-6`}>
      {/* Content */}
    </div>
  );
})}
```

### Competition Results Component
```tsx
{results.map((result, resultIndex) => {
  const style = getExtendedCardStyle(resultIndex);
  return (
    <div className={`${style.bg} border ${style.border} ${style.shadow} rounded-xl p-6`}>
      {/* Content */}
    </div>
  );
})}
```

### Championship Section Component
```tsx
{competitions.map((competition, index) => {
  const cardStyle = getCardStyle(index);
  return (
    <Card className={`${cardStyle.border} ${cardStyle.shadow} hover:scale-105`}>
      {/* Content */}
    </Card>
  );
})}
```

## Available Styles

### Basic Styles (cardStyles - 3 variations)
1. **Gold Theme**: Yellow gradient dengan border yellow
2. **Silver Theme**: Gray gradient dengan border gray  
3. **Bronze Theme**: Amber gradient dengan border amber

### Extended Styles (extendedCardStyles - 7 variations)
Includes all basic styles plus:
4. **Blue Theme**: Blue gradient dengan border blue
5. **Green Theme**: Green gradient dengan border green
6. **Purple Theme**: Purple gradient dengan border purple  
7. **Rose Theme**: Rose gradient dengan border rose

## Best Practices

1. **Gunakan getCardStyle()** untuk most cases - sudah include fallback
2. **Gunakan getExtendedCardStyle()** ketika butuh lebih banyak variasi
3. **Gunakan getRandomCardStyle()** untuk efek surprise/dynamic
4. **Combine dengan hover effects** untuk better UX:
   ```tsx
   className={`${style.bg} border ${style.border} ${style.shadow} hover:scale-105 transition-transform`}
   ```

## Menambah Style Baru

Edit file `/styles/cardStyles.ts` dan tambahkan ke array `extendedCardStyles`:

```typescript
{
  bg: "bg-gradient-to-r from-indigo-100 via-indigo-200 to-indigo-300",
  border: "border-indigo-400", 
  shadow: "shadow-md",
  text: "text-indigo-700",
}
```

## Troubleshooting

- **"Cannot find name 'cardStyles'"**: Gunakan `getCardStyle()` instead
- **Style tidak muncul**: Check import path `@/styles/cardStyles`
- **Tailwind classes tidak work**: Pastikan classes ada di Tailwind config
