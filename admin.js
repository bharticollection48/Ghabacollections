// --- 1. CONFIGURATION ---
// Apni Google Sheet ka naya Deployment URL yahan paste karein
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbwbEy3fbcW6WNJGnEQHGyCif4d-FSp5RMSywpVWGoRZeb0sQcuNB9B4g2V-sfp-TB-N/exec";
const IMGBB_API_KEY = "9e2c45e20b2a686c19d3c0cc9cf06f9b"; 

// --- 2. Security Check (Login) ---
window.onload = function() {
    let pass = prompt("Enter Admin Password:");
    if (pass === "admin123") {
        document.body.style.display = "block";
        displayAdminProducts();
    } else {
        alert("Access Denied!");
        window.location.href = "index.html";
    }
};

/**
 * --- 3. Smart Cloud Upload (ImgBB) ---
 * Is function ko HTML ke onchange="autoUrl(this, X)" se call kiya ja raha hai
 */
async function autoUrl(input, slot) {
    const file = input.files[0];
    if (!file) return;

    const previewImg = document.getElementById(`pre${slot}`);
    const urlInput = document.getElementById(`url${slot}`);
    const btnSpan = input.previousElementSibling; // Button text badalne ke liye

    if (btnSpan) btnSpan.innerText = "Wait...";
    if (previewImg) previewImg.style.opacity = "0.3";

    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            const onlineUrl = data.data.url;
            urlInput.value = onlineUrl;
            if (previewImg) {
                previewImg.src = onlineUrl;
                previewImg.style.opacity = "1";
            }
            if (btnSpan) btnSpan.innerText = "Done ✅";
        } else {
            alert("Upload Fail! Check ImgBB Key.");
            if (btnSpan) btnSpan.innerText = "Retry";
        }
    } catch (error) {
        console.error("ImgBB Error:", error);
        alert("Network Error! Photo upload nahi hui.");
    }
}

// --- 4. Save Product Logic ---
async function saveProduct() {
    console.log("Save function triggered!"); // Debugging ke liye

    // HTML IDs se data lena
    const name = document.getElementById('pName').value.trim();
    const price = document.getElementById('pPrice').value.trim();
    const category = document.getElementById('pCategory').value;
    const video = document.getElementById('pVideo').value.trim();

    // Gallery Array (url1 se url5 tak)
    const gallery = [
        document.getElementById('url1').value,
        document.getElementById('url2').value,
        document.getElementById('url3').value,
        document.getElementById('url4').value,
        document.getElementById('url5').value
    ].filter(url => url.trim() !== "");

    // Validation
    if (!name || !price || gallery.length === 0) {
        alert("Please fill Name, Price and at least 1 Image!");
        return;
    }

    const submitBtn = document.querySelector('.btn-upload');
    const originalText = submitBtn.innerText;
    
    // UI Loading State
    submitBtn.innerText = "PUBLISHING...";
    submitBtn.disabled = true;

    const newProduct = {
        id: Date.now(),
        name: name,
        price: price,
        category: category,
        mainImg: gallery[0],
        gallery: gallery, // Full array for slider
        video: video
    };

    try {
        // 1. Google Sheet mein bhejiyo
        await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });

        // 2. Local Storage update (Taaki turant niche dikhe)
        let products = JSON.parse(localStorage.getItem('myProducts')) || [];
        products.push(newProduct);
        localStorage.setItem('myProducts', JSON.stringify(products));

        alert("Product Published Successfully! ✅");
        
        // Reset form and UI
        resetAdminForm();
        displayAdminProducts();

    } catch (error) {
        console.error("Critical Error:", error);
        alert("Could not sync with Cloud. Product saved locally only.");
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
}

// --- 5. Supporting Functions ---

function resetAdminForm() {
    document.getElementById('pName').value = "";
    document.getElementById('pPrice').value = "";
    document.getElementById('pVideo').value = "";
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`url${i}`).value = "";
        const pre = document.getElementById(`pre${i}`);
        if (pre) pre.src = "";
    }
    // Buttons text reset
    const fileBtns = document.querySelectorAll('.btn-file');
    fileBtns.forEach(btn => btn.innerText = "Gallery");
}

function displayAdminProducts() {
    const list = document.getElementById('adminProductList');
    if (!list) return;
    
    let products = JSON.parse(localStorage.getItem('myProducts')) || [];
    
    // Naya product pehle dikhane ke liye reverse()
    list.innerHTML = products.slice().reverse().map(p => `
        <div class="p-card">
            <button class="delete-btn" onclick="deleteProduct(${p.id})">×</button>
            <img src="${p.mainImg}" onerror="this.src='https://via.placeholder.com/150';">
            <p style="font-size:12px; font-weight:bold; margin: 5px 0; color:#333;">${p.name}</p>
            <p style="color:#ff4757; font-weight:bold; margin: 0;">₹${p.price}</p>
        </div>
    `).join('');
}

function deleteProduct(id) {
    if (confirm("Delete this product from view?")) {
        let products = JSON.parse(localStorage.getItem('myProducts')) || [];
        products = products.filter(p => p.id !== id);
        localStorage.setItem('myProducts', JSON.stringify(products));
        displayAdminProducts();
    }
}

function logout() { 
    window.location.href = "index.html"; 
}