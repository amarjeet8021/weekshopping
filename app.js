const SUPPORT_EMAIL = "amarjeetkumartiwari@gmail.com"; // domain change karna ho to yahan badlo

const PRODUCTS = [
  // Clothes
  {id:1,cat:"clothes",name:"Men's Cotton T-Shirt",e:"👕",price:499,mrp:999,bg:"#dbeafe"},
  {id:2,cat:"clothes",name:"Slim Fit Blue Jeans",e:"👖",price:1299,mrp:2499,bg:"#e0e7ff"},
  {id:3,cat:"clothes",name:"Women's Floral Kurti",e:"👗",price:899,mrp:1799,bg:"#fce7f3"},
  {id:4,cat:"clothes",name:"Winter Hoodie",e:"🧥",price:1499,mrp:2999,bg:"#fef3c7"},
  {id:5,cat:"clothes",name:"Formal Shirt",e:"👔",price:799,mrp:1599,bg:"#d1fae5"},
  {id:6,cat:"clothes",name:"Sports Sneakers",e:"👟",price:1999,mrp:3999,bg:"#ffedd5"},
  // Mobiles
  {id:7,cat:"mobile",name:"Galaxy Pro 5G (8GB/128GB)",e:"📱",price:18999,mrp:24999,bg:"#ede9fe"},
  {id:8,cat:"mobile",name:"iPhone-style Max 256GB",e:"📱",price:69999,mrp:79999,bg:"#e5e7eb"},
  {id:9,cat:"mobile",name:"Redmi Style 6GB/128GB",e:"📱",price:11999,mrp:14999,bg:"#fee2e2"},
  {id:10,cat:"mobile",name:"Wireless Earbuds",e:"🎧",price:1499,mrp:3499,bg:"#cffafe"},
  {id:11,cat:"mobile",name:"Fast Charger 65W",e:"🔌",price:799,mrp:1499,bg:"#fef9c3"},
  {id:12,cat:"mobile",name:"Smart Watch Active",e:"⌚",price:2999,mrp:5999,bg:"#dcfce7"},
  // Laptops
  {id:13,cat:"laptop",name:"Student Laptop i3 8GB/256GB",e:"💻",price:32990,mrp:42990,bg:"#e0f2fe"},
  {id:14,cat:"laptop",name:"Pro Laptop i5 16GB/512GB",e:"💻",price:54990,mrp:69990,bg:"#ede9fe"},
  {id:15,cat:"laptop",name:"Gaming Laptop RTX 4050",e:"🎮",price:84990,mrp:104990,bg:"#fee2e2"},
  {id:16,cat:"laptop",name:"Wireless Mouse & Keyboard",e:"🖱️",price:999,mrp:1999,bg:"#f1f5f9"}
];

const $ = s => document.querySelector(s);
const inr = n => "₹" + n.toLocaleString("en-IN");
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

let cat = "all", q = "", cart = load("ws_cart", {}), user = load("ws_user", null);

function toast(m){ const t=$("#toast"); t.textContent=m; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2200); }

/* ---------- Products ---------- */
function render(){
  const list = PRODUCTS.filter(p => (cat==="all"||p.cat===cat) && p.name.toLowerCase().includes(q));
  $("#grid").innerHTML = list.map(p => `
    <div class="pcard">
      <div class="pimg" style="background:${p.bg}">${p.e}</div>
      <div class="pbody">
        <span class="tag">${p.cat}</span>
        <h3>${p.name}</h3>
        <div class="price">${inr(p.price)}<s>${inr(p.mrp)}</s></div>
        <div class="off">${Math.round((1-p.price/p.mrp)*100)}% off</div>
        <button class="btn" data-add="${p.id}">Add to Cart</button>
      </div>
    </div>`).join("");
  $("#empty").hidden = list.length > 0;
}
document.querySelectorAll(".cat").forEach(b => b.onclick = () => {
  document.querySelectorAll(".cat").forEach(x => x.classList.remove("active"));
  b.classList.add("active"); cat = b.dataset.cat; render();
});
$("#search").oninput = e => { q = e.target.value.trim().toLowerCase(); render(); };
$("#grid").onclick = e => { const id = e.target.dataset.add; if(id){ cart[id]=(cart[id]||0)+1; saveCart(); toast("Cart me add ho gaya ✅"); } };

/* ---------- Cart ---------- */
function saveCart(){ save("ws_cart", cart); renderCart(); }
function renderCart(){
  const ids = Object.keys(cart);
  $("#cartCount").textContent = ids.reduce((s,i)=>s+cart[i],0);
  $("#cartItems").innerHTML = ids.length ? ids.map(id => {
    const p = PRODUCTS.find(x=>x.id==id); if(!p) return "";
    return `<div class="item"><span class="e">${p.e}</span>
      <div class="i"><b>${p.name}</b><br>${inr(p.price)}</div>
      <div class="qty"><button data-dec="${id}">−</button>${cart[id]}<button data-inc="${id}">+</button></div></div>`;
  }).join("") : '<p class="muted" style="padding:20px 0">Cart khali hai.</p>';
  $("#cartTotal").textContent = inr(ids.reduce((s,i)=>s+(PRODUCTS.find(x=>x.id==i)?.price||0)*cart[i],0));
}
$("#cartItems").onclick = e => {
  const inc=e.target.dataset.inc, dec=e.target.dataset.dec;
  if(inc) cart[inc]++;
  if(dec){ cart[dec]--; if(cart[dec]<=0) delete cart[dec]; }
  if(inc||dec) saveCart();
};
const toggleCart = open => { $("#drawer").classList.toggle("open",open); $("#scrim").hidden=!open; };
$("#openCart").onclick = () => toggleCart(true);
$("#closeCart").onclick = $("#scrim").onclick = () => toggleCart(false);
$("#checkout").onclick = () => {
  if(!Object.keys(cart).length) return toast("Pehle kuch add karo");
  if(!user){ toggleCart(false); openAuth("login"); return; }
  cart = {}; saveCart(); toggleCart(false); toast("Order place ho gaya 🎉 (demo)");
};

/* ---------- Auth (demo: browser localStorage) ---------- */
function openAuth(tab){ $("#authOverlay").hidden=false; setTab(tab); }
function setTab(t){
  $("#loginForm").hidden = t!=="login"; $("#signupForm").hidden = t!=="signup";
  $("#tabLogin").classList.toggle("active",t==="login"); $("#tabSignup").classList.toggle("active",t==="signup");
  $("#authMsg").textContent="";
}
async function hash(s){
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
function msg(t, ok){ const m=$("#authMsg"); m.textContent=t; m.className="msg"+(ok?" ok":""); }
function userArea(){
  $("#userArea").innerHTML = user
    ? `<span>👤 ${user.name.split(" ")[0]}</span> <button class="btn ghost" id="logout">Logout</button>`
    : `<button class="btn ghost" id="openLogin">Sign In</button> <button class="btn" id="openSignup">Sign Up</button>`;
  if(user) $("#logout").onclick = () => { user=null; save("ws_user",null); userArea(); toast("Logout ho gaye"); };
  else { $("#openLogin").onclick=()=>openAuth("login"); $("#openSignup").onclick=()=>openAuth("signup"); }
}
$("#tabLogin").onclick = () => setTab("login");
$("#tabSignup").onclick = () => setTab("signup");
document.querySelectorAll("[data-close]").forEach(b => b.onclick = () => $("#authOverlay").hidden = true);
$("#authOverlay").onclick = e => { if(e.target.id==="authOverlay") e.target.hidden = true; };

$("#signupForm").onsubmit = async e => {
  e.preventDefault(); const f = new FormData(e.target);
  const users = load("ws_users", {}); const email = f.get("email").toLowerCase();
  if(users[email]) return msg("Ye email pehle se registered hai.");
  users[email] = {name:f.get("name"), phone:f.get("phone"), pw: await hash(f.get("password"))};
  save("ws_users", users);
  user = {name:users[email].name, email}; save("ws_user", user);
  $("#authOverlay").hidden = true; userArea(); toast("Account ban gaya 🎉"); e.target.reset();
};
$("#loginForm").onsubmit = async e => {
  e.preventDefault(); const f = new FormData(e.target);
  const email = f.get("email").toLowerCase(); const u = load("ws_users", {})[email];
  if(!u || u.pw !== await hash(f.get("password"))) return msg("Email ya password galat hai.");
  user = {name:u.name, email}; save("ws_user", user);
  $("#authOverlay").hidden = true; userArea(); toast("Welcome back, "+u.name.split(" ")[0]+" 👋"); e.target.reset();
};

/* ---------- Support ---------- */
$("#supportForm").onsubmit = e => {
  e.preventDefault(); const f = new FormData(e.target);
  const body = `Name: ${f.get("name")}\nEmail: ${f.get("email")}\n\n${f.get("msg")}`;
  location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Week Shopping Support")}&body=${encodeURIComponent(body)}`;
};

/* ---------- Misc ---------- */
$("#burger").onclick = () => $("#links").classList.toggle("open");
$("#links").onclick = () => $("#links").classList.remove("open");
$("#year").textContent = new Date().getFullYear();
render(); renderCart(); userArea();
