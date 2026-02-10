// --- 1. CONFIGURATION ---
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwkEy3fbcW6WNJGnEQHGyCif4d-FSp5RMSywpVWGoRZeb0sQcuNB9B4g2V-sfp-TB-N/exec";

// 1. URL se ID nikalna
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

async function initDetails() {
    let allProducts = JSON.parse(localStorage.getItem('myProducts')) || [];
    
    // Agar local mein product nahi mila, toh cloud se fetch karo
    if (allProducts.length === 0) {
        try {
            const response = await fetch(SCRIPT_URL);
            allProducts = await response.json();
            localStorage.setItem('myProducts', JSON.stringify(allProducts));
        } catch (e) {
            console.log("Fetch Error:", e);
        }
    }

    const product = allProducts.find(p => p.id == productId);

    if (product) {
        renderProduct(product);
    } else {
        document.body.innerHTML = `
            <div style="text-align:center; padding:50px;">
                <i class="fa-solid fa-circle-exclamation" style="font-size:50px; color:#ccc;"></i>
                <h2>Product Not Found!</h2>
                <button onclick="window.location.href='index.html'" style="padding:10px 20px; background:#ff4757; color:white; border:none; border-radius:5px;">Go Back</button>
            </div>`;
    }
}

function renderProduct(product) {
    // Basic Details
    document.getElementById('detName').innerText = product.name;
    document.getElementById('detPrice').innerText = product.price;
    document.getElementById('detCat').innerText = product.category || "General";

    // Media Slider Logic
    const slider = document.getElementById('mediaSlider');
    const dotsContainer = document.getElementById('sliderDots');
    
    let mediaHTML = '';
    let dotsHTML = '';

    // 1. Photo Gallery Setup
    // Admin se 'gallery' array aata hai, usse loop karein
    if (product.gallery && product.gallery.length > 0) {
        product.gallery.forEach((img, index) => {
            if(img && img.trim() !== "") {
                mediaHTML += `
                    <div class="slider-item">
                        <img src="${img}" onerror="this.src='https://via.placeholder.com/400?text=Image+Not+Found'">
                    </div>`;
                dotsHTML += `<div class="dot ${index === 0 ? 'active' : ''}"></div>`;
            }
        });
    } else {
        // Fallback: Agar gallery array na ho toh mainImg dikhao
        const fallbackImg = product.mainImg || product.img || 'https://via.placeholder.com/400';
        mediaHTML += `<div class="slider-item"><img src="${fallbackImg}"></div>`;
        dotsHTML += `<div class="dot active"></div>`;
    }

    // 2. Video Slide (Agar video URL hai)
    if (product.video && product.video.trim() !== "") {
        mediaHTML += `
            <div class="slider-item">
                <video controls style="width:100%; height:100%; object-fit:contain; background:#000;">
                    <source src="${product.video}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>`;
        dotsHTML += `<div class="dot"></div>`;
    }

    slider.innerHTML = mediaHTML;
    dotsContainer.innerHTML = dotsHTML;

    // Dots indicator update logic
    slider.addEventListener('scroll', () => {
        const scrollIndex = Math.round(slider.scrollLeft / slider.clientWidth);
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === scrollIndex);
        });
    });
}

// Add to Cart Logic
function addToCart() {
    const allProducts = JSON.parse(localStorage.getItem('myProducts')) || [];
    const product = allProducts.find(p => p.id == productId);
    
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    
    // Check karein ki product pehle se cart mein toh nahi
    const exists = cart.find(item => item.id == product.id);
    if (exists) {
        alert("Ye product pehle se Bag mein hai! 😊");
    } else {
        cart.push(product);
        localStorage.setItem('myCart', JSON.stringify(cart));
        alert("Bag mein add ho gaya! ✅");
    }
}

function buyNow() {
    // WhatsApp Order link banayein
    const allProducts = JSON.parse(localStorage.getItem('myProducts')) || [];
    const product = allProducts.find(p => p.id == productId);
    if(product) {
        const text = `Hi, I want to buy: ${product.name} (ID: ${product.id}) for ₹${product.price}`;
        window.open(`https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(text)}`, '_blank');
    }
}

// Start the page
window.onload = initDetails;