// --- 1. CONFIGURATION (Apna URL yahan dalein) ---
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxUS-o9xhW2Cy--1HA7PEEAk_2Z6UGEzp4zMiEOBAqG_p3Wa3OM4jxoMhXDJtd4sJcw/exec";

// --- 2. Security Check ---
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
 * --- 3. Smart Auto-URL Function ---
 * Base64 generate karta hai (Chhoti images ke liye theek hai)
 */
function autoUrl(input, slot) {
    const file = input.files[0];
    if (file) {
        // Google Sheet ki limit ke wajah se 50KB-100KB se badi image Base64 mein issue karegi
        if (file.size > 100 * 1024) { 
            alert("File size bahut badi hai! Please 100KB se kam ki photo use karein ya ImgBB use karein.");
            input.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const generatedUrl = e.target.result;
            document.getElementById(`url${slot}`).value = generatedUrl;
            const previewImg = document.getElementById(`pre${slot}`);
            if (previewImg) previewImg.src = generatedUrl;
        };
        reader.readAsDataURL(file);
    }
}

// --- 4. Save Product Logic (GOOGLE SHEETS UPDATED) ---
async function saveProduct() {
    const name = document.getElementById('pName').value.trim();
    const price = document.getElementById('pPrice').value.trim();
    const category = document.getElementById('pCategory').value;
    const video = document.getElementById('pVideo').value.trim();

    // Collect URLs
    const url1 = document.getElementById('url1').value;
    const url2 = document.getElementById('url2').value;
    const url3 = document.getElementById('url3').value;
    const url4 = document.getElementById('url4').value;
    const url5 = document.getElementById('url5').value;

    if (!name || !price || !url1) {
        alert("Name, Price aur kam se kam Main Photo zaroori hai!");
        return;
    }

    const submitBtn = document.querySelector('.btn-upload');
    submitBtn.innerText = "UPLOADING...";
    submitBtn.disabled = true;

    // 1. Local Storage mein save karein (Offline backup ke liye)
    let products = JSON.parse(localStorage.getItem('myProducts')) || [];
    const newProduct = {
        id: Date.now(),
        name, price, category, video,
        mainImg: url1,
        gallery: [url1, url2, url3, url4, url5].filter(u => u !== "")
    };
    products.push(newProduct);
    localStorage.setItem('myProducts', JSON.stringify(products));

    // 2. Google Sheet mein bhejein
    try {
        await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors', // Important for Google Apps Script
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });

        alert("Product Sheet mein save ho gaya!");
        resetAdminForm();
        displayAdminProducts();
    } catch (error) {
        console.error("Error!", error);
        alert("Sheet mein save nahi ho paya, par Local mein save hai.");
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
        if (pre) pre.src = "";
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
            <p style="font-size:12px; font-weight:bold; margin: 5px 0;">${p.name}</p>
            <p style="color:#9c27b0; font-weight:bold; margin: 0;">₹${p.price}</p>
        </div>
    `).join('');
}

function deleteProduct(id) {
    if (confirm("Delete karein?")) {
        let products = JSON.parse(localStorage.getItem('myProducts')) || [];
        products = products.filter(p => p.id !== id);
        localStorage.setItem('myProducts', JSON.stringify(products));
        displayAdminProducts();
    }
}

function logout() { window.location.href = "index.html"; }