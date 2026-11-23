'use strict';

const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

if (fs.existsSync('.env')) {
  const envConfig = fs.readFileSync('.env', 'utf8');
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      const val = vals.join('=').replace(/^['"]|['"]$/g, '');
      if (!process.env[key.trim()]) process.env[key.trim()] = val.trim();
    }
  }
}

const PORT = process.env.PORT || 3000;
const AUTH_BOT_TOKEN = process.env.AUTH_BOT_TOKEN;
const AUTH_BOT_USERNAME = process.env.AUTH_BOT_USERNAME || 'SardorArt_Bot';
const ORDER_BOT_TOKEN = process.env.ORDER_BOT_TOKEN;
const ORDER_BOT_USERNAME = process.env.ORDER_BOT_USERNAME || 'SardorOrderBot';
const SITE_URL = process.env.SITE_URL || `http://localhost:${PORT}`;
const ADMIN_CHAT_ID = '8857301370';

const DATA_FILE = path.join(__dirname, 'data.json');
let DATA = { users: {}, sessions: {}, authNonces: {}, products: [], orders: [], botStates: {} };
let writeQueue = Promise.resolve();

async function saveData() {
  writeQueue = writeQueue.then(async () => {
    const tmp = DATA_FILE + '.tmp';
    await fs.promises.writeFile(tmp, JSON.stringify(DATA, null, 2));
    await fs.promises.rename(tmp, DATA_FILE);
  }).catch(console.error);
  return writeQueue;
}

async function loadData() {
  try {
    const raw = await fs.promises.readFile(DATA_FILE, 'utf8');
    DATA = JSON.parse(raw);
    if (!DATA.users) DATA.users = {};
    if (!DATA.sessions) DATA.sessions = {};
    if (!DATA.authNonces) DATA.authNonces = {};
    if (!DATA.products) DATA.products = [];
    if (!DATA.orders) DATA.orders = [];
    if (!DATA.botStates) DATA.botStates = {};
  } catch (e) {
    await saveData();
  }
}

async function sendTgMsg(token, chatId, text, replyMarkup = null) {
  if (!token) return;
  const body = { chat_id: chatId, text, parse_mode: 'HTML' };
  if (replyMarkup) body.reply_markup = replyMarkup;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
  } catch (err) { console.error('Telegram error:', err.message); }
}

async function answerCallback(token, callbackQueryId) {
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ callback_query_id: callbackQueryId })
    });
  } catch (err) { console.error('Callback error:', err.message); }
}

// 1. RO'YXATDAN O'TISH BOTI
async function pollAuthUpdates() {
  if (!AUTH_BOT_TOKEN) return console.log('AUTH_BOT_TOKEN berilmagan.');
  let offset = 0;
  while (true) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${AUTH_BOT_TOKEN}/getUpdates?offset=${offset}&timeout=10`);
      const data = await res.json();
      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          await handleAuthUpdate(update);
        }
      }
    } catch (err) {
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

async function handleAuthUpdate(update) {
  if (!update.message) return;
  const msg = update.message;
  const chatId = msg.chat.id;

  if (msg.text && msg.text.startsWith('/start')) {
    const parts = msg.text.split(' ');
    const nonce = parts.length > 1 ? parts[1] : null;
    
    if (!nonce) {
      await sendTgMsg(AUTH_BOT_TOKEN, chatId, "Assalomu alaykum! Tizimga kirish uchun iltimos, saytga qaytib, Profil bo'limidan 'Mijoz' yoki 'Savdogar' tugmasini bosing. Shunda sizga maxsus kirish havolasi beriladi.");
      return;
    }

    const auth = DATA.authNonces[nonce];
    if (auth && Date.now() - auth.createdAt < 10 * 60 * 1000) {
      auth.chatId = chatId;
      auth.status = 'waiting_contact';
      await saveData();
      let roleText = auth.role === 'seller' ? 'savdogar' : 'mijoz';
      await sendTgMsg(AUTH_BOT_TOKEN, chatId, `Assalomu alaykum, hurmatli ${roleText}! SARDOR ART ga xush kelibsiz. Davom etish uchun telefon raqamingizni yuboring.`, {
        keyboard: [[{ text: "📱 Raqamni yuborish", request_contact: true }]], resize_keyboard: true, one_time_keyboard: true
      });
      return;
    }
    
    await sendTgMsg(AUTH_BOT_TOKEN, chatId, 'Xatolik: Havola eskirgan (10 daqiqa o\'tgan). Iltimos, saytga qaytib, qaytadan urinib ko\'ring.');
    return;
  }

  if (msg.contact) {
    let activeNonce = null;
    for (const [nonce, auth] of Object.entries(DATA.authNonces)) {
      if (auth.chatId === chatId && auth.status === 'waiting_contact') { activeNonce = nonce; break; }
    }

    if (activeNonce) {
      const auth = DATA.authNonces[activeNonce];
      if (msg.contact.user_id !== msg.from.id) return sendTgMsg(AUTH_BOT_TOKEN, chatId, 'Faqat o\'z raqamingizni yuboring.');

      let phone = msg.contact.phone_number;
      if (!phone.startsWith('+')) phone = '+' + phone;
      if (!/^\+998\d{9}$/.test(phone)) return sendTgMsg(AUTH_BOT_TOKEN, chatId, 'Format noto\'g\'ri (+998XXXXXXXXX).');

      const code = String(crypto.randomInt(100000, 999999));
      auth.phone = phone;
      auth.codeHash = crypto.createHash('sha256').update(code).digest('hex');
      auth.status = 'waiting_code';
      auth.attempts = 0;
      auth.sentAt = Date.now();

      await saveData();
      await sendTgMsg(AUTH_BOT_TOKEN, chatId, `Rahmat! Saytga qaytib ushbu kodni kiriting:\n\n<code>${code}</code>`, { remove_keyboard: true });
    }
  }
}

// 2. ZAKAZ BERISH BOTI
async function pollOrderUpdates() {
  if (!ORDER_BOT_TOKEN) return console.log('ORDER_BOT_TOKEN berilmagan.');
  let offset = 0;
  while (true) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${ORDER_BOT_TOKEN}/getUpdates?offset=${offset}&timeout=10`);
      const data = await res.json();
      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          await handleOrderUpdate(update);
        }
      }
    } catch (err) {
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

async function handleOrderUpdate(update) {
  try {
    // Tugmalar (Callback Query) bosilganda
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message.chat.id;
      const data = cb.data;
      await answerCallback(ORDER_BOT_TOKEN, cb.id);

      let state = DATA.botStates[chatId];
      if (!state) return;

      if (data.startsWith('genre_')) {
        state.data.genre = data.replace('genre_', '');
        state.step = 'size';
        await saveData();
        await sendTgMsg(ORDER_BOT_TOKEN, chatId, "Rasm o'lchamini tanlang (sm):", {
          inline_keyboard: [
            [{ text: "30x40 (400,000 so'm)", callback_data: "size_400" }, { text: "40x50 (600,000 so'm)", callback_data: "size_600" }],
            [{ text: "50x70 (900,000 so'm)", callback_data: "size_900" }, { text: "60x80 (1,200,000 so'm)", callback_data: "size_1200" }],
            [{ text: "80x100 (1,800,000 so'm)", callback_data: "size_1800" }, { text: "100x120 (2,500,000 so'm)", callback_data: "size_2500" }]
          ]
        });
        return;
      }

      if (data.startsWith('size_')) {
        state.data.size = data.replace('size_', '');
        state.step = 'theme';
        await saveData();
        await sendTgMsg(ORDER_BOT_TOKEN, chatId, "Rasm mavzusi yoki g'oyasini qisqacha yozib yuboring:");
        return;
      }
    }

    // Xabar kelganda
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;

      if (msg.text && msg.text.startsWith('/start')) {
        DATA.botStates[chatId] = { step: 'genre', data: {} };
        await saveData();
        await sendTgMsg(ORDER_BOT_TOKEN, chatId, "Assalomu alaykum! Maxsus rasm buyurtma berish uchun janrni tanlang:", {
          inline_keyboard: [
            [{ text: "Portret", callback_data: "genre_Portret" }, { text: "Manzara", callback_data: "genre_Manzara" }],
            [{ text: "Abstraksiya", callback_data: "genre_Abstraksiya" }, { text: "Boshqa", callback_data: "genre_Boshqa" }]
          ]
        });
        return;
      }

      const state = DATA.botStates[chatId];
      if (!state) return;

      // Mavzu kiritilganda
      if (state.step === 'theme' && msg.text) {
        state.data.theme = msg.text;
        state.step = 'phone';
        await saveData();
        await sendTgMsg(ORDER_BOT_TOKEN, chatId, "Telefon raqamingizni yuboring:", {
          keyboard: [[{ text: "📱 Raqamni yuborish", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true
        });
        return;
      }

      // Telefon raqam yuborilganda
      if (state.step === 'phone' && (msg.contact || msg.text)) {
        state.data.phone = msg.contact ? msg.contact.phone_number : msg.text;
        state.step = 'address';
        await saveData();
        await sendTgMsg(ORDER_BOT_TOKEN, chatId, "Rahmat! Endi manzilingizni yuboring (Lokatsiya orqali yoki yozma ravishda):", {
          keyboard: [[{ text: "📍 Lokatsiyani yuborish", request_location: true }]],
          resize_keyboard: true,
          one_time_keyboard: true
        });
        return;
      }

      // Lokatsiya yoki Venue (Joy nomi bilan lokatsiya) kelganda
      if (state.step === 'address' && (msg.location || msg.venue || msg.text)) {
        let addressStr = '';
        
        if (msg.location) {
          addressStr = `Lokatsiya: https://www.google.com/maps?q=${msg.location.latitude},${msg.location.longitude}`;
        } else if (msg.venue) {
          addressStr = `Joy: ${msg.venue.title}, ${msg.venue.address}\nLokatsiya: https://www.google.com/maps?q=${msg.venue.location.latitude},${msg.venue.location.longitude}`;
        } else {
          addressStr = msg.text;
        }
        
        state.data.address = addressStr;
        
        const sizePrices = { 
          '400': '400,000', 
          '600': '600,000', 
          '900': '900,000', 
          '1200': '1,200,000', 
          '1800': '1,800,000', 
          '2500': '2,500,000' 
        };
        const price = sizePrices[state.data.size] || 'Kelishilgan holda';
        
        const summary = `🎨 Yangi ZAKAZ!\n\nJanr: ${state.data.genre}\nO'lcham: ${state.data.size}\nMavzu: ${state.data.theme}\nTel: ${state.data.phone}\nManzil: ${state.data.address}`;
        
        // Adminga yuborish
        await sendTgMsg(ORDER_BOT_TOKEN, ADMIN_CHAT_ID, summary);

        // Foydalanuvchiga rahmat aytish
        const finalMsg = `Xush kelibsiz! Ma'lumotlaringiz qabul qilindi.\n\nTaxminiy narxi: <b>${price} so'm</b>\n\nTez orada aloqaga chiqamiz. Minnatdorchilik bildiramiz!\n\nBizning ijtimoiy tarmoqlar:\nTelegram: https://t.me/sardor_artest_uz\nInstagram: https://www.instagram.com/sardor_art_painter`;
        
        await sendTgMsg(ORDER_BOT_TOKEN, chatId, finalMsg, { 
          inline_keyboard: [[{ text: "Saytga qaytish", url: SITE_URL }]] 
        });
        
        delete DATA.botStates[chatId];
        await saveData();
        return;
      }
    }
  } catch (err) {
    console.error('Order bot xatosi:', err);
    const chatId = typeof update !== 'undefined' ? update?.message?.chat?.id : null;
    if (chatId) {
      await sendTgMsg(ORDER_BOT_TOKEN, chatId, "Kechirasiz, tizimda xatolik yuz berdi. Iltimos, /start bosib qaytadan urinib ko'ring.");
    }
  }
}

// EXPRESS SERVER VA API
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '3mb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https://*.googleapis.com https://*.gstatic.com https://www.google.com https://maps.google.com; frame-src https://www.google.com https://maps.google.com; script-src 'self'; style-src 'self' 'unsafe-inline';");
  next();
});
app.get('/api/config', (req, res) => res.json({ phone: process.env.PHONE || '+998 90 123 45 67' }));

const rlBuckets = new Map();
setInterval(() => rlBuckets.clear(), 60000);
function rateLimit(max) {
  return (req, res, next) => {
    const ip = req.ip; let b = rlBuckets.get(ip);
    if (!b) { b = { count: 0 }; rlBuckets.set(ip, b); }
    b.count++; if (b.count > max) return res.status(429).json({ error: 'Ko\'p so\'rov.' }); next();
  };
}
app.use(express.static(path.join(__dirname, 'public')));

function auth(required = true) {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return required ? res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' }) : next();
    const session = DATA.sessions[token];
    if (!session) return res.status(401).json({ error: 'Sessiya eskirgan' });
    const user = DATA.users[session.phone];
    if (!user) return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
    req.user = user; req.token = token; next();
  };
}

app.post('/api/auth/start', rateLimit(10), async (req, res) => {
  try {
    const { role } = req.body || {};
    if (role !== 'customer' && role !== 'seller') {
      return res.status(400).json({ error: 'Rol noto\'g\'ri' });
    }
    const nonce = crypto.randomBytes(16).toString('hex');
    DATA.authNonces[nonce] = { role, createdAt: Date.now(), status: 'pending' };
    await saveData();
    res.json({ nonce, url: `https://t.me/${AUTH_BOT_USERNAME}?start=${nonce}` });
  } catch (err) {
    res.status(500).json({ error: 'Serverda xatolik yuz berdi.' });
  }
});

app.get('/api/auth/status', (req, res) => {
  const auth = DATA.authNonces[req.query.nonce];
  res.json({ status: auth ? auth.status : 'not_found' });
});

app.post('/api/auth/verify', rateLimit(10), async (req, res) => {
  try {
    const { nonce, code } = req.body || {};
    const auth = DATA.authNonces[nonce];
    if (!auth || Date.now() - auth.createdAt > 600000) return res.status(400).json({ error: 'Kod muddati o\'tgan' });
    const hash = crypto.createHash('sha256').update(String(code)).digest('hex');
    if (hash !== auth.codeHash) {
      auth.attempts = (auth.attempts || 0) + 1;
      if (auth.attempts >= 5) delete DATA.authNonces[nonce];
      await saveData();
      return res.status(400).json({ error: 'Kod xato' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    DATA.sessions[token] = { phone: auth.phone, role: auth.role, createdAt: Date.now() };
    DATA.users[auth.phone] = { ...DATA.users[auth.phone], phone: auth.phone, role: auth.role, telegramId: auth.chatId };
    delete DATA.authNonces[nonce];
    await saveData();

    sendTgMsg(AUTH_BOT_TOKEN, auth.chatId, `✅ Muvaffaqiyatli ro'yxatdan o'tdingiz!`, { inline_keyboard: [[{ text: "🌐 Saytga qaytish", url: SITE_URL }]] });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Serverda xatolik yuz berdi.' });
  }
});

app.get('/api/me', auth(), (req, res) => res.json({ user: { phone: req.user.phone, role: req.user.role } }));

app.get('/api/products', (req, res) => {
  let list = DATA.products.filter(p => p.status === 'available');
  const { q, genre } = req.query;
  if (q) list = list.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  if (genre && genre !== 'all') list = list.filter(p => p.genre === genre);
  list.sort((a, b) => b.createdAt - a.createdAt);
  res.json({ products: list.map(p => {
    const d = p.discount || 0; const finalPrice = d > 0 ? Math.round(p.price * (1 - d / 100)) : p.price;
    return { id: p.id, name: p.name, price: finalPrice, originalPrice: p.price, discount: d, genre: p.genre, paymentType: p.paymentType, image: p.image };
  })});
});

app.get('/api/products/:id', (req, res) => {
  const p = DATA.products.find(x => x.id === req.params.id && x.status === 'available');
  if (!p) return res.status(404).json({ error: 'Topilmadi' });
  const d = p.discount || 0; const finalPrice = d > 0 ? Math.round(p.price * (1 - d / 100)) : p.price;
  res.json({ product: { id: p.id, name: p.name, price: finalPrice, originalPrice: p.price, discount: d, genre: p.genre, paymentType: p.paymentType, image: p.image, description: p.description || '' } });
});

app.get('/api/seller/products', auth(), (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ error: 'Ruxsat yo\'q' });
  res.json({ products: DATA.products.filter(p => p.sellerPhone === req.user.phone) });
});

app.post('/api/seller/products', auth(), rateLimit(20), async (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ error: 'Ruxsat yo\'q' });
  const { name, price, genre, paymentType, image, description, discount } = req.body || {};
  const disc = Number(discount) || 0;
  if (!name || !price || !image) return res.status(400).json({ error: 'Ma\'lumotlar to\'liq emas' });
  const id = crypto.randomBytes(8).toString('hex');
  const product = { id, name, price: Number(price), genre, paymentType, image, description: description || '', discount: disc, sellerPhone: req.user.phone, status: 'available', createdAt: Date.now() };
  DATA.products.push(product); await saveData(); res.json({ product });
});

app.delete('/api/seller/products/:id', auth(), async (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ error: 'Ruxsat yo\'q' });
  const idx = DATA.products.findIndex(p => p.id === req.params.id && p.sellerPhone === req.user.phone);
  if (idx !== -1) DATA.products.splice(idx, 1);
  await saveData(); res.json({ ok: true });
});

app.get('/api/seller/sold', auth(), (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ error: 'Ruxsat yo\'q' });
  res.json({ orders: DATA.orders.filter(o => o.sellerPhone === req.user.phone).sort((a, b) => b.createdAt - a.createdAt) });
});

app.post('/api/orders', auth(), rateLimit(10), async (req, res) => {
  if (req.user.role !== 'customer') return res.status(403).json({ error: 'Ruxsat yo\'q' });
  const { items, buyerName, buyerPhone, lat, lng } = req.body || {};
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'Savat bo\'sh' });

  const matchedProducts = [];
  for (const item of items) {
    const p = DATA.products.find(x => x.id === item.id);
    if (!p || p.status !== 'available') return res.status(400).json({ error: `Asar topilmadi: ${item.name || ''}` });
    matchedProducts.push(p);
  }

  const createdOrders = [];
  for (const p of matchedProducts) {
    const d = p.discount || 0; const finalPrice = d > 0 ? Math.round(p.price * (1 - d / 100)) : p.price;
    p.status = 'sold';
    const order = { id: crypto.randomBytes(8).toString('hex'), productId: p.id, productName: p.name, price: finalPrice, paymentType: p.paymentType, buyerName, buyerPhone, lat, lng, sellerPhone: p.sellerPhone, createdAt: Date.now() };
    DATA.orders.push(order); createdOrders.push(order);
    const seller = DATA.users[p.sellerPhone];
    if (seller && seller.telegramId) sendTgMsg(AUTH_BOT_TOKEN, seller.telegramId, `🎉 Asar sotildi!\n${p.name}\nMijoz: ${buyerName}`);
  }
  await saveData(); res.json({ ok: true, orders: createdOrders });
});

(async () => {
  await loadData();
  app.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
    pollAuthUpdates();
    pollOrderUpdates();
  });
})();