let category = 'All';
let selectedPayMethod = 'card';
let currentUser = JSON.parse(localStorage.getItem('borrowloop_user') || 'null');
let bookings = JSON.parse(localStorage.getItem('borrowloop_bookings') || '[]');
let items = JSON.parse(localStorage.getItem('borrowloop_items') || 'null') || [
  { id: 1, name: 'Carpet Cleaner', cat: 'Cleaning', price: 25, location: '1.2 km away', emoji: '🧹', rating: 4.9, owner: 'Sarah', desc: 'Powerful carpet cleaner, perfect for one-off cleaning.' },
  { id: 2, name: 'Extension Ladder', cat: 'Tools', price: 15, location: '0.8 km away', emoji: '🪜', rating: 4.8, owner: 'Daniel', desc: 'Stable household ladder for maintenance and painting.' },
  { id: 3, name: 'Tile Cutter', cat: 'Tools', price: 30, location: '2.1 km away', emoji: '🛠️', rating: 5.0, owner: 'Aiman', desc: 'Manual tile cutter for small renovation projects.' },
  { id: 4, name: 'Pressure Washer', cat: 'Cleaning', price: 20, location: '1.5 km away', emoji: '💦', rating: 4.7, owner: 'Jason', desc: 'Useful for cleaning driveways, walls and outdoor areas.' },
  { id: 5, name: 'Camping Tent', cat: 'Outdoor', price: 18, location: '2.4 km away', emoji: '⛺', rating: 4.9, owner: 'Mira', desc: '4-person tent for short weekend trips.' },
  { id: 6, name: 'Drill Set', cat: 'Tools', price: 12, location: '1.0 km away', emoji: '🔩', rating: 4.8, owner: 'Farid', desc: 'Cordless drill with common bits included.' }
];

function save() {
  localStorage.setItem('borrowloop_items', JSON.stringify(items));
  localStorage.setItem('borrowloop_bookings', JSON.stringify(bookings));
  if (currentUser) localStorage.setItem('borrowloop_user', JSON.stringify(currentUser));
  else localStorage.removeItem('borrowloop_user');
}

function updateAuthUI() {
  const btn = document.getElementById('authNavBtn');
  const protectedNavs = document.querySelectorAll('.protected-nav');

  if (currentUser) {
    btn.textContent = 'Logout (' + currentUser.name.split(' ')[0] + ')';
    btn.onclick = logout;
    document.getElementById('profName').value = currentUser.name;
    protectedNavs.forEach(nav => nav.style.display = 'inline-block');
  } else {
    btn.textContent = 'Login';
    btn.onclick = () => openAuthModal();
    protectedNavs.forEach(nav => nav.style.display = 'none');
  }
}

function logout() {
  currentUser = null;
  save();
  updateAuthUI();
  toast('Logged out successfully');
  showPage('home');
}

function showPage(id) {
  const protectedPages = ['list', 'bookings', 'profile'];
  if (protectedPages.includes(id) && !currentUser) {
    toast('Please log in to view this page');
    openAuthModal({ type: 'navigate', targetPage: id });
    return;
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'bookings') renderBookings();
  window.scrollTo(0, 0);
}

function openAuthModal(pendingAction = null) {
  document.getElementById('modalContent').innerHTML = `
  <button class="close" onclick="closeModal()">✕</button>
  <div class="auth-tabs">
    <div class="auth-tab active" id="tab-login" onclick="switchAuthMode('login')">Log In</div>
    <div class="auth-tab" id="tab-signup" onclick="switchAuthMode('signup')">Sign Up</div>
  </div>
  <div id="auth-form-content">
    <h2>Welcome Back</h2>
    <p class="muted">Please log in to continue.</p>
    <label>Email</label><input id="authEmail" type="email" placeholder="e.g. user@example.com">
    <label>Password</label><input id="authPass" type="password" placeholder="••••••••">
    <div id="authError" class="error-msg"></div>
    <button class="primary" style="width:100%;margin-top:18px" onclick="submitAuth('login', ${JSON.stringify(pendingAction)})">Log In</button>
  </div>`;
  document.getElementById('modal').classList.add('show');
}

function switchAuthMode(mode) {
  document.getElementById('tab-login').classList.toggle('active', mode === 'login');
  document.getElementById('tab-signup').classList.toggle('active', mode === 'signup');
  const container = document.getElementById('auth-form-content');
  if (mode === 'login') {
    container.innerHTML = `
      <h2>Welcome Back</h2>
      <p class="muted">Please log in to continue.</p>
      <label>Email</label><input id="authEmail" type="email" placeholder="e.g. user@example.com">
      <label>Password</label><input id="authPass" type="password" placeholder="••••••••">
      <div id="authError" class="error-msg"></div>
      <button class="primary" style="width:100%;margin-top:18px" onclick="submitAuth('login')">Log In</button>`;
  } else {
    container.innerHTML = `
      <h2>Create Account</h2>
      <p class="muted">Join your local sharing community.</p>
      <label>Full Name</label><input id="authName" placeholder="e.g. Jane Doe">
      <label>Email</label><input id="authEmail" type="email" placeholder="e.g. user@example.com">
      <label>Password</label><input id="authPass" type="password" placeholder="••••••••">
      <div class="pwd-hint">Must be at least 8 characters with 1 uppercase, 1 lowercase & 1 number.</div>
      <div id="authError" class="error-msg"></div>
      <button class="primary" style="width:100%;margin-top:18px" onclick="submitAuth('signup')">Create Account</button>`;
  }
}

function submitAuth(type, pendingAction = null) {
  const email = document.getElementById('authEmail').value.trim();
  const pass = document.getElementById('authPass').value.trim();
  const errorBox = document.getElementById('authError');
  errorBox.style.display = 'none';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorBox.textContent = 'Please enter a valid email address.';
    errorBox.style.display = 'block';
    return;
  }

  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passRegex.test(pass)) {
    errorBox.textContent = 'Password must be at least 8 characters long, include an uppercase letter, lowercase letter, and a number.';
    errorBox.style.display = 'block';
    return;
  }

  let name = "Demo User";
  if (type === 'signup') {
    const nameInput = document.getElementById('authName').value.trim();
    if (!nameInput) {
      errorBox.textContent = 'Please enter your full name.';
      errorBox.style.display = 'block';
      return;
    }
    name = nameInput;
  } else {
    name = email.split('@')[0];
  }

  currentUser = { email, name };
  save();
  updateAuthUI();
  toast('Successfully logged in');
  closeModal();

  if (pendingAction) {
    if (pendingAction.type === 'payment') {
      proceedToPayment(pendingAction.id, pendingAction.s, pendingAction.e);
    } else if (pendingAction.type === 'navigate') {
      showPage(pendingAction.targetPage);
    }
  }
}

function setCategory(c, btn) {
  category = c;
  document.querySelectorAll('.filter').forEach(x => x.classList.remove('active'));
  btn.classList.add('active');
  renderItems();
}

function renderItems() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const list = items.filter(x => (category === 'All' || x.cat === category) && x.name.toLowerCase().includes(q));
  document.getElementById('itemGrid').innerHTML = list.map(x => `
 <div class="card">
    <div class="pic">${x.emoji}</div>
    <div class="card-body">
     <h3>${x.name}</h3><div class="price">RM ${x.price}/day</div>
     <div class="muted">📍 ${x.location} · ⭐ ${x.rating}</div>
     <div class="tag">${x.cat}</div><div class="tag">Verified owner</div>
     <div class="card-actions"><button class="secondary" onclick="viewItem(${x.id})">View</button><button class="primary" onclick="openBooking(${x.id})">Borrow</button></div>
    </div>
 </div>`).join('') || '<p class="muted">No items found.</p>';
}

function viewItem(id) {
  const x = items.find(i => i.id === id);
  document.getElementById('modalContent').innerHTML = `
 <button class="close" onclick="closeModal()">✕</button>
 <div class="bigpic">${x.emoji}</div><h2>${x.name}</h2>
 <div class="price">RM ${x.price}/day</div><p class="muted">📍 ${x.location} · ⭐ ${x.rating} · Owner: ${x.owner}</p>
 <p>${x.desc}</p><button class="primary" onclick="closeModal();openBooking(${x.id})">Request booking</button>`;
  document.getElementById('modal').classList.add('show');
}

function openBooking(id) {
  const x = items.find(i => i.id === id);
  document.getElementById('modalContent').innerHTML = `
 <button class="close" onclick="closeModal()">✕</button><h2>Book ${x.name}</h2>
 <label>Start date</label><input id="startDate" type="date">
 <label>Return date</label><input id="endDate" type="date">
 <label>Message to owner</label><textarea id="bookingMsg" placeholder="Hi, I would like to borrow this item..."></textarea>
 <button class="primary" style="margin-top:15px;width:100%" onclick="handleCheckoutIntent(${x.id})">Proceed to Checkout →</button>`;
  document.getElementById('modal').classList.add('show');
}

function handleCheckoutIntent(id) {
  const s = document.getElementById('startDate').value;
  const e = document.getElementById('endDate').value;
  if (!s || !e) { toast('Please select both dates'); return; }
  if (e < s) { toast('Return date must be after start date'); return; }

  if (!currentUser) {
    toast('Please log in or sign up to continue');
    openAuthModal({ type: 'payment', id, s, e });
    return;
  }

  proceedToPayment(id, s, e);
}

function proceedToPayment(id, s, e) {
  const x = items.find(i => i.id === id);
  const days = Math.max(1, Math.ceil((new Date(e) - new Date(s)) / 86400000));
  const subtotal = days * x.price;
  const serviceFee = 2.50;
  const total = subtotal + serviceFee;

  document.getElementById('modalContent').innerHTML = `
 <button class="close" onclick="closeModal()">✕</button>
 <h2>🔒 Secure Checkout</h2>
 
 <div class="secure-badge">
    <span>🛡️</span>
    <div><b>256-bit SSL Encryption</b><br><span style="color:#aaa;font-size:11px">Your payment details are fully protected.</span></div>
 </div>

 <div class="cost-breakdown">
    <div class="cost-row"><span>${x.name} (${days} ${days > 1 ? 'days' : 'day'})</span><span>RM ${subtotal.toFixed(2)}</span></div>
    <div class="cost-row"><span>Community Protection Fee</span><span>RM ${serviceFee.toFixed(2)}</span></div>
    <div class="cost-total"><span>Total Payable</span><span>RM ${total.toFixed(2)}</span></div>
 </div>

 <label>Select Payment Method</label>
 <div class="payment-methods">
    <div class="pay-opt selected" id="opt-card" onclick="selectPayOpt('card')">💳 Credit Card</div>
    <div class="pay-opt" id="opt-fpx" onclick="selectPayOpt('fpx')">🏛️ Online Banking</div>
 </div>

 <div id="pay-fields">
    <label>Cardholder Name</label><input id="payName" placeholder="e.g. John Doe">
    <label>Card Number</label><input id="payCardNum" placeholder="1234 5678 9101 1121">
    <div style="display:flex;gap:10px">
      <div style="flex:1"><label>Expiry</label><input id="payExp" placeholder="MM/YY"></div>
      <div style="flex:1"><label>CVV</label><input id="payCvv" placeholder="123"></div>
    </div>
 </div>

 <button class="primary" style="width:100%;margin-top:15px;padding:12px;" onclick="validateAndConfirm(${x.id}, '${s}', '${e}', ${total})">Pay RM ${total.toFixed(2)} Now</button>
 `;
  document.getElementById('modal').classList.add('show');
}

function selectPayOpt(type) {
  selectedPayMethod = type;
  document.getElementById('opt-card').classList.toggle('selected', type === 'card');
  document.getElementById('opt-fpx').classList.toggle('selected', type === 'fpx');
  const fields = document.getElementById('pay-fields');
  if (type === 'card') {
    fields.innerHTML = `
      <label>Cardholder Name</label><input id="payName" placeholder="e.g. John Doe">
      <label>Card Number</label><input id="payCardNum" placeholder="1234 5678 9101 1121">
      <div style="display:flex;gap:10px">
        <div style="flex:1"><label>Expiry</label><input id="payExp" placeholder="MM/YY"></div>
        <div style="flex:1"><label>CVV</label><input id="payCvv" placeholder="123"></div>
      </div>`;
  } else {
    fields.innerHTML = `
      <label>Select Bank</label>
      <select id="payBank">
        <option value="">-- Choose your bank --</option>
        <option value="Maybank2u">Maybank2u</option>
        <option value="CIMB Clicks">CIMB Clicks</option>
        <option value="Public Bank">Public Bank</option>
        <option value="RHB Now">RHB Now</option>
      </select>`;
  }
}

function validateAndConfirm(id, s, e, total) {
  if (selectedPayMethod === 'card') {
    const name = document.getElementById('payName').value.trim();
    const num = document.getElementById('payCardNum').value.trim();
    const exp = document.getElementById('payExp').value.trim();
    const cvv = document.getElementById('payCvv').value.trim();
    if (!name || !num || !exp || !cvv) {
      toast('Please fill in all card details');
      return;
    }
  } else {
    const bank = document.getElementById('payBank').value;
    if (!bank) {
      toast('Please select a bank');
      return;
    }
  }
  confirmBooking(id, s, e, total);
}

function confirmBooking(id, s, e, total) {
  const x = items.find(i => i.id === id);
  bookings.push({ id: Date.now(), item: x.name, start: s, end: e, total, status: 'Paid & Confirmed', owner: x.owner });
  save();
  closeModal();
  toast(`Payment Successful · RM ${total.toFixed(2)}`);
  renderBookings();
  document.getElementById('bookingCount').textContent = bookings.length;
}

function renderBookings() {
  document.getElementById('bookingList').innerHTML = bookings.length ? bookings.map(b => `
 <div class="card" style="padding:18px;margin:12px 0">
 <h3>${b.item}</h3><p class="muted">${b.start} → ${b.end} · Owner: ${b.owner}</p>
 <b>RM ${b.total.toFixed(2)}</b> · <span style="color:var(--green)">${b.status}</span>
 <div class="card-actions"><button class="secondary" onclick="openChat('${b.owner}')">💬 Chat owner</button><button class="primary" onclick="toast('Return reminder set')">🔔 Return reminder</button></div>
 </div>`).join('') : '<div class="form"><h3>No bookings yet</h3><p class="muted">Browse an item and make your first booking.</p><button class="primary" onclick="showPage(\'home\')">Browse items</button></div>';
  document.getElementById('bookingCount').textContent = bookings.length;
}

function openChat(owner) {
  document.getElementById('modalContent').innerHTML = `
 <button class="close" onclick="closeModal()">✕</button><h2>Chat with ${owner}</h2>
 <div class="chatbox"><div class="msg">Hi! Is the item still available?</div><div class="msg mine">Yes, it is available. You can book it here.</div></div>
 <div style="display:flex;gap:8px;margin-top:10px"><input id="chatInput" placeholder="Type a message..."><button class="primary" onclick="sendChat()">Send</button></div>`;
  document.getElementById('modal').classList.add('show');
}

function sendChat() {
  let x = document.getElementById('chatInput');
  if (x.value.trim()) { toast('Message sent'); x.value = ''; }
}

function addItem() {
  if (!currentUser) {
    toast('Please log in to list an item');
    openAuthModal();
    return;
  }
  const name = document.getElementById('newName').value.trim();
  const price = Number(document.getElementById('newPrice').value);
  if (!name || !price) { toast('Please enter item name and price'); return; }
  items.unshift({
    id: Date.now(),
    name,
    cat: document.getElementById('newCat').value,
    price,
    location: document.getElementById('newLocation').value || 'Nearby',
    emoji: '📦',
    rating: 5,
    owner: currentUser.name,
    desc: document.getElementById('newDesc').value || 'Item available for community borrowing.'
  });
  save();
  toast('Item published');
  document.getElementById('newName').value = '';
  showPage('home');
  renderItems();
}

function useLocation() { toast('Demo location: showing nearby community items'); }
function closeModal() { document.getElementById('modal').classList.remove('show'); }
function toast(msg) {
  let t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function toggleSupportChat() {
  const box = document.getElementById('aiChatBox');
  box.classList.toggle('show');
}

// Hugging Face BorrowBot Integration (With Enhanced Error UI)
async function sendAISupportMsg() {
  const input = document.getElementById('aiChatInput');
  const userMsg = input.value.trim();
  if (!userMsg) return;

  const chatBody = document.getElementById('aiChatBody');

  // 1. Render User Message
  chatBody.innerHTML += `<div class="chat-msg user">${userMsg}</div>`;
  input.value = '';
  chatBody.scrollTop = chatBody.scrollHeight;

  // 2. Render Loading Indicator
  const loadingId = 'loading-' + Date.now();
  chatBody.innerHTML += `<div id="${loadingId}" class="chat-msg ai"><i>BorrowBot is thinking...</i></div>`;
  chatBody.scrollTop = chatBody.scrollHeight;

  // 3. API Config - MAKE SURE YOUR TOKEN GOES HERE!
  const HF_TOKEN = "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"; 
  const MODEL_ID = "HuggingFaceH4/zephyr-7b-beta";

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL_ID}`, {
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({
        inputs: `<|im_start|>system\nYou are BorrowBot, an AI customer support assistant for BorrowLoop—a peer-to-peer community sharing marketplace. Keep answers short and concise.<|im_end|>\n<|im_start|>user\n${userMsg}<|im_end|>\n<|im_start|>assistant\n`,
        parameters: {
          max_new_tokens: 100,
          return_full_text: false
        }
      })
    });

    // Detailed error extraction so it displays in the chat instead of failing silently
    if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData.error) errorMsg = errorData.error;
        } catch (e) {
            errorMsg = await response.text();
        }
        throw new Error(errorMsg);
    }

    const result = await response.json();
    const loadingElem = document.getElementById(loadingId);
    if (loadingElem) loadingElem.remove();

    let botReply = "I am having trouble processing that right now. Please try again.";

    if (Array.isArray(result) && result[0] && result[0].generated_text) {
      botReply = result[0].generated_text.replace(/<\|im_end\|>/g, '').trim();
    } else if (result.error) {
      botReply = `API Error: ${typeof result.error === 'string' ? result.error : JSON.stringify(result.error)}`;
    }

    chatBody.innerHTML += `<div class="chat-msg ai">${botReply}</div>`;
  } catch (error) {
    console.error("Hugging Face API Error:", error);
    const loadingElem = document.getElementById(loadingId);
    if (loadingElem) loadingElem.remove();
    
    // Renders the precise error directly in the widget
    chatBody.innerHTML += `<div class="chat-msg ai" style="color: #ff6b6b; border-color: #552222; background: #2a1111;">
      <b>API Error:</b> ${error.message}
      <br><br><span style="font-size:11px; color:#aaa;">Check if your HF_TOKEN is valid in script.js.</span>
    </div>`;
  }

  chatBody.scrollTop = chatBody.scrollHeight;
}

updateAuthUI();
renderItems();
renderBookings();