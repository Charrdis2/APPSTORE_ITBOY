const products = [
  {
    id: 1,
    name: 'Motorcycle Helmet',
    category: 'motorcycle',
    price: 3200,
    stock: 5,
    emoji: '🪖',
    image: 'images/products/motorcycle-helmet.jpg',
    description: 'DOT-certified helmet with breathable lining and impact protection.'
  },
  {
    id: 2,
    name: 'Racing Gloves',
    category: 'motorcycle',
    price: 1200,
    stock: 5,
    emoji: '🧤',
    image: 'images/products/racing-gloves.jpg',
    description: 'Comfortable gloves with anti-slip grip for long rides.'
  },
  {
    id: 3,
    name: 'Heavy Duty Chain',
    category: 'motorcycle',
    price: 2800,
    stock: 5,
    emoji: '🔗',
    image: 'images/products/motorcycle-chain.jpg',
    description: 'Long-lasting chain built for smooth and reliable power transfer.'
  },
  {
    id: 4,
    name: 'Brake Pad Set',
    category: 'motorcycle',
    price: 1600,
    stock: 5,
    emoji: '🛑',
    image: 'images/products/brake-pad-set.jpg',
    description: 'High-friction pads for strong stopping power and safety.'
  },
  {
    id: 5,
    name: 'Bike Bell',
    category: 'bike',
    price: 450,
    stock: 0,
    emoji: '🔔',
    image: 'images/products/bike-bell.jpg',
    description: 'Compact bike bell with a bright sound and durable finish.'
  },
  {
    id: 6,
    name: 'Cycling Knee Guard',
    category: 'bike',
    price: 980,
    stock: 5,
    emoji: '🦵',
    image: 'images/products/cycling-knee-guards.jpg',
    description: 'Lightweight knee protection for safer urban and trail rides.'
  },
  {
    id: 7,
    name: 'Rearview Mirror',
    category: 'bike',
    price: 700,
    stock: 5,
    emoji: '🪞',
    image: 'images/products/rearview-mirror.jpg',
    description: 'Clear mirror with adjustable angle for better visibility.'
  },
  {
    id: 8,
    name: 'Bike Tool Kit',
    category: 'bike',
    price: 1500,
    stock: 5,
    emoji: '🧰',
    image: 'images/products/bike-tool-kit.jpg',
    description: 'Essential multi-tool set for quick maintenance on the road.'
  }
];

const defaultAccounts = [
  { username: 'ITBOYS', password: '12345' },
  { username: 'staff', password: '12345' }
];

const STORAGE_KEYS = {
  accounts: 'itboys_accounts',
  session: 'itboys_session',
  cart: 'itboys_cart',
  orders: 'itboys_orders',
  stock: 'itboys_stock'
};

const authScreen = document.getElementById('authScreen');
const storeScreen = document.getElementById('storeScreen');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authDivider = document.querySelector('.divider');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const authMessage = document.getElementById('authMessage');
const welcomeUser = document.getElementById('welcomeUser');
const logoutBtn = document.getElementById('logoutBtn');
const productGrid = document.getElementById('productGrid');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutDialog = document.getElementById('checkoutDialog');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutItems = document.getElementById('checkoutItems');
const checkoutTotal = document.getElementById('checkoutTotal');
const checkoutError = document.getElementById('checkoutError');
const checkoutSuccess = document.getElementById('checkoutSuccess');
const orderConfirmation = document.getElementById('orderConfirmation');
const filterButtons = document.querySelectorAll('.filter-btn');
const productSearch = document.getElementById('productSearch');
const catalogStatus = document.getElementById('catalogStatus');

let selectedCategory = 'all';
let searchTerm = '';
let cart = loadCart();
loadStock();

const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2
});

function formatPrice(amount) {
  return pesoFormatter.format(amount);
}

function loadCart() {
  const saved = localStorage.getItem(STORAGE_KEYS.cart);
  if (!saved) return [];

  try {
    const savedItems = JSON.parse(saved);
    if (!Array.isArray(savedItems)) {
      throw new TypeError('Saved cart must be an array.');
    }

    return savedItems.reduce((items, savedItem) => {
      const product = products.find((item) => item.id === Number(savedItem.id));
      const quantity = Number(savedItem.quantity);
      if (product && Number.isSafeInteger(quantity) && quantity > 0) {
        items.push({ ...product, quantity });
      }
      return items;
    }, []);
  } catch (error) {
    console.error('Unable to read the saved cart. Starting with an empty cart.', error);
    return [];
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
}

function loadStock() {
  const saved = localStorage.getItem(STORAGE_KEYS.stock);
  if (!saved) return;

  try {
    const stockLevels = JSON.parse(saved);
    if (!stockLevels || typeof stockLevels !== 'object' || Array.isArray(stockLevels)) {
      throw new TypeError('Saved stock levels must be an object.');
    }

    products.forEach((product) => {
      const stock = stockLevels[product.id];
      if (Number.isSafeInteger(stock) && stock >= 0) {
        product.stock = stock;
      }
    });
  } catch (error) {
    console.error('Unable to read saved stock levels. Using the demo stock values.', error);
  }
}

function saveStock() {
  const stockLevels = Object.fromEntries(products.map((product) => [product.id, product.stock]));
  localStorage.setItem(STORAGE_KEYS.stock, JSON.stringify(stockLevels));
}

function canFulfillCart() {
  return cart.length > 0 && cart.every((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return product && product.stock >= item.quantity;
  });
}

function saveAccounts() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.accounts) || '[]');
  const hasITBOYS = saved.some((account) => account.username.toLowerCase() === 'itboys');

  if (!saved.length || !hasITBOYS) {
    const mergedAccounts = [...defaultAccounts, ...saved.filter((account) => account.username.toLowerCase() !== 'itboys')];
    localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(mergedAccounts));
  }
}

function getAccounts() {
  saveAccounts();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.accounts) || '[]');
}

function setAuthMessage(message, isError = false) {
  authMessage.textContent = message;
  authMessage.style.color = isError ? '#fca5a5' : '#86efac';
}

function showLoginMode() {
  loginForm.classList.remove('hidden');
  signupForm.classList.add('hidden');
  authDivider.classList.remove('hidden');
  toggleAuthMode.textContent = 'Create a new account';
}

function showSignupMode() {
  loginForm.classList.add('hidden');
  signupForm.classList.remove('hidden');
  authDivider.classList.add('hidden');
  toggleAuthMode.textContent = 'Back to login';
}

function isAuthenticated() {
  return Boolean(localStorage.getItem(STORAGE_KEYS.session));
}

function openStore(username) {
  welcomeUser.textContent = username;
  authScreen.classList.add('hidden');
  storeScreen.classList.remove('hidden');
  renderProducts();
  renderCart();
}

function closeStore() {
  localStorage.removeItem(STORAGE_KEYS.session);
  authScreen.classList.remove('hidden');
  storeScreen.classList.add('hidden');
  showLoginMode();
  loginForm.reset();
  signupForm.reset();
  setAuthMessage('');
}

function login(username, password) {
  const accounts = getAccounts();
  const account = accounts.find(
    (entry) => entry.username.toLowerCase() === username.toLowerCase() && entry.password === password
  );

  if (!account) {
    setAuthMessage('Invalid username or password.', true);
    return;
  }

  localStorage.setItem(STORAGE_KEYS.session, username);
  setAuthMessage('Login successful!');
  openStore(username);
}

function createAccount(username, password) {
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !trimmedPassword) {
    setAuthMessage('Please complete both fields.', true);
    return;
  }

  if (trimmedUsername.length < 3 || trimmedUsername.length > 24) {
    setAuthMessage('Username must be between 3 and 24 characters.', true);
    return;
  }

  if (trimmedPassword.length < 6) {
    setAuthMessage('Password must be at least 6 characters.', true);
    return;
  }

  const accounts = getAccounts();
  const duplicate = accounts.some((account) => account.username.toLowerCase() === trimmedUsername.toLowerCase());

  if (duplicate) {
    setAuthMessage('Username already exists. Please choose another one.', true);
    return;
  }

  accounts.push({ username: trimmedUsername, password: trimmedPassword });
  localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(accounts));
  setAuthMessage('Account created successfully. Please log in.');
  showLoginMode();
  signupForm.reset();
}

function renderProducts() {
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const searchableText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
    return matchesCategory && searchableText.includes(searchTerm);
  });

  catalogStatus.textContent = `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} found`;

  if (!filteredProducts.length) {
    productGrid.innerHTML = '<div class="empty-results">No products match your search. Try another name or category.</div>';
    return;
  }

  productGrid.innerHTML = filteredProducts
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-visual">
            ${product.image ? `<img src="${product.image}" alt="${product.name}" loading="lazy" />` : ''}
            <span class="image-fallback${product.image ? '' : ' visible'}" aria-hidden="true">${product.emoji}</span>
          </div>
          <div class="product-info">
            <div class="product-meta">
              <span class="category">${product.category}</span>
              <span class="stock-status${product.stock === 0 ? ' out-of-stock' : ''}" aria-live="polite">
                ${product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
              </span>
            </div>
            <h4 class="product-name">${product.name}</h4>
            <p class="product-desc">${product.description}</p>
            <div class="product-footer">
              <span class="price">${formatPrice(product.price)}</span>
              <button class="add-btn" data-id="${product.id}" type="button" ${product.stock === 0 ? 'disabled' : ''}>
                ${product.stock === 0 ? 'Out of stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </article>
      `
    )
    .join('');

  productGrid.querySelectorAll('.product-visual img').forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('image-unavailable');
      image.nextElementSibling.classList.add('visible');
    }, { once: true });
  });

  productGrid.querySelectorAll('.add-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = Number(button.dataset.id);
      addToCart(productId);
    });
  });
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product || product.stock <= 0) return;

  const existingItem = cart.find((item) => item.id === productId);
  if (existingItem && existingItem.quantity >= product.stock) return;

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  renderCart();
}

function updateQuantity(productId, change) {
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;

  const product = products.find((entry) => entry.id === productId);
  if (change > 0 && (!product || item.quantity >= product.stock)) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    cart = cart.filter((entry) => entry.id !== productId);
  }

  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  renderCart();
}

function renderCart() {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = String(itemCount);
  cartCount.setAttribute('aria-label', `${itemCount} ${itemCount === 1 ? 'item' : 'items'} in cart`);
  const stockAvailable = canFulfillCart();
  checkoutBtn.disabled = !stockAvailable;
  checkoutBtn.title = cart.length && !stockAvailable
    ? 'Remove unavailable items or reduce quantities before checkout.'
    : '';

  if (!cart.length) {
    cartItems.innerHTML = '<div class="empty-cart">Your cart is empty.<br />Add products to start shopping.</div>';
    cartTotal.textContent = formatPrice(0);
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => {
        const product = products.find((entry) => entry.id === item.id);
        const outOfStock = !product || product.stock === 0;
        const exceedsStock = product && item.quantity > product.stock;
        return `
        <div class="cart-item">
          <div class="cart-item-details">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-meta">${formatPrice(item.price)} each</span>
            ${outOfStock ? '<span class="stock-warning">Out of stock</span>' : ''}
            ${exceedsStock ? `<span class="stock-warning">Only ${product.stock} in stock. Reduce quantity to continue.</span>` : ''}
            <div class="quantity-control" aria-label="Quantity for ${item.name}">
              <button class="quantity-btn" data-id="${item.id}" data-change="-1" aria-label="Decrease ${item.name} quantity" type="button">−</button>
              <span class="quantity-value">${item.quantity}</span>
              <button class="quantity-btn" data-id="${item.id}" data-change="1" aria-label="Increase ${item.name} quantity" type="button" ${!product || item.quantity >= product.stock ? 'disabled' : ''}>+</button>
              <span class="line-total">${formatPrice(item.price * item.quantity)}</span>
            </div>
          </div>
          <button class="remove-btn" data-id="${item.id}" aria-label="Remove ${item.name} from cart" type="button">Remove</button>
        </div>
      `;
      }
    )
    .join('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = formatPrice(total);

  cartItems.querySelectorAll('.remove-btn').forEach((button) => {
    button.addEventListener('click', () => removeFromCart(Number(button.dataset.id)));
  });
  cartItems.querySelectorAll('.quantity-btn').forEach((button) => {
    button.addEventListener('click', () => {
      updateQuantity(Number(button.dataset.id), Number(button.dataset.change));
    });
  });
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  login(username, password);
});

signupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('signupUsername').value.trim();
  const password = document.getElementById('signupPassword').value.trim();
  createAccount(username, password);
});

toggleAuthMode.addEventListener('click', () => {
  const isLoginVisible = !loginForm.classList.contains('hidden');
  if (isLoginVisible) {
    showSignupMode();
  } else {
    showLoginMode();
  }
  setAuthMessage('');
});

logoutBtn.addEventListener('click', () => {
  closeStore();
});

function renderCheckoutSummary() {
  checkoutItems.replaceChildren();
  cart.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'checkout-item';
    const name = document.createElement('span');
    name.textContent = `${item.name} × ${item.quantity}`;
    const price = document.createElement('strong');
    price.textContent = formatPrice(item.price * item.quantity);
    row.append(name, price);
    checkoutItems.append(row);
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  checkoutTotal.textContent = formatPrice(total);
}

function startCheckout() {
  if (!canFulfillCart()) {
    renderCart();
    return;
  }

  checkoutForm.reset();
  checkoutForm.classList.remove('hidden');
  checkoutSuccess.classList.add('hidden');
  checkoutError.textContent = '';
  renderCheckoutSummary();
  checkoutDialog.showModal();
}

function finishCheckout() {
  checkoutDialog.close();
  productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

checkoutBtn.addEventListener('click', startCheckout);
document.getElementById('closeCheckoutBtn').addEventListener('click', () => checkoutDialog.close());
document.getElementById('finishCheckoutBtn').addEventListener('click', finishCheckout);

checkoutForm.addEventListener('submit', (event) => {
  event.preventDefault();
  checkoutError.textContent = '';

  if (!canFulfillCart()) {
    checkoutDialog.close();
    renderCart();
    return;
  }

  if (!checkoutForm.reportValidity()) return;

  const customer = {
    name: checkoutForm.elements.name.value.trim(),
    phone: checkoutForm.elements.phone.value.trim()
  };
  const order = {
    reference: `ITB-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    customer,
    fulfillment: 'In-store pickup',
    payment: 'Pay at the shop',
    items: cart.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  };
  const previousOrders = localStorage.getItem(STORAGE_KEYS.orders);
  const previousStock = localStorage.getItem(STORAGE_KEYS.stock);
  const previousCart = localStorage.getItem(STORAGE_KEYS.cart);

  try {
    const orders = previousOrders ? JSON.parse(previousOrders) : [];
    if (!Array.isArray(orders)) throw new TypeError('Saved orders must be an array.');
    cart.forEach((item) => {
      const product = products.find((entry) => entry.id === item.id);
      if (!product || product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}.`);
      }
      product.stock -= item.quantity;
    });
    saveStock();
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify([...orders, order]));
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify([]));
  } catch (error) {
    cart.forEach((item) => {
      const product = products.find((entry) => entry.id === item.id);
      if (product) product.stock += item.quantity;
    });
    try {
      if (previousOrders === null) {
        localStorage.removeItem(STORAGE_KEYS.orders);
      } else {
        localStorage.setItem(STORAGE_KEYS.orders, previousOrders);
      }
      if (previousStock === null) {
        localStorage.removeItem(STORAGE_KEYS.stock);
      } else {
        localStorage.setItem(STORAGE_KEYS.stock, previousStock);
      }
      if (previousCart === null) {
        localStorage.removeItem(STORAGE_KEYS.cart);
      } else {
        localStorage.setItem(STORAGE_KEYS.cart, previousCart);
      }
    } catch (rollbackError) {
      console.error('Unable to restore saved checkout data after checkout failed.', rollbackError);
    }
    console.error('Unable to save the pickup order.', error);
    checkoutError.textContent = 'We could not save your order. Your cart has been kept; please try again.';
    return;
  }

  cart = [];
  renderProducts();
  renderCart();
  checkoutForm.classList.add('hidden');
  checkoutSuccess.classList.remove('hidden');
  orderConfirmation.textContent = `Order ${order.reference} is reserved for ${customer.name}. Please show this number at the shop and pay ${formatPrice(order.total)} at pickup.`;
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectedCategory = button.dataset.category;
    filterButtons.forEach((btn) => {
      const isActive = btn === button;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
    renderProducts();
  });
});

productSearch.addEventListener('input', () => {
  searchTerm = productSearch.value.trim().toLowerCase();
  renderProducts();
});

if (isAuthenticated()) {
  const currentUser = localStorage.getItem(STORAGE_KEYS.session);
  const validSession = getAccounts().some(
    (account) => account.username.toLowerCase() === currentUser.toLowerCase()
  );

  if (validSession) {
    openStore(currentUser);
  } else {
    localStorage.removeItem(STORAGE_KEYS.session);
    closeStore();
  }
} else {
  closeStore();
}
