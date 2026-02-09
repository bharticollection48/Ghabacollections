// 1. URL se ID nikalna
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// 2. LocalStorage se Product dhoondna
const allProducts = JSON.parse(localStorage.getItem('myProducts')) || [];
const product = allProducts.find(p => p.id == productId);

if (product) {
    // Basic Details
    document.getElementById('detName').innerText = product.name;
    document.getElementById('detPrice').innerText = product.price;
    document.getElementById('detCat').innerText = product.category || "General";

    // Media (Images + Video) Combine karna
    const slider = document.getElementById('mediaSlider');
    const dotsContainer = document.getElementById('sliderDots');
    
    // Gallery ki saari photos
    let mediaHTML = '';
    let dotsHTML = '';

    // 1. Pehle saari Images load karein
    if (product.gallery && product.gallery.length > 0) {
        product.gallery.forEach((img, index) => {
            mediaHTML += `
                <div class="slider-item">
                    <img src="${img}" onerror="this.src='https://via.placeholder.com/400?text=Image+Not+Found'">
                </div>`;
            dotsHTML += `<div class="dot ${index === 0 ? 'active' : ''}"></div>`;
        });
    } else {
        // Agar gallery nahi hai toh mainImg dikhao
        mediaHTML += `<div class="slider-item"><img src="${product.mainImg || product.img}"></div>`;
        dotsHTML += `<div class="dot active"></div>`;
    }

    // 2. Agar Video URL hai toh use bhi slide mein add karein
    if (product.video) {
        mediaHTML += `
            <div class="slider-item">
                <video controls style="width:100%; height:100%;">
                    <source src="${product.video}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>`;
        dotsHTML += `<div class="dot"></div>`;
    }

    slider.innerHTML = mediaHTML;
    dotsContainer.innerHTML = dotsHTML;

    // Dots ko scroll ke saath move karne ka logic
    slider.addEventListener('scroll', () => {
        const scrollIndex = Math.round(slider.scrollLeft / slider.clientWidth);
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === scrollIndex);
        });
    });

} else {
    document.body.innerHTML = "<h2 style='text-align:center; margin-top:50px;'>Product Not Found!</h2>";
}

// Add to Cart Simple Logic
function addToCart() {
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    cart.push(product);
    localStorage.setItem('myCart', JSON.stringify(cart));
    alert("Bag mein add ho gaya! ✅");
}

function buyNow() {
    alert("Redirecting to payment...");
}