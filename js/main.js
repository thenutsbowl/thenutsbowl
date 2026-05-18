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
    navLinks.classList.add('open');
    mobileOverlay.classList.add('show');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    navLinks.classList.remove('open');
    mobileOverlay.classList.remove('show');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
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

  function calcPrice(card, weight) {
    const perKg    = Number(card.dataset.pricePerKg);
    const discount = Number(card.dataset.discount || 0);
    const raw = Math.round(perKg * weight / 1000);
    return Math.round(raw * (1 - discount / 100));
  }

  function formatWeight(w) { return w === 1000 ? '1kg' : `${w}g`; }

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
    if (origEl) {
      origEl.textContent = `₹${Math.round(Number(card.dataset.pricePerKg) * weight / 1000)}`;
    }
  });

  // Add to cart
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const card   = btn.closest('.product-card');
      const activeWt = card.querySelector('.weight-btn.active');
      const weight = activeWt ? Number(activeWt.dataset.weight) : 200;
      const label  = `${btn.dataset.name} (${formatWeight(weight)})`;
      addToCart(label, calcPrice(card, weight), btn.dataset.emoji);

      btn.textContent = '✓ Added!';
      btn.classList.add('btn-added');
      setTimeout(() => {
        btn.textContent = '+ Add to Cart';
        btn.classList.remove('btn-added');
      }, 1200);
    });
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
