/* =========================================================
   PENGATURAN / CONFIG
   ---------------------------------------------------------
   VIDEOS: daftar video kenangan dari Google Drive.
   Untuk menambah/mengganti video, cukup tempel ID file Drive
   (bagian setelah /file/d/ di link Drive) ke array ini.
   File di Drive harus "Siapa saja yang memiliki link".
   ========================================================= */
const VIDEOS = [
  { id: '1y6MQr3ZBfMdGS7DOeKk07ro-KPD-tOUN', file: '20260118_114807.mp4' },
  { id: '11yD98BbhcXJMxG51PMT120tfp7-i83rz', file: '20260709_100919.mp4' },
  { id: '1pPWOkWIBxik_B0gZShq1SBWe9ybVHX6t', file: 'IMG_1745.MOV' },
  { id: '1d-mbqLNyPc75xBITHHtFFsDGiKkkXDO0', file: 'IMG_2630.MOV' },
  { id: '1881IItPhYtoHrZsqfBKo14E2BdhBfKVO', file: 'IMG_2728.MOV' },
  { id: '1Gezly9gXyC21cbY9d6swiTpFwwfh97aR', file: 'IMG_4995.MOV' },
  { id: '19JCSh69euugUOGJ0Jepxh8ERgYiaR-Uh', file: 'IMG_5396.MOV' },
  { id: '11dFzGKcXygROIz1rDEuskNrMjJcrd33h', file: 'IMG_5805.MOV' },
  { id: '15HPG0QXe3wNKqzl4cjvRg9mvT3Dk_Any', file: 'IMG_9245.MOV' },
];

/* Video kompilasi (diputar langsung di situs sebagai saluran pertama). */
const COMPILATION = { src: 'assets/kompilasi.mp4', poster: 'assets/kompilasi-poster.jpg', title: 'Kompilasi: Perjalanan Kita' };

const DRIVE_FOLDER = 'https://drive.google.com/drive/folders/1zqob5DY9epDEJ3blkVOsc2NDaNPin5aT';

const BIRTHDAY = { name: 'Fina', fullName: 'Fina Dewi Oktarisa', age: 25, y: 2026, m: 10, d: 27 };

const INTRO_TEXT =
  'Ini aku, lagi jalan menuju kamu. Bantu aku kumpulin 5 hati di sepanjang jalan, ya. ' +
  'Tiap hati nyimpen satu bagian dari cerita kita.';

const CHAPTERS = [
  { title: 'Awal Cerita',
    text: 'Semuanya dimulai dari hal-hal kecil. Obrolan biasa, tawa yang nggak direncanain, dan rasa nyaman yang datang pelan-pelan. Waktu itu aku belum tahu, ternyata itu awal dari cerita terbaik di hidupku.' },
  { title: 'Tumbuh Bareng',
    text: 'Kita sama-sama belajar. Belajar ngertiin satu sama lain, belajar sabar, belajar bilang maaf dan makasih. Pelan-pelan aku sadar, aku jadi versi diriku yang lebih baik karena ada kamu.' },
  { title: 'Naik & Turun',
    text: 'Nggak semuanya mulus, ya. Ada hari yang capek, ada salah paham, ada diem-dieman juga. Tapi setiap badai selalu lewat, dan kita masih di sini, masih saling genggam.' },
  { title: 'Tawa Kecil',
    text: 'Yang paling aku syukuri justru momen-momen sederhana: ketawa sampai sakit perut, cerita random sampai lupa waktu, dan lihat kamu senyum. Hal kecil yang bikin hari-hariku hangat.' },
  { title: 'Sampai Hari Ini',
    text: 'Perjalanan kita udah panjang, dan kamu tetap memilih bertahan. Buat aku, itu hadiah yang paling berharga. Sekarang giliran aku... yuk ke ujung jalan, ada kejutan kecil buat kamu!' },
];

const LETTER = [
  'Fina sayang, selamat ulang tahun yang ke-25!',
  'Hari ini aku pengin bilang beberapa hal yang mungkin jarang banget aku ucapin langsung. Jadi baca pelan-pelan, ya.',
  'Kalau aku lihat ke belakang, perjalanan kita ternyata udah panjang banget. Dari dua orang yang masih saling belajar kenal, sampai sekarang jadi dua orang yang bisa saling ngerti tanpa harus banyak ngomong.',
  'Kita udah ngelewatin banyak hal bareng. Hari-hari yang seru, hari-hari yang berat, tawa yang nggak ada habisnya, dan juga salah paham yang bikin kita belajar lagi. Nggak semuanya gampang, dan aku tahu aku juga nggak selalu sempurna.',
  'Tapi kamu selalu ada. Kamu sabar sama aku, kamu dengerin aku, dan kamu tetap memilih bertahan. Itu sesuatu yang nggak pernah aku anggap sepele.',
  'Makasih ya, Fina. Makasih udah jadi tempat pulang yang paling nyaman. Makasih udah percaya sama aku, bahkan di saat aku sendiri ragu. Makasih buat semua kesabaran, perhatian, dan sayang yang kamu kasih, yang kadang belum bisa aku balas sebaik yang pantas kamu dapetin.',
  'Di umur 25 ini, aku harap kamu makin bahagia, makin sehat, dan semua hal baik yang kamu impiin pelan-pelan jadi nyata. Apa pun yang nanti datang, aku pengin tetap ada di samping kamu, tumbuh bareng kamu, dan nemenin kamu di level-level berikutnya.',
  'Selamat ulang tahun, sayangku. Aku sayang kamu, hari ini dan seterusnya.',
  'Dari aku, yang selalu sayang kamu ♥',
];
