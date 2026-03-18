// ── Nav scroll ────────────────────────────────────────────────
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive:true });

// ── Scroll reveal ─────────────────────────────────────────────
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -55px 0px' });
document.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach(el => obs.observe(el));

// ── Menu data ─────────────────────────────────────────────────
const MENU = {
  burgers: [
    { icon:'🍔', name:'OG Smash Burger',       desc:'70G beef smash patty, grilled onion, cheddar cheese, dill pickles & in-house Bruv sauce.',                                price:'R85',  priceNum:85,  badge:'Fan Fave', hot:false },
    { icon:'🫶', name:'Bruv Smash Burger',      desc:'70G beef smash patty, caramelized onion, mozzarella, dill pickles & in-house Bruv sauce.',                                price:'R90',  priceNum:90,  badge:'Signature', hot:false },
    { icon:'🌶️', name:'Jalapeño Monster',       desc:'70G beef smash patty, grilled onions, cheddar, pickled jalapeño, creamy jalapeño sauce & Bruv sauce.',                    price:'R85',  priceNum:85,  badge:'Hot 🔥', hot:true },
    { icon:'🍗', name:'Spicy Chicken Smash',    desc:'80G chicken smash patty, onions, dill pickles, cheddar cheese and Bruv sauce.',                                           price:'R80',  priceNum:80,  badge:'New', hot:true },
  ],
  fries: [
    { icon:'🍟', name:'Small Fries',            desc:'Crispy skinny fries. The classic.',                                                                                       price:'—',    priceNum:0,   badge:'', hot:false },
    { icon:'🍟', name:'Large Fries',            desc:'Crispy large fries. Go big.',                                                                                             price:'—',    priceNum:0,   badge:'', hot:false },
    { icon:'🤤', name:'Filthy Fries',           desc:'Beef smash patty, cheddar, cheese sauce & house sauce on skinny fries with caramelized onion & gherkins.',               price:'—',    priceNum:0,   badge:'Must Try', hot:false },
    { icon:'🔥', name:'Filthy Fire Fries',      desc:'Smash patty, cheddar, cheese sauce & creamy jalapeño on skinny fries with caramelized onion & jalapeño.',                price:'—',    priceNum:0,   badge:'Hot 🔥', hot:true },
  ],
  pizza: [
    { icon:'🍕', name:'Philly Cheesesteak',     desc:'Steak, onions, green chili, secret sauce.',                                                                               price:'—',    priceNum:0,   badge:'', hot:false },
    { icon:'🥩', name:'Steak Supreme',          desc:'Steak, peppers, cheese.',                                                                                                 price:'—',    priceNum:0,   badge:'', hot:false },
    { icon:'🍗', name:'BBQ Chicken',            desc:'BBQ chicken, peppers, onion.',                                                                                            price:'—',    priceNum:0,   badge:'', hot:false },
    { icon:'🌶️', name:'Sweet Chilli Chicken',   desc:'Chicken, feta, BBQ.',                                                                                                    price:'—',    priceNum:0,   badge:'Fan Fave', hot:false },
  ],
  extras: [
    { icon:'🧀', name:'Extra Cheese',           desc:'Add a slice of melted cheddar to any burger or fries.',                                                                  price:'R10',  priceNum:10,  badge:'', hot:false },
    { icon:'🌭', name:'Extra Vienna',           desc:'Add a Vienna to any order.',                                                                                             price:'—',    priceNum:0,   badge:'', hot:false },
  ],
};

// ── Cart state ────────────────────────────────────────────────
// cart = [{ id, name, icon, price, priceNum, qty }]
let cart = [];

function cartId(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function addToCart(item, btnEl) {
  const id = cartId(item.name);
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name: item.name, icon: item.icon, price: item.price, priceNum: item.priceNum, qty: 1 });
  }
  updateCartUI();

  // Button feedback
  if (btnEl) {
    btnEl.textContent = '✓ Added';
    btnEl.classList.add('added');
    setTimeout(() => {
      btnEl.innerHTML = '+ Add to Order';
      btnEl.classList.remove('added');
    }, 1200);
  }

  // Bounce the cart button
  const cb = document.getElementById('cartBtn');
  cb.style.transform = 'scale(1.12) translateY(-2px)';
  setTimeout(() => cb.style.transform = '', 200);
}

function changeQty(id, delta) {
  const idx = cart.findIndex(c => c.id === id);
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  updateCartUI();
}

function updateCartUI() {
  const total = cart.reduce((s, c) => s + c.qty, 0);
  const totalPrice = cart.reduce((s, c) => s + c.priceNum * c.qty, 0);

  // Floating button
  const btn = document.getElementById('cartBtn');
  const countEl = document.getElementById('cartCount');
  countEl.textContent = total;
  btn.classList.toggle('visible', total > 0);

  // Total display
  document.getElementById('cartTotal').textContent =
    totalPrice > 0 ? `R${totalPrice}` : 'Ask in store';

  // WhatsApp button state
  document.getElementById('whatsappBtn').disabled = cart.length === 0;

  // Render cart items
  const container = document.getElementById('cartItems');
  const emptyEl   = document.getElementById('cartEmpty');

  if (cart.length === 0) {
    container.innerHTML = '';
    container.appendChild(emptyEl);
    emptyEl.style.display = 'flex';
    return;
  }
  emptyEl.style.display = 'none';

  // Re-render all items (simple approach)
  const existing = container.querySelectorAll('.cart-item');
  existing.forEach(el => el.remove());

  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.dataset.id = item.id;
    div.innerHTML = `
      <span class="cart-item-icon">${item.icon}</span>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${item.priceNum > 0 ? item.price + ' each' : 'Ask in store'}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)" aria-label="Remove one">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', 1)" aria-label="Add one">+</button>
        </div>
      </div>`;
    container.appendChild(div);
  });
}

// ── Drawer open/close ─────────────────────────────────────────
function openCart() {
  document.getElementById('cartOverlay').classList.add('open');
  document.getElementById('cartDrawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartDrawer').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

// ── WhatsApp order ────────────────────────────────────────────
// ── WhatsApp rate limiting ────────────────────────────────────
// Prevents spam — user must wait 30s before sending another order
const WA_COOLDOWN_MS = 30000;
let waLastSent = 0;

function orderOnWhatsApp() {
  if (cart.length === 0) return;

  // Rate limit check
  const now = Date.now();
  const elapsed = now - waLastSent;
  if (waLastSent > 0 && elapsed < WA_COOLDOWN_MS) {
    const remaining = Math.ceil((WA_COOLDOWN_MS - elapsed) / 1000);
    showWaCooldown(remaining);
    return;
  }

  const phone = '27792790592'; // South African format, no leading 0
  const note  = document.getElementById('cartNote').value.trim();

  let lines = ['Hi Bruv Burger! \uD83D\uDC4B I would like to place an order:', ''];
  cart.forEach(item => {
    const priceStr = item.priceNum > 0 ? ` (${item.price} each)` : '';
    lines.push(`\u2022 ${item.qty}\u00D7 ${item.name}${priceStr}`);
  });

  const totalPrice = cart.reduce((s, c) => s + c.priceNum * c.qty, 0);
  if (totalPrice > 0) {
    lines.push('');
    lines.push(`Estimated total: R${totalPrice}`);
  }
  if (note) {
    lines.push('');
    lines.push(`Special instructions: ${note}`);
  }
  lines.push('');
  lines.push('Please confirm availability and payment. Thanks!');

  const message = encodeURIComponent(lines.join('\n'));
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');

  // Record send time and start cooldown UI
  waLastSent = Date.now();
  startWaCooldown();
}

function startWaCooldown() {
  const btn = document.getElementById('whatsappBtn');
  let seconds = WA_COOLDOWN_MS / 1000;

  btn.disabled = true;
  btn.dataset.originalText = btn.innerHTML;

  const tick = () => {
    if (seconds <= 0) {
      btn.disabled = cart.length === 0;
      btn.innerHTML = btn.dataset.originalText;
      return;
    }
    btn.innerHTML = `Order sent! Resend in ${seconds}s`;
    seconds--;
    setTimeout(tick, 1000);
  };
  tick();
}

function showWaCooldown(remaining) {
  const btn = document.getElementById('whatsappBtn');
  const orig = btn.innerHTML;
  btn.innerHTML = `Please wait ${remaining}s before resending`;
  setTimeout(() => { btn.innerHTML = orig; }, 2000);
}

// ── Menu render ───────────────────────────────────────────────
function switchTab(cat, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const grid = document.getElementById('menuGrid');
  grid.innerHTML = '';
  MENU[cat].forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.innerHTML = `
      <span class="c-icon">${item.icon}</span>
      <div class="c-name">${item.name}</div>
      <div class="c-desc">${item.desc}</div>
      <div class="c-foot">
        <span class="c-price">${item.price}</span>
        ${item.badge ? `<span class="c-badge${item.hot?' hot':''}">${item.badge}</span>` : ''}
      </div>
      <button class="c-add" onclick="addToCart(${JSON.stringify(item).replace(/"/g,'&quot;')}, this)">+ Add to Order</button>`;
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.45s ${i*0.07}s ease, transform 0.45s ${i*0.07}s ease`;
    grid.appendChild(card);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }));
  });
}
switchTab('burgers', document.querySelector('.tab.active'));