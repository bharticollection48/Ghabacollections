// --- 1. CONFIGURATION ---
// Apni Google Apps Script ka URL yahan dalein (Wahi jo admin.js mein use kiya tha)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwbKvBicNZ6CuemvLGjFIXzsRws_K2oFlbXnzGMWyrOzLyRXlkW46rwarQRyRbV8G9x/exec"; 

// Global Variables
let allProducts = [];
let currentData = [];

/**
 * Page load hone par Google Sheets aur LocalStorage dono se data load karein
 */
window.onload = async () => {
    await refreshData();
};

/**
 * Data ko Google Sheets (Global) aur LocalStorage (Backup) se load karne ke liye
 */
async function refreshData() {
    const grid = document.getElementById('productDisplay');
    if(grid) grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px;">Ek minute, products load ho rahe hain...</div>`;

    try {
        // 1. Pehle LocalStorage se fast load karein
        allProducts = JSON.parse(localStorage.getItem('myProducts')) || [];
        
        // 2. Phir Google Sheet se naya data fetch karein (Agar link setup hai)
        if (SCRIPT_URL !== "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
            const response = await fetch(SCRIPT_URL);
            const sheetData = await response.json();
            
            if (sheetData && sheetData.length > 0) {
                allProducts = sheetData; // Sheet wala data primary ban jayega
                localStorage.setItem('myProducts', JSON.stringify(allProducts)); // Backup update karein
            }
        }
    } catch (error) {
        console.log("Sheet load error, using local backup:", error);
        allProducts = JSON.parse(localStorage.getItem('myProducts')) || [];
    }

    currentData = [...allProducts];
    render(allProducts);
    updateCartBadge();
}

// Window focus par data refresh
window.onfocus = refreshData;

/**
 * Render Function
 */
function render(data) {
    const grid = document.getElementById('productDisplay');
    
    if (!grid) {
        console.error("Error: 'productDisplay' ID wala container nahi mila!");
        return;
    }

    if (!data || data.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #888;">
                <i class="fa-solid fa-box-open" style="font-size: 40px; margin-bottom: 10px; color: #ccc;"></i>
                <h3>Koi product nahi mila!</h3>
                <p style="font-size: 14px;">Kripya Admin panel se naya product add karein.</p>
            </div>`;
        return;
    }

    grid.innerHTML = '';
    
    // Naye products ko sabse upar dikhane ke liye reverse
    const displayData = [...data].reverse();

    displayData.forEach(p => {
        // Price Calculation (MRP dikhane ke liye)
        const currentPrice = parseFloat(p.price) || 0;
        const originalPrice = Math.round(currentPrice * 1.4);
        
        // Image Path Logic
        let imgPath = p.mainImg || p.img || (p.gallery && p.gallery[0]) || 'https://via.placeholder.com/300?text=No+Image';

        grid.innerHTML += `
            <div class="product-card" onclick="openProduct(${p.id})">
                <div class="img-wrapper">
                    <img src="${imgPath}" 
                         alt="${p.name}" 
                         onerror="this.src='https://via.placeholder.com/300?text=Image+Not+Available'">
                    
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
                         <span class="rating-pill">
                            ${p.rating || '4.2'} <i class="fa-solid fa-star" style="font-size: 8px;"></i>
                        </span>
                        <span style="font-size: 11px; color: #888;">Free Delivery</span>
                    </div>
                    
                    <div style="margin-top: 8px; font-size: 10px; color: #9c27b0; font-weight: 700; text-align: right;">
                        Trusted Seller
                    </div>
                </div>
            </div>`;
    });
}

// --- Logic Functions ---

function updateCartBadge() {
    const badge = document.getElementById('cartBadgeIndex');
    if (!badge) return;
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    if (cart.length > 0) {
        badge.innerText = cart.length;
        badge.style.display = "block";
    } else {
        badge.style.display = "none";
    }
}

function searchProduct() {
    const val = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(val) || 
        (p.category && p.category.toLowerCase().includes(val))
    );
    render(filtered);
}

function filterProducts(categoryName) {
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

function addToWishlist(id) {
    alert("Product added to wishlist! ❤️");
}