/* ═══════════════════════════════════════════════════════════════
   THE NUT BOWL — main.js
   Mobile nav · Scroll reveal · Smooth interactions
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

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
    const raw = Math.round(perKg * weight / 1000);
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
    ).join('\\n');
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
        <h3>${c.title}</h3>
        <p>${c.description}</p>
      </div>`;
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
      <div class="product-emoji">${product.emoji}</div>
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
          const pct = Math.round((1 - entry.pricePerKg / entry.mrpPerKg) * 100);
          pillEl.textContent = `${pct}% off`;
        }
      }
    });
  }

  // ── Combos: render cards from combos.json ─────────────────────
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

  // ── Load all section content and product data in parallel ─────
  Promise.all([
    fetch('js/content/hero.json').then(r => r.json()),
    fetch('js/content/about.json').then(r => r.json()),
    fetch('js/content/products.json').then(r => r.json()),
    fetch('js/content/contact.json').then(r => r.json()),
    fetch('js/prices.json').then(r => r.json()),
    fetch('js/combos.json').then(r => r.json()),
  ]).then(([hero, about, productsContent, contact, prices, combos]) => {
    // 1. Inject text content
    applyHero(hero);
    applyAbout(about);
    applyContact(contact);

    // 2. Render product cards, then apply prices (prices need cards in DOM)
    applyProducts(productsContent);
    applyPrices(prices);

    // 3. Render combo cards
    const anchor = document.getElementById('combos-anchor');
    combos.forEach(combo => anchor.insertAdjacentHTML('beforebegin', buildComboCard(combo)));

    // 4. Re-run scroll reveal for all dynamically injected elements
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
  }).catch(err => console.warn('Content load error:', err));

  // ── Cart ──────────────────────────────────────────────────────
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

  function buildWhatsAppUrl() {
    const lines = cart.map(
      item => `• ${item.emoji} ${item.name} x${item.qty} — ₹${item.price * item.qty}`
    );
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const text = [
      "Hi! I'd like to place an order \uD83E\uDD5C",
      '',
      'Items:',
      ...lines,
      '',
      `Total: ₹${total}`,
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

    const waUrl = buildWhatsAppUrl();
    cartBarWhatsapp.href = waUrl;
    cartWhatsappBtn.href = waUrl;

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

})();
