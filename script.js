// --- 1. CONFIGURATION ---
// Is URL ko tabhi badlein jab aap naya Deployment karein
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw8hdjGjnymgMQTE4c0gMmI0VVCWoEubyLyeOuo2pfbegv1ISFU2O6acvWM75hThJX8/exec"; 

let allProducts = [];
let currentData = [];

/**
 * Page load hote hi data mangwane ki koshish karein
 */
window.onload = async () => {
    // 1. Pehle LocalStorage wala turant dikhao (Speed ke liye)
    const localData = localStorage.getItem('myProducts');
    if (localData) {
        try {
            allProducts = JSON.parse(localData);
            currentData = [...allProducts];
            render(allProducts);
        } catch(e) { console.log("Local storage error"); }
    }
    
    // 2. Phir Cloud se fresh data lao
    await refreshData();
};

/**
 * Google Sheets se Fresh Data Lane Ke Liye
 */
async function refreshData() {
    try {
        // Cache busting ke liye timestamp
        const fetchUrl = SCRIPT_URL + (SCRIPT_URL.includes('?') ? '&' : '?') + 't=' + Date.now();
        
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error("Network response was not ok");
        
        const sheetData = await response.json();
        
        // --- DHAYAN DEIN: Yahan format change hua hai ---
        // Agar sheetData mein .products hai (jo admin panel bhej raha hai)
        let freshProducts = [];
        if (sheetData.products && Array.isArray(sheetData.products)) {
            freshProducts = sheetData.products;
            
            // Settings ko bhi update kar dein (UPI wagera ke liye)
            if(sheetData.settings) {
                localStorage.setItem('ghabaUPI', sheetData.settings.upi);
                localStorage.setItem('adminPassword', sheetData.settings.password);
            }
        } else if (Array.isArray(sheetData)) {
            // Agar purana format hai toh seedha array lo
            freshProducts = sheetData;
        }

        if (freshProducts.length > 0) {
            allProducts = freshProducts;
            currentData = [...allProducts];
            
            // Naye data ko save karein
            localStorage.setItem('myProducts', JSON.stringify(allProducts));
            render(allProducts); 
            console.log("Cloud Data Synced! Total Items:", allProducts.length);
        }
    } catch (error) {
        console.error("Sheet load error:", error);
    }
    updateCartBadge();
}

/**
 * Render Function (Design & UI)
 */
function render(data) {
    const grid = document.getElementById('productDisplay');
    if (!grid) return;

    if (!data || data.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #888;">
                <i class="fa-solid fa-box-open" style="font-size: 40px; margin-bottom: 10px; color: #ccc;"></i>
                <h3>Abhi koi product live nahi hai</h3>
                <p>Naya collection jald hi aayega!</p>
            </div>`;
        return;
    }

    grid.innerHTML = '';
    
    // Naye products ko upar dikhane ke liye reverse
    // slice() isliye taaki original array kharab na ho
    const displayData = [...data].reverse();

    displayData.forEach(p => {
        const currentPrice = parseFloat(p.price) || 0;
        const originalPrice = Math.round(currentPrice * 1.4);
        
        // Image logic: sheet ke headers se matching
        let imgPath = p.mainImg || p.img || (p.gallery && p.gallery[0]) || 'https://via.placeholder.com/300?text=No+Image';

        grid.innerHTML += `
            <div class="product-card" onclick="openProduct(${p.id})">
                <div class="img-wrapper">
                    <img src="${imgPath}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300?text=Image+Error'">
                    <div class="wishlist-icon" onclick="event.stopPropagation(); addToWishlist(${p.id})">
                        <i class="fa-regular fa-heart"></i>
                    </div>
                </div>
                <div class="product-info">
                    <p class="product-name">${p.name}</p>
                    <div class="price-container">
                        <span class="main-price">₹${currentPrice}</span>
                        <span class="old-price">₹${originalPrice}</span>
                        <span class="discount-badge">30% OFF</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 5px;">
                         <span class="rating-pill">4.2 <i class="fa-solid fa-star" style="font-size: 8px;"></i></span>
                        <span style="font-size: 11px; color: #888;">Free Delivery</span>
                    </div>
                </div>
            </div>`;
    });
}

// --- Filtering & UI Logic ---

function searchProduct() {
    const val = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allProducts.filter(p => 
        (p.name && p.name.toLowerCase().includes(val)) || 
        (p.category && p.category.toLowerCase().includes(val))
    );
    render(filtered);
}

function filterProducts(categoryName) {
    // URL se filter karne ke liye ya button se
    currentData = (categoryName === 'All') 
        ? [...allProducts] 
        : allProducts.filter(p => p.category === categoryName);
    render(currentData);
}

function sortProducts(type) {
    const sorted = [...currentData].sort((a, b) => 
        type === 'low' ? a.price - b.price : b.price - a.price
    );
    render(sorted);
}

function openProduct(id) {
    window.location.href = `details.html?id=${id}`; 
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadgeIndex');
    if (!badge) return;
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    badge.innerText = cart.length;
    badge.style.display = cart.length > 0 ? "block" : "none";
}

function addToWishlist(id) {
    alert("Wishlist mein add ho gaya! ❤️");
}

// Browser tab par wapas aate hi sync karein
window.onfocus = refreshData;