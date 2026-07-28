# Bible API

REST API sederhana yang scraping data dari [alkitab.mobi](http://alkitab.mobi) (SABDA), didesain untuk deploy gratis di Vercel Serverless Functions.

Diadaptasi dari versi lama yang pakai Express + Apollo GraphQL, disederhanakan jadi REST karena lebih cocok untuk model serverless (tiap request = function invocation baru, tidak ada server yang "hidup" terus).

## Struktur project

```
bible-api/
├── api/
│   ├── index.js                        → GET /api (info endpoint)
│   ├── versions.js                     → GET /api/versions
│   └── [version]/[book]/[chapter].js   → GET /api/:version/:book/:chapter
├── lib/
│   ├── scraper.js                      → logika scraping + cache in-memory ringan
│   ├── versions.js                     → daftar versi yang didukung
│   ├── verse-range.js                  → parsing parameter verse (angka/rentang)
│   └── cache-headers.js                → helper Cache-Control (edge cache)
├── examples/astro/                     → contoh pemakaian dari Astro (lihat di bawah)
├── package.json
└── vercel.json
```

## Cara deploy

1. Push folder ini ke repo GitHub/GitLab/Bitbucket kamu.
2. Buka [vercel.com](https://vercel.com) → **Add New Project** → import repo tsb.
3. Vercel otomatis detect folder `api/` sebagai serverless functions, tidak perlu build command khusus.
4. Deploy. Selesai — free tier (Hobby) cukup untuk ini.

Atau via CLI:

```bash
npm i -g vercel
cd bible-api
vercel
```

## Endpoint

### `GET /api/versions`
Daftar semua versi/terjemahan yang didukung — diambil dari [daftar resmi alkitab.mobi](https://alkitab.mobi/tb/versions/), mencakup:

- **Bahasa Indonesia:** `ayt`, `tb`, `tl`, `milt`, `sb2010`, `sb2000`, `kszi`, `kskk`, `wbtcdr`, `vmd`, `amd`, `okkh`, `tsi`, `bis`, `tmv`, `bsd`, `fayh`, `ende`, `sbdr`, `kl1879`, `kl1863`, `baba`, `ambdr`, `keasberry`, `keasberry1866`, `ldkdr`, `avb`, `iban`
- **Bahasa suku:** `jawa`, `jawa2006`, `jawa2`, `jawasur`, `sunda`, `sunda2`, `madura`, `bauzi`, `bali`, `ngaju`, `sasak`, `bugis`, `makasar`, `toraja`, `duri`, `gorontalo`, `gorontalo_2006`, `balantak`, `bambam`, `kaili_daa`, `mongondow`, `aralle`, `napu`, `sangir`, `taa`, `rote`, `galela`, `yali`, `tabaru`, `karo`, `simalungun`, `toba`, `dairi`, `minang`, `nias`, `mentawai`, `lampung`, `aceh`, `mamasa`, `berik`, `manggarai`, `sabu`, `kupang`, `abun`, `meyah`, `uma`, `yawa`
- **Bahasa Inggris:** `net`, `nasb`, `hcsb`, `leb`, `niv`, `esv`, `nrsv`, `reb`, `nkjv`, `av`, `amp`, `nlt`, `gnb`, `erv`, `evd`, `bbe`, `msg`, `phillips`, `deib`, `gullah`, `cev`, `cevuk`, `gwv`
- **Mandarin:** `cuv`, `cuvs`
- **Naskah asli/kritis:** `hebrew`, `greek`, `greek_str`, `greeksr`, `greeksr_str`
- **Interlinear:** `aytst`, `tbst`, `tlst`, `avbst`, `kjv`, `nasbst`, `netst`

> Sebagian versi (terutama bahasa suku) di sumbernya cuma punya Perjanjian Baru. Kalau diminta buku Perjanjian Lama untuk versi tsb, alkitab.mobi sendiri yang bakal balikin halaman kosong/error — bukan dari API ini. Daftar lengkap versi ada di `lib/versions.js`.

### `GET /api/:version/:book/:chapter?verse=`
Ambil satu pasal penuh, satu ayat spesifik, atau rentang ayat.

Parameter `verse` mendukung:
- Kosong → seluruh pasal
- Angka tunggal, misal `verse=16` → satu ayat
- Rentang, misal `verse=1-5` → ayat 1 sampai 5

**Contoh:**
```
GET /api/tb/yoh/3?verse=16       → Yoh 3:16
GET /api/tb/yoh/1?verse=1-5      → Yoh 1:1-5
GET /api/tb/mat/1                → seluruh pasal Mat 1
```

**Contoh response:**
```json
{
  "verses": [
    {
      "content": "Karena begitu besar kasih Allah akan dunia ini...",
      "type": "content",
      "verse": 16,
      "book": "yoh",
      "chapter": 3,
      "version": "tb",
      "order": 42
    }
  ],
  "book": "yoh",
  "chapter": 3,
  "version": "tb"
}
```

Kode buku (`book`) mengikuti slug yang dipakai alkitab.mobi sendiri (misalnya `mat`, `mrk`, `luk`, `yoh`, `kej`, dst) — sama seperti pada kode referensi lama, tidak divalidasi di sisi API ini.

## Caching

Ada dua lapis cache, keduanya gratis dan tidak butuh setup infra tambahan (tidak pakai Redis/Vercel KV):

1. **Edge cache (utama)** — tiap response sukses dikirim dengan header `Cache-Control: public, s-maxage=..., stale-while-revalidate=...` (7 hari untuk pasal, 30 hari untuk `/api/versions`). Vercel otomatis simpan response ini di CDN/Edge Network-nya. Request berikutnya ke kombinasi version+book+chapter+verse yang sama akan dijawab langsung dari edge, tanpa menjalankan function atau scrape ulang ke alkitab.mobi sama sekali.
2. **In-memory cache (bonus)** — di dalam `lib/scraper.js`, hasil scrape juga disimpan sebentar (1 jam) di memory function itu sendiri. Ini membantu kalau ada beberapa request beruntun kena instance/lambda yang sama (misal beberapa `verse=` beda dari pasal yang sama), tapi tidak persist antar cold start — jadi bukan pengganti edge cache di atas, cuma bonus.

Karena teks Alkitab praktis tidak pernah berubah, TTL panjang di edge cache ini aman dan efeknya besar: build Astro yang berulang kali fetch endpoint yang sama akan kena cache setelah request pertama, jadi jauh lebih cepat dan tidak membebani alkitab.mobi.

## Pemakaian dari Astro (blog MDX)

Skenario: blog Astro pakai MDX, ada `<Verse book="yoh" chapter="3" verse="16" />` di dalam artikel, yang menampilkan ayat tsb dalam modal/overlay saat diklik.

Ada 2 versi contoh, tergantung theme Astro kamu:

```
examples/
├── astro/                          → generic, pakai <dialog> native (portable ke theme apapun)
│   ├── .env.example
│   ├── components/Verse.astro
│   └── pages/contoh-artikel.mdx
└── astro-rocket/                   → khusus theme Astro Rocket, pakai Dialog.astro bawaan theme
    ├── components/Verse.astro
    └── content/blog/contoh-artikel.mdx
```

Kalau kamu pakai **Astro Rocket** (yang punya `Dialog.astro` di `src/components/ui/overlay/`), pakai `examples/astro-rocket/components/Verse.astro` — ini yang sudah terintegrasi langsung ke `Dialog` bawaan theme lewat `openDialog(id)`/`<Dialog>`, tanpa mengubah `Dialog.astro` sama sekali.

### Langkah pakai di project Astro Rocket kamu

1. Copy `examples/astro-rocket/components/Verse.astro` ke `src/components/blog/Verse.astro` di project Astro Rocket kamu.
2. **Cek path import `Dialog`** di baris atas frontmatter `Verse.astro` — sudah diarahkan ke `@/components/ui/overlay/Dialog.astro` sesuai struktur folder Astro Rocket, tapi sesuaikan lagi kalau ternyata beda di repo kamu (misal `Dialog.astro` ada di dalam subfolder `Dialog/`). `Dialog.astro` sendiri **tidak diubah sama sekali**.
3. Tambahkan env var di `.env` project Astro:
   ```
   PUBLIC_BIBLE_API_URL=https://bible-api-kamu.vercel.app
   ```
4. Di file `.mdx` manapun, import dan pakai (dua gaya sama-sama valid — perhatikan huruf besar `<Verse>`/`</Verse>` harus konsisten kalau pakai children):
   ```mdx
   import Verse from '../../components/blog/Verse.astro';

   Yesus mengajarkan soal kasih Bapa di <Verse book="yoh" chapter="3" verse="16" version="tb" label="Yoh 3:16" />.

   Atau pakai children: <Verse book="yoh" chapter="1" verse="1-5" version="tb">Yoh 1:1-5</Verse>
   ```
   Kalau `label` tidak diisi, trigger-nya jatuh ke children, lalu fallback terakhir ke auto-generate dari `book`/`chapter`/`verse` (hasilnya huruf kecil apa adanya, misal `yoh 3:16` — kurang rapi buat tulisan final, jadi sebaiknya selalu isi `label` atau pakai children).

   Kalau mau `<Verse>` bisa dipakai di semua file `.mdx` tanpa `import` berulang, daftarkan lewat props `components` di layout MDX kamu:
   ```astro
   <Content components={{ Verse }} />
   ```

### Kenapa ini aman & masuk akal secara arsitektur

- Fetch ke Bible API terjadi **di dalam frontmatter `.astro`**, yang jalan di server/build time — bukan di browser. Jadi **tidak ada masalah CORS sama sekali**, walau API-nya beda domain dari blog kamu.
- Kalau situs kamu di-build sebagai static (default Astro/SSG), fetch cuma terjadi sekali per `astro build`, hasilnya ke-bake jadi HTML statis. Ditambah edge cache di atas, build ulang jadi cepat karena kombinasi ayat yang sama tidak discrape ulang dari alkitab.mobi.
- Pembaca cuma lihat teks trigger (dari `label`) di paragraf, mirip link biasa. Isi ayat sudah ke-fetch saat build dan ditaruh di dalam `Dialog` (yang defaultnya `hidden`) — jadi begitu diklik, modal langsung muncul dengan isi lengkap tanpa loading/fetch tambahan di browser.
- Component contoh (`Verse.astro`) memanggil `Dialog` bawaan theme (Astro Rocket) lewat `openDialog(id)`/`<Dialog>` — bukan bikin modal sendiri. Jadi styling, focus trap, escape-to-close, dan animasi tetap konsisten dengan komponen lain di theme kamu, tanpa perlu sentuh `Dialog.astro`.
- Kalau satu artikel punya beberapa tag `<Verse>`, tiap satu jadi satu request API saat build — untuk blog personal ini jauh di bawah limit Vercel Hobby manapun (lihat bagian Caching di atas untuk kenapa ini juga tetap murah kalau sering rebuild).

## Catatan penting

- **Timeout Hobby plan.** Vercel Hobby (free) membatasi durasi eksekusi function; `vercel.json` di sini sudah set `maxDuration: 10` supaya kompatibel di free tier. Edge cache di atas juga mengurangi risiko ini karena request yang sudah pernah di-hit tidak perlu scrape ulang.
- **Sumber data:** alkitab.mobi milik SABDA — pastikan penggunaan tetap sesuai izin yang sudah didapat.
