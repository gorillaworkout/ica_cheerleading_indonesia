# Auto ID Card Generation Feature

## Overview
Sistem auto-generate ID card akan secara otomatis membuat kartu identitas member ICA setelah user berhasil melakukan registrasi. ID card akan disimpan di Supabase storage dan link-nya akan disimpan di database profile user.

## Fitur Utama

### 1. Auto-Generate saat Registrasi
- ID card dibuat otomatis setelah user berhasil register
- Tidak perlu manual generate di profile page
- Menggunakan data profile yang sudah diisi saat registrasi

### 2. Desain ID Card
- **Font**: Righteous-Regular.ttf
- **Warna Teks**: Merah (#e52b29) untuk semua field kecuali registration date
- **Registration Date**: Hitam (#000000)
- **Nama Member**: Putih (#FFFFFF)
- **Format Tanggal Lahir**: "Nama Bulan - Tanggal - Tahun" (contoh: "Januari - 15 - 1990")
- **Format Tanggal Registrasi**: "Nama Bulan, Tanggal Tahun" (contoh: "Januari, 15 2024")

### 3. Koordinat Positioning
```typescript
// Photo settings (dengan rounded corners)
photoX: 70
photoY: 200
photoWidth: 310
photoHeight: 325
photoRadius: 20

// Text positioning
nameX: 400, nameY: 320 (Nama member)
idValueX: 395, idValueY: 410 (Member ID)
birthValueX: 590, birthValueY: 410 (Tanggal lahir)
genderValueX: 860, genderValueY: 410 (Gender)
provinceValueX: 395, provinceValueY: 490 (Provinsi)
statusValueX: 595, statusValueY: 490 (Status)
regDateValueX: 850, regDateValueY: 580 (Tanggal registrasi)
```

## Files yang Dimodifikasi

### 1. `/utils/autoGenerateIdCard.ts`
- Class `AutoIDCardGenerator` untuk handle auto-generation
- Method `generateAndSaveIDCard()` untuk main function
- Support Righteous font loading
- Formatting tanggal Indonesia

### 2. `/features/auth/authSlice.ts`
- Integrasi auto-generate ID card ke `signUpWithEmailThunk`
- Dipanggil setelah profile berhasil dibuat
- Error handling untuk generation yang gagal

### 3. `/components/profile/id-card-section.tsx`
- Update untuk menggunakan kolom `id_card_image`
- Tampilan untuk ID card yang sudah di-generate otomatis
- Hapus fitur "Regenerate Card" manual

### 4. `/types/profiles/profiles.ts`
- Tambah field `id_card_image: string | null`

### 5. `/scripts/add-id-card-image-column.sql`
- SQL script untuk menambah kolom `id_card_image` ke database

## Database Schema

### Tabel: profiles
```sql
-- Tambahan kolom baru
id_card_image TEXT -- Path ke ID card image di storage
```

## Testing

### Test Page: `/profile/test-auto-generate`
- Halaman untuk testing manual auto-generate function
- Menampilkan status profile data
- Button untuk trigger manual generation
- Useful untuk debugging

### Cara Testing:
1. Login ke aplikasi
2. Kunjungi `/profile/test-auto-generate`
3. Lihat status profile requirements
4. Klik "Test Generate ID Card"
5. Check hasil di profile page

## Flow Registrasi

1. **User Register** → `signUpWithEmailThunk`
2. **Create Auth User** → Supabase Auth
3. **Upload Photos** → Profile & ID photos ke storage
4. **Create Profile** → Insert ke table profiles
5. **🆕 Auto-Generate ID Card** → `AutoIDCardGenerator.generateAndSaveIDCard()`
6. **Upload ID Card** → Save ke storage
7. **Update Profile** → Set `id_card_image` field
8. **Create Coach Profile** (jika role = coach)
9. **Sign Out User** → User perlu login manual

## Error Handling

- Auto-generate ID card **tidak akan** menggagalkan registrasi
- Jika generation gagal, registrasi tetap dilanjutkan
- Error log untuk debugging
- User bisa contact support jika ID card tidak muncul

## Requirements untuk Auto-Generate

ID card akan di-generate jika semua data berikut tersedia:
- ✅ `display_name`
- ✅ `birth_date`  
- ✅ `gender`
- ✅ `province_code`
- ✅ `profile_photo_url`

## Storage Structure

```
uploads/
├── id-cards/
│   ├── id-card-{userId}-{timestamp}.png
│   └── ...
├── profile-photos/
│   ├── {userId}-{timestamp}
│   └── ...
└── id-photos/
    ├── {userId}-{timestamp}
    └── ...
```

## Production Checklist

- [ ] Run SQL script untuk tambah kolom `id_card_image`
- [ ] Upload font `righteous-Regular.ttf` ke public folder
- [ ] Test registrasi baru untuk memastikan auto-generate berjalan
- [ ] Test tampilan ID card di profile page
- [ ] Monitor error logs untuk generation yang gagal
- [ ] Setup Supabase storage policy untuk id-cards folder

## Troubleshooting

### ID Card tidak muncul setelah registrasi:
1. Check apakah kolom `id_card_image` ada di database
2. Check storage uploads/id-cards/ untuk file yang di-generate
3. Check console logs untuk error auto-generation
4. Pastikan semua required data tersedia di profile

### Font tidak load:
1. Pastikan `righteous-Regular.ttf` ada di public folder
2. Check network tab untuk font loading error
3. Browser support untuk FontFace API

### Generation error:
1. Check Supabase storage permissions
2. Check Canvas API support di browser
3. Check image template `/id_card.jpg` tersedia
