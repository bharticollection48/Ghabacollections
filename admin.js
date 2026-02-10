// --- 1. CONFIGURATION ---
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbwkEy3fbcW6WNJGnEQHGyCif4d-FSp5RMSywpVWGoRZeb0sQcuNB9B4g2V-sfp-TB-N/exec";
const IMGBB_API_KEY = "YOUR_IMGBB_API_KEY_HERE"; // <--- Yahan apni ImgBB API Key dalein

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
 * --- 3. Cloud Upload Function (ImgBB) ---
 * Photo select karte hi online link banayega
 */
async function autoUrl(input, slot) {
    const file = input.files[0];
    if (!file) return;

    const previewImg = document.getElementById(`pre${slot}`);
    const urlInput = document.getElementById(`url${slot}`);
    const btnSpan = document.getElementById(`btn${slot}`);

    // Loading State
    if (previewImg) previewImg.style.opacity = "0.3";
    if (btnSpan) btnSpan.innerText = "Wait...";

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
            urlInput.value = onlineUrl; // Link box mein aa jayega
            if (previewImg) {
                previewImg.src = onlineUrl;
                previewImg.style.opacity = "1";
            }
            if (btnSpan) btnSpan.innerText = "Done ✅";
        } else {
            alert("Upload Fail! API Key check karein.");
        }
    } catch (error) {
        console.error("ImgBB Error:", error);
        alert("Internet issue ya API Error.");
    }
}

// --- 4. Save Product Logic (Sheet + Local) ---
async function saveProduct() {
    const name = document.getElementById('pName').value.trim();
    const price = document.getElementById('pPrice').value.trim();
    const category = document.getElementById('pCategory').value;
    const video = document.getElementById('pVideo').value.trim();

    // Saare 5 photo URLs ka array banana
    const gallery = [
        document.getElementById('url1').value,
        document.getElementById('url2').value,
        document.getElementById('url3').value,
        document.getElementById('url4').value,
        document.getElementById('url5').value
    ].filter(url => url.trim() !== "");

    // Validation
    if (!name || !price || gallery.length === 0) {
        alert("Kripya Name, Price aur kam se kam 1 Photo zaroori bharein!");
        return;
    }

    const submitBtn = document.getElementById('publishBtn');
    submitBtn.innerText = "PUBLISHING TO CLOUD...";
    submitBtn.disabled = true;

    const newProduct = {
        id: Date.now(),
        name: name,
        price: price,
        category: category,
        mainImg: gallery[0], // Pehli photo main image hogi
        gallery: gallery,    // Poora array
        video: video
    };

    try {
        // 1. Google Sheet mein bhejein
        await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });

        // 2. Local Storage mein backup (Turant dikhane ke liye)
        let products = JSON.parse(localStorage.getItem('myProducts')) || [];
        products.push(newProduct);
        localStorage.setItem('myProducts', JSON.stringify(products));

        alert("Product Successfully Published! ✅");
        resetAdminForm();
        displayAdminProducts();

    } catch (error) {
        console.error("Sheet Error!", error);
        alert("Cloud sync mein error, par Local mein save ho gaya.");
    } finally {
        submitBtn.innerText = "PUBLISH PRODUCT";
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
        const btn = document.getElementById(`btn${i}`);
        if (pre) pre.src = "https://via.placeholder.com/40";
        if (btn) btn.innerText = "Gallery";
    }
}

function displayAdminProducts() {
    const list = document.getElementById('adminProductList');
    if (!list) return;
    
    let products = JSON.parse(localStorage.getItem('myProducts')) || [];
    list.innerHTML = products.reverse().map(p => `
        <div class="p-card">
            <button class="delete-btn" onclick="deleteProduct(${p.id})">×</button>
            <img src="${p.mainImg}" onerror="this.src='https://via.placeholder.com/150';">
            <p style="font-size:12px; font-weight:bold; margin: 5px 0; color:#333;">${p.name}</p>
            <p style="color:#ff4757; font-weight:bold; margin: 0;">₹${p.price}</p>
        </div>
    `).join('');
}

function deleteProduct(id) {
    if (confirm("Delete karein? (Ye sirf aapki screen se hatega, Sheet se manually hatana hoga)")) {
        let products = JSON.parse(localStorage.getItem('myProducts')) || [];
        products = products.filter(p => p.id !== id);
        localStorage.setItem('myProducts', JSON.stringify(products));
        displayAdminProducts();
    }
}

function logout() { 
    window.location.href = "index.html"; 
}