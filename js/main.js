/* ═══════════════════════════════════════════════════════════════
   THE NUT BOWL — main.js
   Mobile nav · Scroll reveal · Smooth interactions
═══════════════════════════════════════════════════════════════ */

// _loadData — loads products/prices/combos from static JSON files.
// To update data: edit js/products.json, js/prices.json, or js/combos.json directly.
function _loadData() {
  return Promise.all([
    fetch('js/products.json').then(r => r.json()).catch(() => []),
    fetch('js/prices.json').then(r => r.json()).catch(() => []),
    fetch('js/combos.json').then(r => r.json()).catch(() => []),
  ]).then(([products, prices, combos]) => ({ products, prices, combos }));
}

(function () {
  'use strict';

  // ── Theme toggle ──────────────────────────────────────────────
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon   = themeToggle.querySelector('.theme-icon');
  const themeLabel  = themeToggle.querySelector('.theme-label');

  function applyTheme(theme) {
    if (theme === 'genz') {
      document.documentElement.setAttribute('data-theme', 'genz');
      themeIcon.textContent  = '⚡';
      themeLabel.textContent = 'Vibe';
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeIcon.textContent  = '🌿';
      themeLabel.textContent = 'Classic';
    }
  }

  // Restore saved preference
  applyTheme(localStorage.getItem('theme') || 'classic');

  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'genz' ? 'classic' : 'genz';
    localStorage.setItem('theme', next);
    applyTheme(next);
  });

  // ── Offer Banner ─────────────────────────────────────────────
  const offerBanner      = document.getElementById('offerBanner');
  const offerTrack       = document.getElementById('offerTrack');
  const offerBannerClose = document.getElementById('offerBannerClose');

  fetch('js/content/banner.json')
    .then(r => r.json())
    .then(data => {
      if (!data.enabled) return;
      if (sessionStorage.getItem('bannerDismissed')) return;

      // Build double-length ticker (seamless loop)
      const msgs = [...data.messages, ...data.messages]
        .map(m => `<span class="offer-banner-msg">${m}</span>`)
        .join('');
      offerTrack.innerHTML = msgs;

      offerBanner.hidden = false;
      // Slight delay so the CSS transition plays
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          offerBanner.classList.add('visible');
          document.body.classList.add('banner-visible');
        });
      });
    })
    .catch(() => {}); // silently skip if banner.json missing

  if (offerBannerClose) {
    offerBannerClose.addEventListener('click', () => {
      offerBanner.classList.remove('visible');
      document.body.classList.remove('banner-visible');
      sessionStorage.setItem('bannerDismissed', '1');
      setTimeout(() => { offerBanner.hidden = true; }, 380);
    });
  }

  // ── Navbar: scroll state ──────────────────────────────────────
  const navbar = document.getElementById('navbar');

  function updateNavbar() {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // ── Mobile Nav: hamburger toggle ──────────────────────────────
  const hamburger     = document.getElementById('hamburger');
  const navLinks      = document.getElementById('navLinks');
  const mobileOverlay = document.getElementById('mobileOverlay');

  function openNav() {
    const scrollY = window.scrollY;
    navLinks.classList.add('open');
    mobileOverlay.classList.add('show');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    // Fix body scroll on iOS Safari too
    document.body.dataset.scrollY = scrollY;
    document.body.style.overflow   = 'hidden';
    document.body.style.position   = 'fixed';
    document.body.style.top        = `-${scrollY}px`;
    document.body.style.width      = '100%';
  }

  function closeNav() {
    const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
    navLinks.classList.remove('open');
    mobileOverlay.classList.remove('show');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top      = '';
    document.body.style.width    = '';
    window.scrollTo(0, scrollY);
  }

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('open');
    isOpen ? closeNav() : openNav();
  });

  mobileOverlay.addEventListener('click', closeNav);

  // Close on nav link click (mobile)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeNav();
  });

  // ── Scroll Reveal ─────────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(el => observer.observe(el));
  } else {
    // Fallback for older browsers
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // ── Active nav link on scroll ─────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link');

  function onScroll() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navAnchors.forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === '#' + current) {
        a.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ── Smooth scroll for anchor links ───────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Price helpers ─────────────────────────────────────────────
  function calcPrice(card, weight) {
    const perKg    = Number(card.dataset.pricePerKg);
    const discount = Number(card.dataset.discount || 0);
    const raw = Math.round(perKg * weight / 1000) + (weight === 200 ? 12 : 0);
    return Math.round(raw * (1 - discount / 100));
  }

  function formatWeight(w) { return w === 1000 ? '1kg' : `${w}g`; }

  // ── Section content: apply hero ───────────────────────────────
  function applyHero(data) {
    const badge = document.getElementById('heroBadge');
    const title = document.getElementById('heroTitle');
    const sub   = document.getElementById('heroSub');
    const cta   = document.getElementById('heroCtaGroup');
    if (badge) badge.textContent = data.badge;
    if (title) title.innerHTML   = data.titleHTML;
    if (sub)   sub.innerHTML     = data.subtitle;
    if (cta)   cta.innerHTML     = data.cta.map(c =>
      `<a href="${c.href}" class="${c.class}">${c.text}</a>`
    ).join('\n');
  }

  // ── Section content: apply about ─────────────────────────────
  function applyAbout(data) {
    const tag   = document.getElementById('aboutTag');
    const title = document.getElementById('aboutTitle');
    const desc  = document.getElementById('aboutDesc');
    const grid  = document.getElementById('aboutGrid');
    if (tag)   tag.textContent  = data.sectionTag;
    if (title) title.innerHTML  = data.titleHTML;
    if (desc)  desc.textContent = data.description;
    if (grid)  grid.innerHTML   = data.cards.map(c => {
      const delay = c.revealDelay > 0 ? ` reveal-delay-${c.revealDelay}` : '';
      return `
      <div class="about-card reveal${delay}">
        <div class="about-icon">${c.icon}</div>
        <div class="about-card-text">
          <h3>${c.title}</h3>
          <p>${c.description}</p>
        </div>
      </div>`
    }).join('');
  }

  // ── Section content: build & render product cards ─────────────
  function buildProductCard(product, index) {
    const delays = ['', ' reveal-delay-1', ' reveal-delay-2'];
    const delay  = delays[index % 3];
    const weights = product.weights.map((w, i) =>
      `<button class="weight-btn${i === 0 ? ' active' : ''}" data-weight="${w}">${w >= 1000 ? (w / 1000) + 'kg' : w + 'g'}</button>`
    ).join('');
    return `
    <div class="product-card reveal${delay}" data-price-per-kg="0">
      <div class="product-badge${product.badgeClass ? ' ' + product.badgeClass : ''}">${product.badge}</div>
      <div class="product-emoji">${product.image
        ? `<img src="${product.image}" alt="${product.name}" class="product-img" />`
        : product.emoji}</div>
      <div class="product-info">
        <span class="product-tag">${product.tag}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="weight-selector">${weights}</div>
        <div class="product-footer">
          <div class="price-stack">
            <div class="price-mrp-row">
              <span class="product-price-original"></span>
              <span class="discount-pill"></span>
            </div>
            <span class="product-price">—</span>
          </div>
          <button class="btn btn-small btn-add-cart" data-name="${product.name}" data-emoji="${product.emoji}">+ Add to Cart</button>
        </div>
      </div>
    </div>`;
  }

  function applyProducts(data) {
    const tag   = document.getElementById('productsTag');
    const title = document.getElementById('productsTitle');
    const desc  = document.getElementById('productsDesc');
    const note  = document.getElementById('productsNote');
    const grid  = document.getElementById('productsGrid');
    if (tag)   tag.textContent = data.sectionTag;
    if (title) title.innerHTML = data.titleHTML;
    if (desc)  desc.innerHTML  = data.description;
    if (note)  note.innerHTML  = data.note;
    if (grid) {
      const anchor = document.getElementById('combos-anchor');
      if (!anchor) return;
      data.products.forEach((product, i) => {
        anchor.insertAdjacentHTML('beforebegin', buildProductCard(product, i));
      });
    }
  }

  // ── Section content: apply contact ────────────────────────────
  function applyContact(data) {
    const tag   = document.getElementById('contactTag');
    const title = document.getElementById('contactTitle');
    const desc  = document.getElementById('contactDesc');
    if (tag)   tag.textContent  = data.sectionTag;
    if (title) title.innerHTML  = data.titleHTML;
    if (desc)  desc.textContent = data.description;

    const waUrl = `https://wa.me/${data.whatsapp}`;
    const igUrl = `https://instagram.com/${data.instagram}`;

    const waS   = document.getElementById('contactWhatsappSocial');
    const igS   = document.getElementById('contactInstagramSocial');
    const waCta = document.getElementById('contactWhatsappCta');
    const igCta = document.getElementById('contactInstagramCta');

    if (waS) waS.href = waUrl;
    if (igS) igS.href = igUrl;
    if (waCta) {
      waCta.href = waUrl;
      waCta.querySelector('span') && (waCta.querySelector('span').textContent = data.ctaWhatsappText);
    }
    if (igCta) {
      igCta.href = igUrl;
      igCta.querySelector('span') && (igCta.querySelector('span').textContent = data.ctaInstagramText);
    }
  }

  // ── Prices: load from JSON and apply to product cards ────────
  function applyPrices(prices) {
    const priceMap = {};
    prices.forEach(p => { priceMap[p.name] = p; });

    document.querySelectorAll('.product-card').forEach(card => {
      const nameBtn = card.querySelector('.btn-add-cart');
      if (!nameBtn) return;
      const itemName = nameBtn.dataset.name;
      const entry = priceMap[itemName];
      if (!entry) return;

      if (entry.fixedPrice != null) {
        card.dataset.fixedPrice = entry.fixedPrice;
        card.querySelector('.product-price').textContent = `₹${entry.fixedPrice}`;
      } else {
        card.dataset.pricePerKg = entry.pricePerKg;
        if (entry.mrpPerKg) card.dataset.mrpPerKg = entry.mrpPerKg;

        const activeBtn = card.querySelector('.weight-btn.active');
        const weight = activeBtn ? Number(activeBtn.dataset.weight) : 200;
        card.querySelector('.product-price').textContent = `₹${calcPrice(card, weight)}`;

        const origEl = card.querySelector('.product-price-original');
        if (origEl && entry.mrpPerKg) {
          origEl.textContent = `₹${Math.round(entry.mrpPerKg * weight / 1000)}`;
        }
        const pillEl = card.querySelector('.discount-pill');
        if (pillEl && entry.mrpPerKg) {
          const mrpPrice = Math.round(entry.mrpPerKg * weight / 1000);
          const sellPrice = calcPrice(card, weight);
          const pct = Math.round((1 - sellPrice / mrpPrice) * 100);
          pillEl.textContent = `${pct}% off`;
        }
      }
    });
  }

  // ── Combos: render cards from Sheets ─────────────────────────
  function buildComboCard(combo) {
    const seedIcons = combo.ingredients
      .map(i => `<span title="${i.name}">${i.emoji}</span>`)
      .join('');

    const rows = combo.ingredients
      .map(i => `
        <div class="ingredient-row">
          <span class="ingredient-name">${i.emoji} ${i.name}</span>
          <span class="ingredient-weight">${i.weight}</span>
        </div>`)
      .join('');

    return `
      <div class="product-card product-card-diy product-card-combo reveal"
           data-fixed-price="${combo.price}">
        <div class="diy-left">
          <div class="product-badge ${combo.badgeClass || 'badge-bestseller'}">${combo.badge}</div>
          <div class="product-emoji">${combo.emoji}</div>
          <div class="diy-seeds-row">${seedIcons}</div>
        </div>
        <div class="product-info">
          <span class="product-tag">${combo.tag}</span>
          <h3 class="product-name">${combo.name}</h3>
          <p class="product-desc">${combo.desc}</p>
          <div class="combo-ingredients">
            <div class="ingredients-header">
              <div><span>Ingredient</span><span>Weight</span></div>
              <div><span>Ingredient</span><span>Weight</span></div>
            </div>
            <div class="ingredients-list">${rows}</div>
            <div class="ingredients-total">
              <span>Total Weight</span><span>${combo.totalWeight}</span>
            </div>
          </div>
          <div class="product-footer">
            <div class="price-stack">
              <div class="price-mrp-row">
                <span class="combo-size-pill">Fixed ${combo.totalWeight}</span>
                ${combo.mrp ? `<span class="product-price-original">₹${combo.mrp}</span>` : ''}
                ${combo.mrp ? `<span class="discount-pill">${Math.round((1 - combo.price / combo.mrp) * 100)}% off</span>` : ''}
              </div>
              <span class="product-price">₹${combo.price}</span>
            </div>
            <button class="btn btn-small btn-add-cart"
                    data-name="${combo.name}"
                    data-emoji="${combo.emoji}">+ Add to Cart</button>
          </div>
        </div>
      </div>`;
  }

  // ── Load static content, then all Sheets data ─────────────────
  Promise.all([
    fetch('js/content/hero.json').then(r => r.json()),
    fetch('js/content/about.json').then(r => r.json()),
    fetch('js/content/products.json').then(r => r.json()),
    fetch('js/content/contact.json').then(r => r.json()),
  ]).then(([hero, about, productsContent, contact]) => {
    applyHero(hero);
    applyAbout(about);
    applyContact(contact);

    return _loadData()
      .then(({ products, prices, combos }) => {
        productsContent.products = products;
        applyProducts(productsContent);
        applyPrices(prices);

        const anchor = document.getElementById('combos-anchor');
        combos.forEach(combo => anchor.insertAdjacentHTML('beforebegin', buildComboCard(combo)));

        // Re-run scroll reveal for all dynamically injected elements
        document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
          if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver(entries => {
              entries.forEach(entry => {
                if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
              });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
            obs.observe(el);
          } else {
            el.classList.add('visible');
          }
        });
      });
  }).catch(err => console.warn('Content load error:', err));

  // ── Calculator CTA preview — driven from nutrition.json ───────
  const calcCtaPreview = document.getElementById('calcCtaPreview');
  if (calcCtaPreview) {
    fetch('js/nutrition.json')
      .then(r => r.json())
      .then(nutrition => {
        // Sort by protein desc, take top 3
        const top = [...nutrition]
          .sort((a, b) => b.per100g.protein - a.per100g.protein)
          .slice(0, 3);
        const maxProtein = top[0].per100g.protein;

        const rows = top.map(item => {
          const p   = item.per100g.protein;
          const pct = Math.round((p / maxProtein) * 100);
          return `
          <div class="calc-preview-row">
            <span class="calc-preview-emoji">${item.emoji}</span>
            <div class="calc-preview-bar-wrap">
              <span class="calc-preview-name">${item.name}</span>
              <div class="calc-preview-bar"><div style="width:${pct}%"></div></div>
            </div>
            <span class="calc-preview-val">${p}g <small>/ 100g</small></span>
          </div>`;
        }).join('');

        // Pills: top product's full macro snapshot
        const best = top[0].per100g;
        const pills = `
          <div class="calc-cta-pills">
            <span>🔥 ${best.calories} kcal</span>
            <span>💪 ${best.protein}g protein</span>
            <span>🌿 ${best.fibre}g fibre</span>
            <span>⚡ ${best.carbs}g carbs</span>
          </div>`;

        calcCtaPreview.innerHTML = rows + pills;
      })
      .catch(() => {}); // silently skip if nutrition.json missing
  }


  const WHATSAPP_NUMBER = '919870505923';

  let cart = [];

  const cartWidget      = document.getElementById('cartWidget');
  const cartBarToggle   = document.getElementById('cartBarToggle');
  const cartBarCount    = document.getElementById('cartBarCount');
  const cartBarTotal    = document.getElementById('cartBarTotal');
  const cartBarWhatsapp = document.getElementById('cartBarWhatsapp');
  const cartDrawer      = document.getElementById('cartDrawer');
  const cartDrawerClose = document.getElementById('cartDrawerClose');
  const cartItems       = document.getElementById('cartItems');
  const cartDrawerTotal = document.getElementById('cartDrawerTotal');
  const cartWhatsappBtn = document.getElementById('cartWhatsappBtn');
  const cartChevron     = document.getElementById('cartChevron');

  function buildWhatsAppUrl(name, address, pincode) {
    const lines = cart.map(
      item => `• ${item.emoji} ${item.name} x${item.qty} — ₹${item.price * item.qty}`
    );
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const deliveryLines = [];
    if (name)    deliveryLines.push(`Name: ${name}`);
    if (address) deliveryLines.push(`Address: ${address}`);
    if (pincode) deliveryLines.push(`Pincode: ${pincode}`);
    const text = [
      "Hi! I'd like to place an order \uD83E\uDD5C",
      '',
      'Items:',
      ...lines,
      '',
      `Total: ₹${total}`,
      ...(deliveryLines.length ? ['', 'Delivery Details:', ...deliveryLines] : []),
      '',
      'Please confirm availability!'
    ].join('\n');
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  function getTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function renderCart() {
    const total = getTotal();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);

    cartBarCount.textContent = `${count} item${count !== 1 ? 's' : ''}`;
    cartBarTotal.textContent = `₹${total}`;
    cartDrawerTotal.textContent = `₹${total}`;

    if (count === 0) {
      cartWidget.classList.remove('cart-visible');
      cartDrawer.hidden = true;
      cartChevron.textContent = '▲';
    } else {
      cartWidget.classList.add('cart-visible');
    }

    cartItems.innerHTML = cart.map((item, i) => `
      <li class="cart-item" data-index="${i}">
        <span class="cart-item-emoji">${item.emoji}</span>
        <span class="cart-item-name">${item.name}</span>
        <div class="cart-item-controls">
          <button class="cart-qty-btn" data-action="dec" data-index="${i}" aria-label="Decrease">−</button>
          <span class="cart-item-qty">${item.qty}</span>
          <button class="cart-qty-btn" data-action="inc" data-index="${i}" aria-label="Increase">+</button>
        </div>
        <span class="cart-item-subtotal">₹${item.price * item.qty}</span>
        <button class="cart-item-remove" data-index="${i}" aria-label="Remove">✕</button>
      </li>
    `).join('');
  }

  function addToCart(name, price, emoji) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ name, price: Number(price), emoji, qty: 1 });
    }
    renderCart();
  }

  // Weight button clicks — update price display
  document.querySelector('.products-grid').addEventListener('click', e => {
    const btn = e.target.closest('.weight-btn');
    if (!btn) return;
    const card   = btn.closest('.product-card');
    const weight = Number(btn.dataset.weight);

    card.querySelectorAll('.weight-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    card.querySelector('.product-price').textContent = `₹${calcPrice(card, weight)}`;

    const origEl = card.querySelector('.product-price-original');
    if (origEl && card.dataset.mrpPerKg) {
      origEl.textContent = `₹${Math.round(Number(card.dataset.mrpPerKg) * weight / 1000)}`;
    }

    const pillEl = card.querySelector('.discount-pill');
    if (pillEl && card.dataset.mrpPerKg) {
      const mrpPrice  = Math.round(Number(card.dataset.mrpPerKg) * weight / 1000);
      const sellPrice = calcPrice(card, weight);
      const pct = Math.round((1 - sellPrice / mrpPrice) * 100);
      pillEl.textContent = `${pct}% off`;
    }
  });

  // Add to cart — event delegation covers both static and combo cards
  document.querySelector('.products-grid').addEventListener('click', e => {
    const btn = e.target.closest('.btn-add-cart');
    if (!btn) return;
    const card    = btn.closest('.product-card');
    const isFixed = card.dataset.fixedPrice != null && card.dataset.fixedPrice !== '';
    let price, label;

    if (isFixed) {
      price = Number(card.dataset.fixedPrice);
      label = `${btn.dataset.name} (${card.dataset.fixedWeight || card.querySelector('.combo-size-pill')?.textContent?.replace('Fixed ', '') || 'combo'})`;
    } else {
      const activeWt = card.querySelector('.weight-btn.active');
      const weight   = activeWt ? Number(activeWt.dataset.weight) : 200;
      price = calcPrice(card, weight);
      label = `${btn.dataset.name} (${formatWeight(weight)})`;
    }

    addToCart(label, price, btn.dataset.emoji);

    btn.textContent = '✓ Added!';
    btn.classList.add('btn-added');
    setTimeout(() => {
      btn.textContent = '+ Add to Cart';
      btn.classList.remove('btn-added');
    }, 1200);
  });

  // Toggle drawer
  cartBarToggle.addEventListener('click', () => {
    const isOpen = !cartDrawer.hidden;
    cartDrawer.hidden = isOpen;
    cartChevron.textContent = isOpen ? '▲' : '▼';
  });

  cartDrawerClose.addEventListener('click', () => {
    cartDrawer.hidden = true;
    cartChevron.textContent = '▲';
  });

  // Qty controls & remove (event delegation)
  cartItems.addEventListener('click', e => {
    const btn = e.target.closest('[data-action], .cart-item-remove');
    if (!btn) return;
    const idx = Number(btn.dataset.index);

    if (btn.classList.contains('cart-item-remove')) {
      cart.splice(idx, 1);
    } else if (btn.dataset.action === 'inc') {
      cart[idx].qty++;
    } else if (btn.dataset.action === 'dec') {
      cart[idx].qty--;
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
    }
    renderCart();
  });

  // ── Order Details Modal ───────────────────────────────────────
  const orderModal      = document.getElementById('orderModal');
  const orderModalClose = document.getElementById('orderModalClose');
  const orderForm       = document.getElementById('orderForm');
  const orderNameInput  = document.getElementById('orderName');
  const orderAddrInput  = document.getElementById('orderAddress');
  const orderPinInput   = document.getElementById('orderPincode');

  function openOrderModal() {
    orderModal.hidden = false;
    document.body.style.overflow = 'hidden';
    orderNameInput.focus();
  }

  function closeOrderModal() {
    orderModal.hidden = true;
    document.body.style.overflow = '';
  }

  [cartBarWhatsapp, cartWhatsappBtn].forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      openOrderModal();
    });
  });

  orderModalClose.addEventListener('click', closeOrderModal);

  orderModal.addEventListener('click', e => {
    if (e.target === orderModal) closeOrderModal();
  });

  orderForm.addEventListener('submit', e => {
    e.preventDefault();

    // Inline validation
    let valid = true;
    [orderNameInput, orderAddrInput, orderPinInput].forEach(field => {
      if (!field.value.trim() || (field === orderPinInput && !/^\d{6}$/.test(field.value.trim()))) {
        field.classList.add('invalid');
        valid = false;
      } else {
        field.classList.remove('invalid');
      }
    });
    if (!valid) return;

    const url = buildWhatsAppUrl(
      orderNameInput.value.trim(),
      orderAddrInput.value.trim(),
      orderPinInput.value.trim()
    );
    closeOrderModal();
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  // Remove invalid highlight on input
  [orderNameInput, orderAddrInput, orderPinInput].forEach(field => {
    field.addEventListener('input', () => field.classList.remove('invalid'));
  });

  // ── Image Lightbox ────────────────────────────────────────────
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';
  }

  // Click on any product image
  document.addEventListener('click', e => {
    const img = e.target.closest('.product-img');
    if (img) openLightbox(img.src, img.alt);
  });

  lightboxClose.addEventListener('click', closeLightbox);

  // Click backdrop (outside image) to close
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  // Escape key to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!orderModal.hidden) closeOrderModal();
      else if (!lightbox.hidden) closeLightbox();
    }
  });

})();
