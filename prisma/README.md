Dokumen ini berisi panduan sederhana untuk menggunakan fitur data seeding pada project INVENTUM-BE. Data seeding digunakan untuk mengisi database dengan data awal yang diperlukan untuk pengembangan dan testing aplikasi.

1. Pengaturan Environment

Sebelum melakukan seeding, pastikan Anda telah mengatur environment variable yang diperlukan. Anda dapat menyalin file .env.example menjadi .env dan mengubah nilai-nilai yang sesuai dengan konfigurasi database .

2. Sesuaikan Data yang Akan Diisi

Silakan modifiikasi file seeding pada `seeds/development.ts` atau `seeds/test.ts` untuk menyesuaikan data yang akan diisi ke dalam database. Anda dapat menambahkan atau mengubah data sesuai kebutuhan.

contoh isi file `seeds/development.ts`:

```typescript
export const users = [
  // User yang sudah ada...
  {
    id: uuidv4(),
    email: "pengguna@inventum.dev",
    username: "pengguna",
    password: "$2a$10$GQeuXehdl58.VxoKhLKsZ.hQzX55zYvbd7ZiMHgL4n9U0w38XpIUq",
    role: "USER",
    fullname: "Pengguna Baru",
    nokar: "USR-001",
    waNumber: "081234567800",
    divisiId: 3, // Pastikan divisi ini sudah ada!
    createdBy: "System",
    createdOn: new Date(),
  },
];
```

3. Perintah Dasar Untuk Melakukan Seeding

```bash
npx prisma db seed
```

untuk melakukan seeding pada environment development, silakan gunakan perintah berikut:

```bash
npm run db:seed:dev
```
