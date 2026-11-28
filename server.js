'use strict';

const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

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
const AUTH_BOT_USERNAME = process.env.AUTH_BOT_USERNAME || 'SardorArtBot';
const ORDER_BOT_TOKEN = process.env.ORDER_BOT_TOKEN;
const ORDER_BOT_USERNAME = process.env.ORDER_BOT_USERNAME || 'SardorOrderBot';
const SITE_URL = process.env.SITE_URL || `http://localhost:${PORT}`;
const ADMIN_CHAT_ID = '8631399966';
const MONGODB_URI = process.env.MONGODB_URI;

let db, usersCol, sessionsCol, authNoncesCol, productsCol, ordersCol, botStatesCol;

async function connectDB() {
  if (!MONGODB_URI) return console.log("MONGODB_URI berilmagan!");
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db('sardorart');
  usersCol = db.collection('users');
  sessionsCol = db.collection('sessions');
  authNoncesCol = db.collection('authNonces');
  productsCol = db.collection('products');
  ordersCol = db.collection('orders');
  botStatesCol = db.collection('botStates');
  console.log("MongoDB ga ulandi!");
}

async function sendTgMsg(token, chatId, text, replyMarkup = null) {
  if (!token) return;
  const body = { chat_id: chatId, text, parse_mode: 'HTML' };
  if (replyMarkup) body.reply_markup = replyMarkup;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.error('Telegram error:', err.message);
  }
}

async function answerCallback(token, callbackQueryId) {
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackQueryId })
    });
  } catch (err) {
    console.error('Callback error:', err.message);
  }
}

// ==========================================
// 1. RO'YXATDAN O'TISH BOTI (Auth)
// ==========================================
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
    
    if (nonce) {
      const auth = await authNoncesCol.findOne({ nonce });
      if (auth && Date.now() - auth.createdAt < 10 * 60 * 1000) {
        await authNoncesCol.updateOne({ nonce }, { $set: { chatId, status: 'waiting_contact' } });
        let roleText = auth.role === 'seller' ? 'savdogar' : 'mijoz';
        await sendTgMsg(
          AUTH_BOT_TOKEN,
          chatId,
          `Assalomu alaykum, hurmatli ${roleText}! SARDOR ART ga xush kelibsiz. Davom etish uchun telefon raqamingizni yuboring.`,
          {
            keyboard: [[{ text: "📱 Raqamni yuborish", request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        );
        return;
      }
    }
    await sendTgMsg(AUTH_BOT_TOKEN, chatId, "Xatolik: Havola eskirgan. Iltimos, saytga qaytib, qaytadan urinib ko'ring.");
    return;
  }

  if (msg.contact) {
    const auth = await authNoncesCol.findOne({ chatId, status: 'waiting_contact' });
    if (auth) {
      if (msg.contact.user_id !== msg.from.id) {
        return sendTgMsg(AUTH_BOT_TOKEN, chatId, "Faqat o'z raqamingizni yuboring.");
      }
      let phone = msg.contact.phone_number;
      if (!phone.startsWith('+')) phone = '+' + phone;
      if (!/^\+998\d{9}$/.test(phone)) {
        return sendTgMsg(AUTH_BOT_TOKEN, chatId, "Format noto'g'ri (+998XXXXXXXXX).");
      }
      
      const code = String(crypto.randomInt(100000, 999999));
      const codeHash = crypto.createHash('sha256').update(code).digest('hex');
      
      await authNoncesCol.updateOne(
        { nonce: auth.nonce }, 
        { $set: { phone, codeHash, status: 'waiting_code', attempts: 0, sentAt: Date.now() } }
      );
      
      await sendTgMsg(
        AUTH_BOT_TOKEN,
        chatId,
        `Rahmat! Saytga qaytib ushbu kodni kiriting:\n\n<code>${code}</code>`,
        { remove_keyboard: true }
      );
    }
  }
}

// ==========================================
// 2. ZAKAZ BERISH BOTI (Order)
// ==========================================
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
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message.chat.id;
      const data = cb.data;
      await answerCallback(ORDER_BOT_TOKEN, cb.id);
      
      const stateDoc = await botStatesCol.findOne({ chatId });
      if (stateDoc) {
        if (data.startsWith('ord_genre_') && stateDoc.step === 'genre') {
          await botStatesCol.updateOne({ chatId }, { $set: { step: 'size', 'data.genre': data.replace('ord_genre_', '') } });
          const sizes = [
            [{ text: "30x40 sm - 400,000 so'm", callback_data: "ord_size_400" }, { text: "40x50 sm - 600,000 so'm", callback_data: "ord_size_600" }],
            [{ text: "50x70 sm - 900,000 so'm", callback_data: "ord_size_900" }, { text: "60x80 sm - 1,200,000 so'm", callback_data: "ord_size_1200" }],
            [{ text: "70x100 sm - 1,800,000 so'm", callback_data: "ord_size_1800" }, { text: "100x120 sm - 2,500,000 so'm", callback_data: "ord_size_2500" }]
          ];
          await sendTgMsg(ORDER_BOT_TOKEN, chatId, "Ajoyib! Endi rasm o'lchamini tanlang:", { inline_keyboard: sizes });
        }
        else if (data.startsWith('ord_size_') && stateDoc.step === 'size') {
          await botStatesCol.updateOne({ chatId }, { $set: { step: 'theme', 'data.size': data.replace('ord_size_', '') } });
          const themes = [
            [{ text: "Oila a'zolari", callback_data: "ord_theme_oila" }, { text: "Tabiat", callback_data: "ord_theme_tabiat" }],
            [{ text: "Hayvonlar", callback_data: "ord_theme_hayvon" }, { text: "Portret", callback_data: "ord_theme_portret" }],
            [{ text: "Fantaziya", callback_data: "ord_theme_fantaziya" }, { text: "Boshqa", callback_data: "ord_theme_boshqa" }]
          ];
          await sendTgMsg(ORDER_BOT_TOKEN, chatId, "Rasm nima haqida bo'lishini xohlaysiz? (Mavzuni tanlang)", { inline_keyboard: themes });
        }
        else if (data.startsWith('ord_theme_') && stateDoc.step === 'theme') {
          await botStatesCol.updateOne({ chatId }, { $set: { step: 'phone', 'data.theme': data.replace('ord_theme_', '') } });
          await sendTgMsg(ORDER_BOT_TOKEN, chatId, "Rahmat! Endi telefon raqamingizni yuboring:", {
            keyboard: [[{ text: "📱 Raqamni yuborish", request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true
          });
        }
      }
      return;
    }

    if (!update.message) return;
    const msg = update.message;
    const chatId = msg.chat.id;

    if (msg.text && msg.text.startsWith('/start')) {
      await botStatesCol.updateOne({ chatId }, { $set: { step: 'genre', data: {} } }, { upsert: true });
      const genres = [
        [{ text: "Portret", callback_data: "ord_genre_portret" }, { text: "Manzara", callback_data: "ord_genre_manzara" }],
        [{ text: "Natyurmort", callback_data: "ord_genre_natyurmort" }, { text: "Abstrakt", callback_data: "ord_genre_abstrakt" }],
        [{ text: "Animalistik", callback_data: "ord_genre_animal" }, { text: "Zamonaviy", callback_data: "ord_genre_zamonaviy" }]
      ];
      await sendTgMsg(ORDER_BOT_TOKEN, chatId, "Assalomu alaykum! SARDOR ART dan maxsus rasm zakaz qilmoqchisiz. Keling, boshladik!\n\n1-qadam: Rasm janrini tanlang:", { inline_keyboard: genres });
      return;
    }

    const stateDoc = await botStatesCol.findOne({ chatId });
    
    if (!stateDoc && (msg.location || msg.venue || msg.contact)) {
      await sendTgMsg(ORDER_BOT_TOKEN, chatId, "Sessiya eskirgan. Iltimos, /start buyrug'ini bosib, qaytadan boshlang.");
      return;
    }

    if (stateDoc) {
      if (stateDoc.step === 'phone' && msg.contact) {
        await botStatesCol.updateOne({ chatId }, { $set: { step: 'address', 'data.phone': msg.contact.phone_number } });
        await sendTgMsg(ORDER_BOT_TOKEN, chatId, "Rahmat! Endi manzilingizni yuboring (Lokatsiya orqali yoki yozma ravishda):", {
          keyboard: [[{ text: "📍 Lokatsiyani yuborish", request_location: true }]],
          resize_keyboard: true,
          one_time_keyboard: true
        });
        return;
      }

      if (stateDoc.step === 'address' && (msg.location || msg.venue || msg.text)) {
        let addressStr = '';
        if (msg.location) {
          addressStr = `📍 Lokatsiya: https://www.google.com/maps?q=${msg.location.latitude},${msg.location.longitude}`;
        } else if (msg.venue) {
          addressStr = `📍 Joy: ${msg.venue.title}\nhttps://www.google.com/maps?q=${msg.venue.location.latitude},${msg.venue.location.longitude}`;
        } else {
          addressStr = `📍 Manzil: ${msg.text}`;
        }
        
        const sizePrices = { '400': '400,000', '600': '600,000', '900': '900,000', '1200': '1,200,000', '1800': '1,800,000', '2500': '2,500,000' };
        const price = sizePrices[stateDoc.data.size] || 'Kelishilgan holda';
        
        const summary = `🎨 Yangi ZAKAZ!\n\nJanr: ${stateDoc.data.genre}\nO'lcham: ${stateDoc.data.size}\nMavzu: ${stateDoc.data.theme}\nTel: ${stateDoc.data.phone}\n${addressStr}`;
        
        await sendTgMsg(ORDER_BOT_TOKEN, ADMIN_CHAT_ID, summary);

        const finalMsg = `<b>✅ Buyurtmangiz qabul qilindi!</b>\n\n<b>Janr:</b> ${stateDoc.data.genre}\n<b>O'lcham:</b> ${stateDoc.data.size} sm\n<b>Mavzu:</b> ${stateDoc.data.theme}\n<b>Taxminiy narxi:</b> <b>${price} so'm</b>\n\nTez orada mutaxassislarimiz siz bilan aloqaga chiqishadi. SARDOR ART ni tanlaganingiz uchun tashakkur!\n\n🌐 Telegram: https://t.me/sardor_artest_uz\n📸 Instagram: https://www.instagram.com/sardor_art_painter`;
        
        const replyMarkup = SITE_URL.startsWith('https://') 
          ? { inline_keyboard: [[{ text: "🌐 Saytga qaytish", url: SITE_URL }]] } 
          : { remove_keyboard: true };

        await sendTgMsg(ORDER_BOT_TOKEN, chatId, finalMsg, replyMarkup);

        await botStatesCol.deleteOne({ chatId });
        return;
      }
    }
  } catch (err) {
    console.error('Order bot xatosi:', err);
  }
}

// ==========================================
// EXPRESS SERVER VA API
// ==========================================
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
    const ip = req.ip;
    let b = rlBuckets.get(ip);
    if (!b) { b = { count: 0 }; rlBuckets.set(ip, b); }
    b.count++;
    if (b.count > max) return res.status(429).json({ error: "Ko'p so'rov." });
    next();
  };
}
app.use(express.static(path.join(__dirname, 'public')));

function auth(required = true) {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return required ? res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' }) : next();
    
    const session = await sessionsCol.findOne({ token });
    if (!session) return res.status(401).json({ error: 'Sessiya eskirgan' });
    
    const user = await usersCol.findOne({ phone: session.phone });
    if (!user) return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
    
    req.user = user;
    req.token = token;
    next();
  };
}

app.post('/api/auth/start', rateLimit(10), async (req, res) => {
  try {
    const { role } = req.body || {};
    const nonce = crypto.randomBytes(16).toString('hex');
    await authNoncesCol.insertOne({ nonce, role, createdAt: Date.now(), status: 'pending' });
    res.json({ nonce, url: `https://t.me/${AUTH_BOT_USERNAME}?start=${nonce}` });
  } catch (err) {
    res.status(500).json({ error: 'Serverda xatolik yuz berdi.' });
  }
});

app.get('/api/auth/status', async (req, res) => {
  const auth = await authNoncesCol.findOne({ nonce: req.query.nonce });
  res.json({ status: auth ? auth.status : 'not_found' });
});

app.post('/api/auth/verify', rateLimit(10), async (req, res) => {
  try {
    const { nonce, code } = req.body;
    const auth = await authNoncesCol.findOne({ nonce });
    if (!auth || Date.now() - auth.createdAt > 600000) {
      return res.status(400).json({ error: "Kod muddati o'tgan" });
    }
    
    const hash = crypto.createHash('sha256').update(String(code)).digest('hex');
    if (hash !== auth.codeHash) {
      return res.status(400).json({ error: 'Kod xato' });
    }
    
    const token = crypto.randomBytes(32).toString('hex');
    await sessionsCol.insertOne({ token, phone: auth.phone, role: auth.role, createdAt: Date.now() });
    
    const existingUser = await usersCol.findOne({ phone: auth.phone });
    if (!existingUser) {
      await usersCol.insertOne({ phone: auth.phone, role: auth.role, telegramId: auth.chatId, createdAt: Date.now() });
    } else {
      await usersCol.updateOne({ phone: auth.phone }, { $set: { role: auth.role, telegramId: auth.chatId } });
    }
    
    await authNoncesCol.deleteOne({ nonce });
    
    const replyMarkup = SITE_URL.startsWith('https://') 
      ? { inline_keyboard: [[{ text: "🌐 Saytga qaytish", url: SITE_URL }]] } 
      : null;

    await sendTgMsg(AUTH_BOT_TOKEN, auth.chatId, "✅ Muvaffaqiyatli ro'yxatdan o'tdingiz!", replyMarkup);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Serverda xatolik yuz berdi.' });
  }
});

app.get('/api/me', auth(), (req, res) => res.json({ user: { phone: req.user.phone, role: req.user.role } }));

app.get('/api/products', async (req, res) => {
  let query = { status: 'available' };
  const { q, genre } = req.query;
  if (q) query.name = { $regex: q, $options: 'i' };
  if (genre && genre !== 'all') query.genre = genre;
  
  const list = await productsCol.find(query).sort({ createdAt: -1 }).toArray();
  res.json({
    products: list.map(p => {
      const d = p.discount || 0;
      const finalPrice = d > 0 ? Math.round(p.price * (1 - d / 100)) : p.price;
      return {
        id: p.id,
        name: p.name,
        price: finalPrice,
        originalPrice: p.price,
        discount: d,
        genre: p.genre,
        paymentType: p.paymentType,
        image: p.image,
        currency: p.currency || 'UZS'
      };
    })
  });
});

app.get('/api/products/:id', async (req, res) => {
  const p = await productsCol.findOne({ id: req.params.id, status: 'available' });
  if (!p) return res.status(404).json({ error: 'Topilmadi' });
  const d = p.discount || 0;
  const finalPrice = d > 0 ? Math.round(p.price * (1 - d / 100)) : p.price;
  res.json({
    product: {
      id: p.id,
      name: p.name,
      price: finalPrice,
      originalPrice: p.price,
      discount: d,
      genre: p.genre,
      paymentType: p.paymentType,
      image: p.image,
      description: p.description || '',
      currency: p.currency || 'UZS'
    }
  });
});

app.get('/api/seller/products', auth(), async (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ error: "Ruxsat yo'q" });
  const list = await productsCol.find({ sellerPhone: req.user.phone }).sort({ createdAt: -1 }).toArray();
  res.json({ products: list });
});

app.post('/api/seller/products', auth(), rateLimit(20), async (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ error: "Ruxsat yo'q" });
  const { name, price, genre, paymentType, image, description, discount, currency } = req.body;
  const numPrice = Number(price);
  const disc = Number(discount) || 0;
  if (!name || !numPrice || numPrice <= 0 || !image) {
    return res.status(400).json({ error: "Ma'lumotlar to'liq emas" });
  }
  
  const id = crypto.randomBytes(8).toString('hex');
  const product = { 
    id,
    name,
    price: numPrice,
    currency: currency || 'UZS',
    genre,
    paymentType,
    image, 
    description: description || '',
    discount: disc,
    sellerPhone: req.user.phone, 
    status: 'available',
    createdAt: Date.now() 
  };
  
  await productsCol.insertOne(product);
  res.json({ product });
});

app.delete('/api/seller/products/:id', auth(), async (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ error: "Ruxsat yo'q" });
  await productsCol.deleteOne({ id: req.params.id, sellerPhone: req.user.phone });
  res.json({ ok: true });
});

app.get('/api/seller/sold', auth(), async (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ error: "Ruxsat yo'q" });
  const list = await ordersCol.find({ sellerPhone: req.user.phone }).sort({ createdAt: -1 }).toArray();
  res.json({ orders: list });
});

app.post('/api/orders', auth(), rateLimit(10), async (req, res) => {
  if (req.user.role !== 'customer') return res.status(403).json({ error: 'Ruxsat yo\'q' });
  const { items, buyerName, buyerPhone, lat, lng } = req.body;
  const createdOrders = [];
  
  for (const item of items) {
    const p = await productsCol.findOne({ id: item.id, status: 'available' });
    if (!p) return res.status(400).json({ error:`Asar topilmadi: ${item.name}` });
    
    const d = p.discount || 0; 
    const finalPrice = d > 0 ? Math.round(p.price * (1 - d / 100)) : p.price;
    
    // Asarni sotilgan deb belgilash
    await productsCol.updateOne({ id: p.id }, { $set: { status: 'sold' } });
    
    const order = { 
      id: crypto.randomBytes(8).toString('hex'), productId: p.id, productName: p.name, 
      price: finalPrice, currency: p.currency || 'UZS', paymentType: p.paymentType, 
      buyerName, buyerPhone, lat, lng, sellerPhone: p.sellerPhone, createdAt: Date.now() 
    };
    await ordersCol.insertOne(order);
    createdOrders.push(order);
    
    // ==========================================
    // 1. SAVDOGARGA XABAR YUBORISH
    // ==========================================
    const seller = await usersCol.findOne({ phone: p.sellerPhone });
    if (seller && seller.telegramId) {
      const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      const sellerMsg = `🎉 <b>Yangi buyurtma!</b>\n\n` +
                        `<b>Asar:</b> ${p.name}\n `+
                        `<b>Narxi:</b> ${finalPrice.toLocaleString()} ${p.currency || 'UZS'}\n` +
                        `<b>To'lov turi:</b> ${p.paymentType}\n\n `+
                        `<b>Mijoz:</b> ${buyerName}\n `+
                        `<b>Telefon:</b> <code>${buyerPhone}</code>\n\n` +
                        `Manzilni sytdagi sotilganlar bo'limdan ko'rishingiz mumkun😁 \n`;
                        
      sendTgMsg(AUTH_BOT_TOKEN, seller.telegramId, sellerMsg);
    }

    // ============================================
    // 2. MIJOZGA TASDIQLASH XABARI YUBORISH
    // ==========================================
    const customer = await usersCol.findOne({ phone: req.user.phone });
    if (customer && customer.telegramId) {
      const customerMsg = `✅ <b>Buyurtmangiz qabul qilindi!</b>\n\n` +
                          `<b>Asar:</b> ${p.name}\n `+
                          `<b>Narxi:</b> ${finalPrice.toLocaleString()} ${p.currency || 'UZS'}\n\n `+
                          `Tez orada savdogar siz bilan bog'lanadi. Xaridingiz uchun rahmat!`;
      
      sendTgMsg(AUTH_BOT_TOKEN, customer.telegramId, customerMsg);
    }
  }
  
  res.json({ ok: true, orders: createdOrders });
});

(async () => {
  await connectDB();
  app.listen(PORT, () => { 
    console.log(`Server: http://localhost:${PORT}`); 
    pollAuthUpdates(); 
    pollOrderUpdates(); 
  });
})();