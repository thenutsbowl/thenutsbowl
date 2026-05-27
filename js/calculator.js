/* ═══════════════════════════════════════════════════════════════
   THE NUTS BOWL — calculator.js
   Nutrition Calculator: Individual breakdown + Custom mix builder
═══════════════════════════════════════════════════════════════ */

// ── Theme toggle (shared with main site) ──────────────────────
(function () {
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

  applyTheme(localStorage.getItem('theme') || 'classic');

  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'genz' ? 'classic' : 'genz';
    localStorage.setItem('theme', next);
    applyTheme(next);
  });
})();

// ── Mobile nav ────────────────────────────────────────────────
(function () {
  const navbar        = document.getElementById('navbar');
  const hamburger     = document.getElementById('hamburger');
  const navLinks      = document.getElementById('navLinks');
  const mobileOverlay = document.getElementById('mobileOverlay');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  function openNav() {
    const scrollY = window.scrollY;
    navLinks.classList.add('open');
    mobileOverlay.classList.add('show');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.dataset.scrollY = scrollY;
    document.body.style.overflow  = 'hidden';
    document.body.style.position  = 'fixed';
    document.body.style.top       = `-${scrollY}px`;
    document.body.style.width     = '100%';
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

  hamburger.addEventListener('click', () =>
    navLinks.classList.contains('open') ? closeNav() : openNav());
  mobileOverlay.addEventListener('click', closeNav);
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
})();

// ── Calculator logic ──────────────────────────────────────────
fetch('js/nutrition.json')
  .then(r => r.json())
  .then(nutrition => {
    initMixBuilder(nutrition);
    syncBottomPadding();
  })
  .catch(() => console.warn('Could not load nutrition.json'));

// Dynamically keep scroll clearance in sync with fixed panel height
function syncBottomPadding() {
  const panel    = document.getElementById('mixTotals');
  const products = document.getElementById('mixProducts');
  if (!panel || !products) return;
  const update = () => {
    if (window.innerWidth <= 600) {
      products.style.paddingBottom = (panel.offsetHeight + 24) + 'px';
    } else {
      products.style.paddingBottom = '';
    }
  };
  update();
  window.addEventListener('resize', update, { passive: true });
  // Re-measure after fonts/content settle
  setTimeout(update, 300);
}

// ─────────────────────────────────────────────────────────────
// Custom Mix Builder
// ─────────────────────────────────────────────────────────────
function initMixBuilder(nutrition) {
  const mixProducts = document.getElementById('mixProducts');
  const mixReset    = document.getElementById('mixReset');
  const mixGoalInput = document.getElementById('mixGoal');

  // Totals elements
  const proteinDisplay  = document.getElementById('mixProteinDisplay');
  const proteinBar      = document.getElementById('mixProteinBar');
  const proteinGoalLbl  = document.getElementById('mixProteinGoalLabel');
  const caloriesEl      = document.getElementById('mixCalories');
  const carbsEl         = document.getElementById('mixCarbs');
  const fatEl           = document.getElementById('mixFat');
  const fibreEl         = document.getElementById('mixFibre');
  const totalWeightEl   = document.getElementById('mixTotalWeight');

  // Build product rows
  mixProducts.innerHTML = nutrition.map((item, i) => buildMixRow(item, i)).join('');

  function getGrams(i) {
    return Math.max(0, Number(mixProducts.children[i].querySelector('.mix-gram-input').value) || 0);
  }

  function updateTotals() {
    let totalProtein = 0, totalCalories = 0, totalCarbs = 0, totalFat = 0, totalFibre = 0, totalWeight = 0;

    nutrition.forEach((item, i) => {
      const grams = getGrams(i);
      const ratio = grams / 100;
      const m = item.per100g;

      totalProtein  += m.protein  * ratio;
      totalCalories += m.calories * ratio;
      totalCarbs    += m.carbs    * ratio;
      totalFat      += m.fat      * ratio;
      totalFibre    += m.fibre    * ratio;
      totalWeight   += grams;

      // Update per-row macro preview
      const row = mixProducts.children[i];
      row.querySelector('.mpm-protein').textContent  = `${Math.round(m.protein  * ratio)}g protein`;
      row.querySelector('.mpm-calories').textContent = `${Math.round(m.calories * ratio)} kcal`;
      row.querySelector('.mpm-carbs').textContent    = `${Math.round(m.carbs    * ratio)}g carbs`;
      row.querySelector('.mpm-fat').textContent      = `${Math.round(m.fat      * ratio)}g fat`;
    });

    const goal = Math.max(1, Number(mixGoalInput.value) || 50);
    const pct  = Math.min((totalProtein / goal) * 100, 100);

    proteinDisplay.textContent = `${Math.round(totalProtein)} g`;
    proteinBar.style.width     = `${pct}%`;
    proteinBar.classList.toggle('over-goal', totalProtein > goal);
    proteinGoalLbl.textContent = `Goal: ${goal} g`;

    caloriesEl.textContent  = `${Math.round(totalCalories)}`;
    carbsEl.textContent     = `${Math.round(totalCarbs)} g`;
    fatEl.textContent       = `${Math.round(totalFat)} g`;
    fibreEl.textContent     = `${Math.round(totalFibre)} g`;
    totalWeightEl.textContent = `${Math.round(totalWeight)} g`;
  }

  // Sync slider ↔ gram input for each row
  mixProducts.addEventListener('input', e => {
    const row = e.target.closest('.mix-product-row');
    if (!row) return;
    const slider    = row.querySelector('.mix-slider');
    const gramInput = row.querySelector('.mix-gram-input');
    if (e.target === slider)    gramInput.value = slider.value;
    if (e.target === gramInput) slider.value    = Math.min(300, Math.max(0, Number(gramInput.value)));
    updateTotals();
  });

  mixGoalInput.addEventListener('input', updateTotals);

  mixReset.addEventListener('click', () => {
    mixProducts.querySelectorAll('.mix-gram-input').forEach(el => el.value = 0);
    mixProducts.querySelectorAll('.mix-slider').forEach(el => el.value = 0);
    updateTotals();
  });

  updateTotals();
}

function buildMixRow(item, i) {
  return `
  <div class="mix-product-row">
    <span class="mix-product-emoji">${item.emoji}</span>
    <div class="mix-product-info">
      <span class="mix-product-name">${item.name}</span>
      <input type="range" class="mix-slider" min="0" max="300" value="0" step="5" />
      <div class="mix-product-macros">
        <span class="mix-pmacro mpm-protein">0g protein</span>
        <span class="mix-pmacro mpm-calories">0 kcal</span>
        <span class="mix-pmacro mpm-carbs">0g carbs</span>
        <span class="mix-pmacro mpm-fat">0g fat</span>
      </div>
    </div>
    <div class="mix-product-value-wrap">
      <input type="number" class="mix-gram-input" min="0" max="1000" value="0" step="5" />
      <span class="mix-gram-unit">g</span>
    </div>
  </div>`;
}
