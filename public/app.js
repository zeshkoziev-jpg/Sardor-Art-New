(function () {
  'use strict';

  const DICT = {
    uz: {
      home: 'Bosh sahifa', profile: 'Profil', cart: 'Savat', logout: 'Chiqish', seller: 'Savdogar', sold: 'Sotilganlar',
      all: 'Barchasi', portrait: 'Portret', landscape: 'Manzara', stilllife: 'Natyurmort', abstract: 'Abstrakt', animal: 'Animalistik', modern: 'Zamonaviy', sculpture: 'Haykaltaroshlik', photography: 'Fotografiya',
      prepay100: '100% oldindan', prepay50: '50% oldindan, 50% keyin', postpay100: '100% keyin',
      search: 'Qidirish', add_to_cart: 'Savatga qo\'shish', buy: 'Sotib olish', remove: 'O\'chirish',
      checkout: 'Buyurtma berish', submit_order: 'Buyurtmani tasdiqlash', get_location: 'Joylashuvni aniqlash',
      save: 'Saqlash', create: 'Yaratish', empty_catalog: 'Hech narsa topilmadi', cart_empty: 'Savat bo\'sh',
      cart_total: 'Jami', required: 'Iltimos, maydonlarni to\'ldiring', login_needed: 'Tizimga kiring',
      order_success: 'Buyurtma qabul qilindi!', error_generic: 'Xatolik yuz berdi', image_req: 'Rasm tanlang',
      name: 'Ism', phone: 'Telefon', address: 'Manzil', my_works: 'Mening asarlarim', no_works: 'Hozircha asarlaringiz yo\'q',
      product_name: 'Asar nomi', price: 'Narx', genre: 'Janr', payment_type: 'To\'lov turi', public: 'Ommaga taqdim etish',
      seller_panel: 'Savdogar paneli', sold_items: 'Sotilganlar', buyer: 'Mijoz', map: 'Xarita', payment_info: 'To\'lov ma\'lumoti',
      upfront: 'Oldindan to\'lov', remaining: 'Keyin to\'lash', choose_role: 'Rolni tanlang', customer_role: 'Mijoz',
      seller_role: 'Savdogar', enter_code: 'Tasdiqlash kodini kiriting', verify: 'Tasdiqlash', success_auth: 'Muvaffaqiyatli kirdingiz!', waiting_tg: 'Telegramda botga o\'ting va raqamingizni yuboring...',
      favorites: 'Sevimlilar', empty_fav: 'Sizda hali sevimli asarlar yo\'q', add_to_fav: 'Sevimlilarga qo\'shildi', remove_from_fav: 'Sevimlilardan olib tashlandi',
      help_btn: '💬 Yordam uchun', currency: 'Valyuta'
    },
    ru: {
      home: 'Главная', profile: 'Профиль', cart: 'Корзина', logout: 'Выйти', seller: 'Продавец', sold: 'Продано',
      all: 'Все', portrait: 'Портрет', landscape: 'Пейзаж', stilllife: 'Натюрморт', abstract: 'Абстракция', animal: 'Анималистика', modern: 'Современное', sculpture: 'Скульптура', photography: 'Фотография',
      prepay100: '100% предоплата', prepay50: '50% предоплата, 50% после', postpay100: '100% после',
      search: 'Поиск', add_to_cart: 'В корзину', buy: 'Купить', remove: 'Удалить',
      checkout: 'Оформить', submit_order: 'Подтвердить', get_location: 'Определить местоположение',
      save: 'Сохранить', create: 'Создать', empty_catalog: 'Ничего не найдено', cart_empty: 'Корзина пуста',
      cart_total: 'Итого', required: 'Заполните поля', login_needed: 'Войдите в систему',
      order_success: 'Заказ принят!', error_generic: 'Ошибка', image_req: 'Выберите картинку',
      name: 'Имя', phone: 'Телефон', address: 'Адрес', my_works: 'Мои работы', no_works: 'У вас пока нет работ',
      product_name: 'Название', price: 'Цена', genre: 'Жанр', payment_type: 'Тип оплаты', public: 'Опубликовать',
      seller_panel: 'Панель продавца', sold_items: 'Продажи', buyer: 'Клиент', map: 'Карта', payment_info: 'Информация об оплате',
      upfront: 'Предоплата', remaining: 'Остаток', choose_role: 'Выберите роль', customer_role: 'Клиент',
      seller_role: 'Продавец', enter_code: 'Введите код', verify: 'Подтвердить', success_auth: 'Успешный вход!', waiting_tg: 'Перейдите в бота и отправьте номер...',
      favorites: 'Избранное', empty_fav: 'У вас пока нет избранных работ', add_to_fav: 'Добавлено в избранное', remove_from_fav: 'Удалено из избранного',
      help_btn: '💬 Поддержка', currency: 'Валюта'
    },
    en: {
      home: 'Home', profile: 'Profile', cart: 'Cart', logout: 'Logout', seller: 'Seller', sold: 'Sold',
      all: 'All', portrait: 'Portrait', landscape: 'Landscape', stilllife: 'Still Life', abstract: 'Abstract', animal: 'Animal', modern: 'Modern', sculpture: 'Sculpture', photography: 'Photography',
      prepay100: '100% prepay', prepay50: '50% prepay, 50% after', postpay100: '100% postpay',
      search: 'Search', add_to_cart: 'Add to Cart', buy: 'Buy', remove: 'Remove',
      checkout: 'Checkout', submit_order: 'Submit Order', get_location: 'Get Location',
      save: 'Save', create: 'Create', empty_catalog: 'Nothing found', cart_empty: 'Cart is empty',
      cart_total: 'Total', required: 'Fill the fields', login_needed: 'Please login',
      order_success: 'Order placed!', error_generic: 'Error', image_req: 'Select image',
      name: 'Name', phone: 'Phone', address: 'Address', my_works: 'My Works', no_works: 'You have no works yet',
      product_name: 'Name', price: 'Price', genre: 'Genre', payment_type: 'Payment Type', public: 'Publish',
      seller_panel: 'Seller Panel', sold_items: 'Sold Items', buyer: 'Buyer', map: 'Map', payment_info: 'Payment Info',
      upfront: 'Upfront', remaining: 'Remaining', choose_role: 'Choose Role', customer_role: 'Customer',
      seller_role: 'Seller', enter_code: 'Enter Code', verify: 'Verify', success_auth: 'Login successful!', waiting_tg: 'Go to bot and send phone...',
      favorites: 'Favorites', empty_fav: 'You have no favorite works yet', add_to_fav: 'Added to favorites', remove_from_fav: 'Removed from favorites',
      help_btn: '💬 Support', currency: 'Currency'
    }
  };

  const getLang = () => localStorage.getItem('lang') || 'uz';
  const t = (key) => DICT[getLang()][key] || key;
  const esc = (s) => String(s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);

  // Valyutani formatlash funksiyasi
  const formatPrice = (price, currency = 'UZS') => {
    const num = Number(price) || 0;
    if (currency === 'USD') return '$' + num.toLocaleString('en-US');
    if (currency === 'RUB') return num.toLocaleString('ru-RU') + ' ₽';
    return num.toLocaleString('ru-RU') + ' so\'m';
  };

  let AUTH_USER = null;
  const getToken = () => localStorage.getItem('token');

  async function fetchMe() {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) AUTH_USER = (await res.json()).user;
      else localStorage.removeItem('token');
    } catch {}
  }

  async function api(url, opts = {}) {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const fetchOpts = { ...opts, headers };
    if (fetchOpts.body && typeof fetchOpts.body === 'object') {
      fetchOpts.body = JSON.stringify(fetchOpts.body);
    }

    try {
      const res = await fetch(url, fetchOpts);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Server xatosi (${res.status})`);
      return data;
    } catch (err) {
      if (err.name === 'TypeError') throw new Error('Server uyg\'onmoqda yoki internet uzildi...');
      throw err;
    }
  }

  function toast(msg) {
    let el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = msg;
    el.style.opacity = 1;
    setTimeout(() => el.style.opacity = 0, 3000);
  }

  const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');
  const setCart = (c) => { localStorage.setItem('cart', JSON.stringify(c)); updateCartBadge(); };
  function addToCart(item) {
    const c = getCart(); const f = c.find(x => x.id === item.id);
    if (f) f.qty += 1; else c.push({ ...item, qty: 1 });
    setCart(c);
  }
  function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
      const count = getCart().reduce((s, x) => s + x.qty, 0);
      badge.textContent = count;
      badge.classList.toggle('hidden', count === 0);
    }
  }

  // === SEVIMLILAR MANTIQI ===
  const getFavs = () => JSON.parse(localStorage.getItem('favorites') || '[]');
  function toggleFav(id) {
    let favs = getFavs();
    if (favs.includes(id)) {
      favs = favs.filter(x => x !== id);
      toast(t('remove_from_fav'));
    } else {
      favs.push(id);
      toast(t('add_to_fav'));
    }
    localStorage.setItem('favorites', JSON.stringify(favs));
    updateFavBadge();
    return favs.includes(id);
  }
  function updateFavBadge() {
    const badge = document.getElementById('fav-badge');
    if (badge) {
      const count = getFavs().length;
      badge.textContent = count;
      badge.classList.toggle('hidden', count === 0);
    }
  }

  function renderHeader() {
    const host = document.getElementById('main-header');
    if (!host) return;
    const isAuth = !!AUTH_USER;
    host.innerHTML = `
      <div class="header-inner">
        <button class="menu-btn" id="menu-toggle">☰</button>
        <a href="/" class="logo">SARDOR ART</a>
        <div class="search-bar">
          <input type="text" id="search-input" placeholder="${t('search')}...">
        </div>
        <nav class="nav-links">
          <a href="/">${t('home')}</a>
          <a href="/order.html" style="color:var(--accent); font-weight:bold;">Zakaz berish</a>

          <!-- Sevimlilar yurakchasi -->
          <a href="/favorites.html" title="${t('favorites')}" style="font-size: 18px; padding: 6px 12px;">
            🤍 <span id="fav-badge" class="badge hidden">0</span>
          </a>

          ${isAuth ? `${AUTH_USER.role === 'seller' ? `<a href="/seller.html">${t('seller')}</a><a href="/sold.html">${t('sold')}</a>` : ''}<a href="/profile.html">${t('profile')}</a>` : `<a href="/profile.html">${t('profile')}</a>`}
          <a href="/cart.html">${t('cart')} <span id="cart-badge" class="badge hidden">0</span></a>
          ${isAuth ? `<button id="logout-btn">${t('logout')}</button>` : ''}
        </nav>
      </div>
    `;
    updateCartBadge();
    updateFavBadge();

    document.getElementById('logout-btn')?.addEventListener('click', () => { localStorage.removeItem('token'); location.href = '/'; });

    const searchInput = document.getElementById('search-input');
    const urlQ = new URLSearchParams(location.search).get('q');
    if (urlQ) searchInput.value = urlQ;
    let timer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const q = e.target.value.trim();
        if (document.body.dataset.page === 'index') document.dispatchEvent(new CustomEvent('search', { detail: q }));
        else location.href = `/index.html?q=${encodeURIComponent(q)}`;
      }, 250);
    });
    document.getElementById('menu-toggle')?.addEventListener('click', () => document.getElementById('sidebar')?.classList.toggle('open'));
  }

  async function renderFooter() {
    const host = document.getElementById('main-footer');
    if (!host) return;
    const lang = getLang();
    let phone = '+998 90 123 45 67';
    try { const res = await fetch('/api/config'); const data = await res.json(); if (data.phone) phone = data.phone; } catch (e) {}

    host.innerHTML = `
      <div class="footer-inner">
        <div class="footer-phone">${phone}</div>
        <div class="payment-logos"><span class="pay-logo">HUMO</span><span class="pay-logo">UZCARD</span><span class="pay-logo">VISA</span><span class="pay-logo">MASTERCARD</span></div>
        <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
          <!-- Yordam tugmasi -->
          <a href="tg://user?id=8631399966" class="btn" style="padding: 6px 12px; font-size: 13px; border-radius: 8px; color: var(--accent-2); border-color: var(--accent);">${t('help_btn')}</a>

          <div class="lang-switch">
            <button data-lang="uz" class="${lang === 'uz' ? 'active' : ''}">UZ</button>
            <button data-lang="ru" class="${lang === 'ru' ? 'active' : ''}">RU</button>
            <button data-lang="en" class="${lang === 'en' ? 'active' : ''}">EN</button>
          </div>
        </div>
      </div>
    `;
    host.querySelectorAll('.lang-switch button').forEach(btn => btn.onclick = () => { localStorage.setItem('lang', btn.dataset.lang); location.reload(); });
  }

  function initBgAnimation() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const container = document.getElementById('bg-animation');
    if (!container) return;
    const emojis = ['🎨', '🖌️', '🖼️', '✏️', '🖍️', '🎭', '🧑‍🎨'];
    for (let i = 0; i < 20; i++) {
      const span = document.createElement('span');
      span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      span.style.left = `${Math.random() * 100}vw`;
      span.style.fontSize = `${Math.random() * 20 + 20}px`;
      span.style.opacity = Math.random() * 0.1 + 0.15;
      span.style.animationDuration = `${Math.random() * 10 + 10}s`;
      span.style.animationDelay = `${Math.random() * 10}s`;
      container.appendChild(span);
    }
  }

  // === SAHIFALAR ===
  async function initIndex() {
    const sidebar = document.getElementById('sidebar');
    const genres = ['all', 'portrait', 'landscape', 'stilllife', 'abstract', 'animal', 'modern', 'sculpture', 'photography'];
    if (sidebar) sidebar.innerHTML = `<h3>${t('genre')}</h3><ul class="genre-list">${genres.map(g => `<li data-genre="${g}">${t(g)}</li>`).join('')}</ul>`;

    let currentGenre = 'all';
    const grid = document.getElementById('products-grid');
    const empty = document.getElementById('empty-msg');

    async function load(query = '') {
      try {
        const res = await api(`/api/products?q=${encodeURIComponent(query)}&genre=${currentGenre}`);
        if (res.products.length === 0) { grid.innerHTML = ''; empty.classList.remove('hidden'); return; }
        empty.classList.add('hidden');

        const favs = getFavs();
        grid.innerHTML = res.products.map(p => {
          let priceHtml = `<div class="card-price">${formatPrice(p.price, p.currency)}</div>`;
          if (p.discount > 0) {
            priceHtml = `<div class="card-price" style="color:#ff4d4f;">${formatPrice(p.price, p.currency)} <span style="text-decoration:line-through; color:#888; font-size:14px; margin-left:5px;">${formatPrice(p.originalPrice, p.currency)}</span><span style="background:#ff4d4f; color:white; padding:2px 5px; border-radius:5px; font-size:12px; margin-left:5px;">-${p.discount}%</span></div>`;
          }
          const isFav = favs.includes(p.id);
          return `
          <div class="card">
            <button class="fav-btn ${isFav ? 'active' : ''}" data-fav="${p.id}">${isFav ? '❤️' : '🤍'}</button>
            <a href="/product.html?id=${p.id}" style="display:block; height:100%; text-decoration:none; color:inherit;">
              <img src="${p.image}" class="card-img" alt="${esc(p.name)}">
              <div class="card-body">
                <div class="card-title">${esc(p.name)}</div>
                <div class="card-genre">${t(p.genre)}</div>
                ${priceHtml}
              </div>
            </a>
          </div>`;
        }).join('');

        grid.querySelectorAll('[data-fav]').forEach(btn => {
          btn.onclick = (e) => {
            e.preventDefault(); e.stopPropagation();
            const isNowFav = toggleFav(btn.dataset.fav);
            btn.textContent = isNowFav ? '❤️' : '🤍';
            btn.classList.toggle('active', isNowFav);
          };
        });
      } catch (e) { toast(e.message); }
    }

    if (sidebar) {
      sidebar.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
          sidebar.querySelectorAll('li').forEach(el => el.classList.remove('active'));
          e.target.classList.add('active');
          currentGenre = e.target.dataset.genre;
          load(document.getElementById('search-input').value.trim());

          if (window.innerWidth <= 768) sidebar.classList.remove('open');
        }
      });
      sidebar.querySelector('[data-genre="all"]')?.classList.add('active');
    }
    document.addEventListener('search', (e) => load(e.detail));
    const initialQ = new URLSearchParams(location.search).get('q') || '';
    load(initialQ);
  }

  async function initFavorites() {
    const grid = document.getElementById('fav-grid');
    const empty = document.getElementById('empty-fav');
    const favs = getFavs();
    if (!favs.length) { empty.classList.remove('hidden'); return; }

    try {
      const res = await api('/api/products');
      const favProducts = res.products.filter(p => favs.includes(p.id));
      if (!favProducts.length) { empty.classList.remove('hidden'); return; }

      grid.innerHTML = favProducts.map(p => {
        let priceHtml = `<div class="card-price">${formatPrice(p.price, p.currency)}</div>`;
        return `
        <div class="card">
          <button class="fav-btn active" data-fav="${p.id}">❤️</button>
          <a href="/product.html?id=${p.id}" style="display:block; height:100%; text-decoration:none; color:inherit;">
            <img src="${p.image}" class="card-img" alt="${esc(p.name)}">
            <div class="card-body">
              <div class="card-title">${esc(p.name)}</div>
              <div class="card-genre">${t(p.genre)}</div>
              ${priceHtml}
            </div>
          </a>
        </div>`;
      }).join('');

      grid.querySelectorAll('[data-fav]').forEach(btn => {
        btn.onclick = (e) => {
          e.preventDefault(); e.stopPropagation();
          toggleFav(btn.dataset.fav);
          initFavorites();
        };
      });
    } catch (e) { toast(e.message); }
  }

  async function initProduct() {
    const id = new URLSearchParams(location.search).get('id');
    const host = document.getElementById('product-detail');
    if (!id) return host.innerHTML = '<p>Xato</p>';
    try {
      const res = await api(`/api/products/${id}`);
      const p = res.product;
      const isFav = getFavs().includes(p.id);

      let priceHtml = `<div class="price">${formatPrice(p.price, p.currency)}</div>`;
      if (p.discount > 0) {
        priceHtml = `<div class="price" style="color:#ff4d4f;">${formatPrice(p.price, p.currency)} <span style="text-decoration:line-through; color:#888; font-size:20px; margin-left:10px;">${formatPrice(p.originalPrice, p.currency)}</span><span style="background:#ff4d4f; color:white; padding:3px 8px; border-radius:5px; font-size:16px; margin-left:10px;">-${p.discount}%</span></div>`;
      }
      let descHtml = p.description ? `<div class="mt-2" style="line-height:1.6; color:#aaa; margin-bottom:20px;">${esc(p.description)}</div>` : '';

      host.innerHTML = `
        <div class="product-layout">
          <div class="product-image"><img src="${p.image}" alt="${esc(p.name)}"></div>
          <div class="product-info">
            <div class="genre-tag">${t(p.genre)}</div>
            <h1>${esc(p.name)}</h1>
            ${descHtml}
            ${priceHtml}
            <div class="payment-info"><strong>${t('payment_type')}:</strong> ${t(p.paymentType)}</div>
            <div style="display:flex; gap:10px;">
              <button class="btn btn-primary" id="add-btn" style="flex:1;">${t('add_to_cart')}</button>
              <button class="btn" id="fav-btn-detail" style="font-size:20px; padding:10px 15px;">${isFav ? '❤️' : '🤍'}</button>
            </div>
          </div>
        </div>`;

      document.getElementById('add-btn').onclick = () => {
        addToCart({ id: p.id, name: p.name, price: p.price, currency: p.currency, image: p.image, paymentType: p.paymentType });
        toast(t('add_to_cart'));
      };
      document.getElementById('fav-btn-detail').onclick = (e) => {
        const isNowFav = toggleFav(p.id);
        e.target.textContent = isNowFav ? '❤️' : '🤍';
      };
    } catch (e) { host.innerHTML = `<p>${e.message}</p>`; }
  }

  function initCart() {
    const list = document.getElementById('cart-list');
    const summary = document.getElementById('cart-summary');
    const totalEl = document.getElementById('cart-total-price');

    function render() {
      const cart = getCart();
      if (!cart.length) { list.innerHTML = `<p class="empty-msg">${t('cart_empty')}</p>`; summary.classList.add('hidden'); return; }
      summary.classList.remove('hidden');
      let total = 0;

      list.innerHTML = cart.map(item => {
        total += item.price * item.qty;
        return `<div class="cart-item">
          <img src="${item.image}" alt="">
          <div class="cart-item-info">
            <h3>${esc(item.name)}</h3>
            <div class="price">${formatPrice(item.price, item.currency || 'UZS')}</div>
            <div class="qty-controls">
              <button data-id="${item.id}" data-act="minus">-</button>
              <span>${item.qty}</span>
              <button data-id="${item.id}" data-act="plus">+</button>
            </div>
          </div>
          <button class="btn btn-danger" data-id="${item.id}" data-act="remove">${t('remove')}</button>
        </div>`;
      }).join('');

      totalEl.textContent = formatPrice(total, cart[0]?.currency || 'UZS');
    }

    list.addEventListener('click', (e) => {
      const btn = e.target.closest('button'); if (!btn) return;
      const id = btn.dataset.id; const act = btn.dataset.act;
      let cart = getCart(); const item = cart.find(x => x.id === id); if (!item) return;
      if (act === 'plus') item.qty++; else if (act === 'minus' && item.qty > 1) item.qty--; else if (act === 'remove') cart = cart.filter(x => x.id !== id);
      setCart(cart); render();
    });

    document.getElementById('checkout-btn').onclick = () => {
      if (!getToken()) return location.href = '/profile.html';
      location.href = '/checkout.html';
    };
    render();
  }

  async function initCheckout() {
    const host = document.getElementById('main-content');
    const cart = getCart();
    if (!cart.length) return host.innerHTML = `<p>${t('cart_empty')}</p>`;
    let total = 0, upfront = 0, remaining = 0;

    cart.forEach(item => {
      const sum = item.price * item.qty; total += sum;
      const pt = item.paymentType || 'prepay100';
      if (pt === 'prepay100') upfront += sum; else if (pt === 'prepay50') { upfront += Math.floor(sum / 2); remaining += Math.ceil(sum / 2); } else if (pt === 'postpay100') remaining += sum;
    });

    const curr = cart[0]?.currency || 'UZS';

    host.innerHTML = `
      <h2>${t('checkout')}</h2>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
        <div>
          <div class="form-group"><label>${t('name')}</label><input type="text" id="c-name" class="input"></div>
          <div class="form-group"><label>${t('phone')}</label><input type="text" id="c-phone" class="input" value="${AUTH_USER?.phone || ''}"></div>
          <button class="btn btn-primary" id="loc-btn">${t('get_location')}</button>
          <div id="map-preview" style="margin-top: 15px;"></div>
        </div>
        <div>
          <div class="cart-summary" style="text-align: left;">
            <p><strong>${t('cart_total')}:</strong> ${formatPrice(total, curr)}</p>
            <p><strong>${t('upfront')}:</strong> ${formatPrice(upfront, curr)}</p>
            <p><strong>${t('remaining')}:</strong> ${formatPrice(remaining, curr)}</p>
            <hr style="margin:15px 0; border-color:#333;">
            <button id="order-btn" class="btn btn-primary btn-block">${t('submit_order')}</button>
          </div>
        </div>
      </div>
    `;

    let lat = null, lng = null;
    document.getElementById('loc-btn').onclick = () => {
      navigator.geolocation.getCurrentPosition(pos => {
        lat = pos.coords.latitude; lng = pos.coords.longitude;
        document.getElementById('map-preview').innerHTML = `<iframe width="100%" height="200" style="border:0;border-radius:8px;" src="https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed"></iframe>`;
      }, () => toast(t('error_generic')));
    };

    document.getElementById('order-btn').onclick = async () => {
      if (!lat) return toast(t('get_location'));
      const name = document.getElementById('c-name').value.trim();
      const phone = document.getElementById('c-phone').value.trim();
      if (!name || !phone) return toast(t('required'));

      try {
        await api('/api/orders', { method: 'POST', body: { items: cart.map(x => ({ id: x.id, qty: x.qty, name: x.name })), buyerName: name, buyerPhone: phone, lat, lng } });
        localStorage.removeItem('cart');
        toast(t('order_success'));
        setTimeout(() => location.href = '/', 1000);
      } catch (e) { toast(e.message); }
    };
  }

  function initProfile() {
    const area = document.getElementById('main-content');
    if (AUTH_USER) {
      area.innerHTML = `
        <div class="card" style="max-width: 400px; margin: 40px auto; text-align: center; padding: 30px;">
          <h2>${esc(AUTH_USER.phone)}</h2>
          <p style="margin:20px 0;">Rol: <b>${AUTH_USER.role === 'seller' ? t('seller_role') : t('customer_role')}</b></p>
          ${AUTH_USER.role === 'seller' ? `<a href="/seller.html" class="btn btn-primary" style="margin-bottom:10px; display:block;">${t('seller_panel')}</a>` : ''}
          <button id="logout-profile" class="btn btn-danger btn-block">${t('logout')}</button>
        </div>
      `;
      document.getElementById('logout-profile').onclick = () => { localStorage.removeItem('token'); location.href = '/'; };
      return;
    }

    area.innerHTML = `
      <div class="card" style="max-width: 400px; margin: 40px auto; text-align: center; padding: 30px;">
        <h2>${t('choose_role')}</h2>
        <div style="margin: 20px 0; display: flex; gap: 10px; justify-content: center;">
          <button id="role-cust" class="btn btn-primary" style="flex: 1;">${t('customer_role')}</button>
          <button id="role-sell" class="btn btn-primary" style="flex: 1;">${t('seller_role')}</button>
        </div>
        <div id="auth-status" class="hidden" style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid var(--border);"></div>
      </div>
    `;

    const startAuth = async (role) => {
      const statusDiv = document.getElementById('auth-status');
      statusDiv.classList.remove('hidden');
      statusDiv.innerHTML = `<p style="color: var(--accent-2);">${t('waiting_tg')}</p>`;

      try {
        const res = await api('/api/auth/start', { method: 'POST', body: { role } });
        window.open(res.url, '_blank');

        const interval = setInterval(async () => {
          try {
            const s = await api(`/api/auth/status?nonce=${res.nonce}`);
            if (s.status === 'waiting_code') {
              clearInterval(interval);
              location.href = `/login.html?nonce=${res.nonce}`;
            }
          } catch (e) {}
        }, 2000);

        setTimeout(() => clearInterval(interval), 10 * 60 * 1000);
      } catch (e) {
        statusDiv.innerHTML = `<p style="color: var(--danger);">Xatolik: ${e.message}</p>`;
      }
    };

    document.getElementById('role-cust').onclick = () => startAuth('customer');
    document.getElementById('role-sell').onclick = () => startAuth('seller');
  }

  function initLogin() {
    const host = document.getElementById('main-content');
    const nonce = new URLSearchParams(location.search).get('nonce');
    if (!nonce) return host.innerHTML = '<p style="text-align:center; margin-top:50px;">Xato: Havola topilmadi. <a href="/profile.html">Profilga qaytish</a></p>';
    host.innerHTML = `
      <div class="card" style="max-width: 400px; margin: 40px auto; text-align: center; padding: 30px;">
        <h2>${t('enter_code')}</h2>
        <p style="color: #888; margin-bottom: 20px; font-size: 14px;">Telegram botga yuborilgan 6 xonali kodni kiriting.</p>
        <input type="text" id="code-input" class="input" style="text-align:center; font-size:24px; letter-spacing:5px;" maxlength="6" placeholder="000000">
        <button id="verify-btn" class="btn btn-primary btn-block" style="margin-top: 15px;">${t('verify')}</button>
        <p id="err-msg" style="color:var(--danger); margin-top:10px;"></p>
        <a href="/profile.html" style="display: block; margin-top: 20px; font-size: 14px;">Qaytadan urinish</a>
      </div>
    `;

    document.getElementById('verify-btn').onclick = async () => {
      const code = document.getElementById('code-input').value.trim();
      if (!/^\d{6}$/.test(code)) return document.getElementById('err-msg').textContent = "Iltimos, 6 xonali kodni to'g'ri kiriting.";

      const btn = document.getElementById('verify-btn');
      btn.disabled = true;
      btn.textContent = "Tekshirilmoqda...";

      try {
        const res = await api('/api/auth/verify', { method: 'POST', body: { nonce, code } });
        localStorage.setItem('token', res.token);
        toast(t('success_auth'));
        setTimeout(() => location.href = '/', 1000);
      } catch (e) {
        document.getElementById('err-msg').textContent = e.message;
        btn.disabled = false;
        btn.textContent = t('verify');
      }
    };
  }

  function initSeller() {
    const host = document.getElementById('main-content');
    if (!AUTH_USER || AUTH_USER.role !== 'seller') return host.innerHTML = '<p>Ruxsat yo\'q. Iltimos, Profil bo\'limidan Savdogar rolini tanlang.</p>';

    host.innerHTML = `
      <h2>${t('seller_panel')}</h2>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top:20px;">
        <div class="card" style="padding:20px;">
          <div class="form-group"><label>${t('product_name')}</label><input type="text" id="p-name" class="input"></div>
          <div class="form-group"><label>${t('price')}</label><input type="number" id="p-price" class="input"></div>
          <div class="form-group">
            <label>${t('currency')}</label>
            <select id="p-currency" class="input">
              <option value="UZS">So'm (UZS)</option>
              <option value="USD">Dollar (USD)</option>
              <option value="RUB">Rubl (RUB)</option>
            </select>
          </div>
          <div class="form-group"><label>Chegirma (%)</label><input type="number" id="p-discount" class="input" min="0" max="100" value="0"></div>
          <div class="form-group"><label>Asar haqida izoh</label><textarea id="p-desc" class="input" rows="3"></textarea></div>
          <div class="form-group">
            <label>${t('genre')}</label>
            <select id="p-genre" class="input">
              <option value="portrait">${t('portrait')}</option><option value="landscape">${t('landscape')}</option>
              <option value="stilllife">${t('stilllife')}</option><option value="abstract">${t('abstract')}</option>
              <option value="animal">${t('animal')}</option><option value="modern">${t('modern')}</option>
              <option value="sculpture">${t('sculpture')}</option>
              <option value="photography">${t('photography')}</option>
            </select>
          </div>
          <div class="form-group">
            <label>${t('payment_type')}</label>
            <select id="p-payment" class="input">
              <option value="prepay100">${t('prepay100')}</option><option value="prepay50">${t('prepay50')}</option><option value="postpay100">${t('postpay100')}</option>
            </select>
          </div>
          <div class="form-group"><label>${t('image_req')}</label><input type="file" id="p-img" accept="image/*"></div>
          <img id="p-preview" class="hidden" style="max-width:100%; border-radius:8px; margin-bottom:15px;">
          <button id="p-save" class="btn btn-primary btn-block">${t('create')}</button>
        </div>
        <div><h3>${t('my_works')}</h3><div id="my-list" style="margin-top:15px;"></div></div>
      </div>
    `;

    let base64Img = null;
    document.getElementById('p-img').onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height, max = 900;
          if (w > max || h > max) { if (w > h) { h = h * max / w; w = max; } else { w = w * max / h; h = max; } }
          canvas.width = w; canvas.height = h; canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          base64Img = canvas.toDataURL('image/jpeg', 0.85);
          const prev = document.getElementById('p-preview'); prev.src = base64Img; prev.classList.remove('hidden');
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };

    const loadMy = async () => {
      try {
        const res = await api('/api/seller/products');
        const list = document.getElementById('my-list');
        if (!res.products.length) return list.innerHTML = `<p>${t('no_works')}</p>`;

        list.innerHTML = res.products.map(p => {
          let discBadge = p.discount > 0 ? `<span style="background:#ff4d4f; color:white; padding:2px 5px; border-radius:5px; font-size:12px; margin-left:5px;">-${p.discount}%</span>` : '';
          return `<div class="cart-item" style="padding:10px; margin-bottom:10px;">
            <img src="${p.image}" style="width:60px; height:60px;">
            <div style="flex:1;"><b>${esc(p.name)}</b> ${discBadge}<br><small>${t(p.genre)}</small></div>
            <button class="btn btn-danger" data-del="${p.id}">X</button>
          </div>`;
        }).join('');

        list.querySelectorAll('[data-del]').forEach(btn => {
          btn.onclick = async () => {
            if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
            try {
              await api(`/api/seller/products/${btn.dataset.del}`, { method: 'DELETE' });
              toast('O\'chirildi'); loadMy();
            } catch (e) { toast(e.message); }
          };
        });
      } catch (e) { toast(e.message); }
    };

    document.getElementById('p-save').onclick = async () => {
      const name = document.getElementById('p-name').value.trim();
      const price = parseInt(document.getElementById('p-price').value);
      const currency = document.getElementById('p-currency').value;
      const discount = parseInt(document.getElementById('p-discount').value) || 0;
      const description = document.getElementById('p-desc').value.trim();
      const genre = document.getElementById('p-genre').value;
      const paymentType = document.getElementById('p-payment').value;

      if (!name || !price || !base64Img) return toast(t('required'));

      try {
        await api('/api/seller/products', { method: 'POST', body: { name, price, currency, discount, description, genre, paymentType, image: base64Img } });
        toast('OK'); loadMy();
        document.getElementById('p-name').value = ''; document.getElementById('p-price').value = '';
        document.getElementById('p-discount').value = '0'; document.getElementById('p-desc').value = '';
        base64Img = null; document.getElementById('p-preview').classList.add('hidden');
      } catch (e) { toast(e.message); }
    };
    loadMy();
  }

  async function initSold() {
    const host = document.getElementById('main-content');
    if (!AUTH_USER || AUTH_USER.role !== 'seller') return host.innerHTML = '<p>Ruxsat yo\'q</p>';
    try {
      const res = await api('/api/seller/sold');
      if (!res.orders.length) return host.innerHTML = `<p>${t('no_works')}</p>`;
      host.innerHTML = `<h2>${t('sold_items')}</h2><div style="margin-top:20px;">` + res.orders.map(o => `
        <div class="card" style="padding:15px; margin-bottom:15px;">
          <h3>${esc(o.productName)}</h3>
          <p><strong>${t('price')}:</strong> ${formatPrice(o.price, o.currency || 'UZS')}</p>
          <p><strong>${t('payment_type')}:</strong> ${t(o.paymentType)}</p>
          <p><strong>${t('buyer')}:</strong> ${esc(o.buyerName)} (${esc(o.buyerPhone)})</p>
          <iframe width="100%" height="150" style="border:0;border-radius:8px; margin-top:10px;" src="https://www.google.com/maps?q=${o.lat},${o.lng}&z=15&output=embed"></iframe>
        </div>`).join('') + '</div>';
    } catch (e) { host.innerHTML = `<p>${e.message}</p>`; }
  }

  (async () => {
    await fetchMe();
    initBgAnimation();
    renderHeader();
    await renderFooter();
    const page = document.body.dataset.page;
    if (page === 'index') initIndex();
    else if (page === 'product') initProduct();
    else if (page === 'cart') initCart();
    else if (page === 'profile') initProfile();
    else if (page === 'login') initLogin();
    else if (page === 'checkout') initCheckout();
    else if (page === 'seller') initSeller();
    else if (page === 'sold') initSold();
    else if (page === 'favorites') initFavorites();
  })();
})();