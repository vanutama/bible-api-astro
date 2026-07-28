// Daftar versi/terjemahan yang tersedia di alkitab.mobi.
// Diambil dari https://alkitab.mobi/tb/versions/ (per Juli 2026).
//
// Catatan: versi yang ditandai "PB" di source aslinya cuma punya Perjanjian
// Baru (Matius s/d Wahyu) - kalau diminta buku Perjanjian Lama, alkitab.mobi
// sendiri yang bakal balikin halaman kosong/error, bukan API ini.
const VERSIONS = [
  // Bahasa Indonesia
  'ayt',
  'tb',
  'tl',
  'milt',
  'sb2010',
  'sb2000', // PB
  'kszi',
  'kskk',
  'wbtcdr', // PB
  'vmd',
  'amd', // PB
  'okkh', // PB
  'tsi',
  'bis',
  'tmv',
  'bsd', // PB
  'fayh',
  'ende',
  'sbdr',
  'kl1879', // PB
  'kl1863', // PB
  'baba', // PB
  'ambdr', // PB
  'keasberry', // PB
  'keasberry1866', // PB
  'ldkdr', // PB
  'avb',
  'iban', // PB

  // Bahasa Suku
  'jawa',
  'jawa2006', // PB
  'jawa2',
  'jawasur', // PB
  'sunda',
  'sunda2', // PB
  'madura',
  'bauzi', // PB
  'bali',
  'ngaju', // PB
  'sasak', // PB
  'bugis',
  'makasar',
  'toraja',
  'duri', // PB
  'gorontalo', // PB
  'gorontalo_2006', // PB
  'balantak', // PB
  'bambam', // PB
  'kaili_daa', // PB
  'mongondow', // PB
  'aralle', // PB
  'napu', // PB
  'sangir', // PB
  'taa', // PB
  'rote', // PB
  'galela', // PB
  'yali', // PB
  'tabaru', // PB
  'karo',
  'simalungun',
  'toba',
  'dairi', // PB
  'minang', // PB
  'nias', // PB
  'mentawai', // PB
  'lampung', // PB
  'aceh', // PB
  'mamasa',
  'berik', // PB
  'manggarai', // PB
  'sabu', // PB
  'kupang', // PB
  'abun',
  'meyah',
  'uma', // PB
  'yawa', // PB

  // Bahasa Inggris
  'net',
  'nasb',
  'hcsb',
  'leb',
  'niv',
  'esv',
  'nrsv',
  'reb',
  'nkjv',
  'av',
  'amp',
  'nlt',
  'gnb',
  'erv',
  'evd', // PB
  'bbe',
  'msg',
  'phillips', // PB
  'deib', // PB
  'gullah', // PB
  'cev',
  'cevuk',
  'gwv',

  // Mandarin
  'cuv',
  'cuvs',

  // Ibrani & Yunani (naskah asli/kritis)
  'hebrew',
  'greek', // PB
  'greek_str', // PB
  'greeksr', // PB
  'greeksr_str', // PB

  // Interlinear
  'aytst',
  'tbst',
  'tlst',
  'avbst',
  'kjv',
  'nasbst',
  'netst', // PB
];

module.exports = { VERSIONS };
