# Card Styles Usage Guide

Panduan penggunaan `cardStyles` yang sudah dibuat dynamic dan reusable untuk berbagai komponen.

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
