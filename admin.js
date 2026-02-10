// --- 1. CONFIGURATION ---
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbwbKvBicNZ6CuemvLGjFIXzsRws_K2oFlbXnzGMWyrOzLyRXlkW46rwarQRyRbV8G9x/exec";
const IMGBB_API_KEY = "YOUR_IMGBB_API_KEY_HERE"; // Yahan apni ImgBB API Key dalein (Free milti hai imgbb.com par)

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
 * --- 3. Smart Cloud Upload (ImgBB) ---
 * Ye function photo ko online upload karke uska link input box mein bhar dega
 */
async function autoUrl(input, slot) {
    const file = input.files[0];
    if (!file) return;

    // Loading dikhane ke liye
    const previewImg = document.getElementById(`pre${slot}`);
    if (previewImg) previewImg.style.opacity = "0.5";
    
    const formData = new FormData();
    formData.append("image", file);

    try {
        // ImgBB par upload kar rahe hain
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            const onlineUrl = data.data.url;
            document.getElementById(`url${slot}`).value = onlineUrl;
            if (previewImg) {
                previewImg.src = onlineUrl;
                previewImg.style.opacity = "1";
            }
            console.log("Cloud Link Generated: " + onlineUrl);
        } else {
            alert("Upload fail ho gaya!");
        }
    } catch (error) {
        console.error("ImgBB Error:", error);
        alert("Internet check karein ya API Key check karein.");
    }
}

// --- 4. Save Product Logic ---
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
        alert("Name, Price aur Main Photo zaroori hai!");
        return;
    }

    const submitBtn = document.querySelector('.btn-upload');
    submitBtn.innerText = "PUBLISHING TO CLOUD...";
    submitBtn.disabled = true;

    const newProduct = {
        id: Date.now(),
        name: name,
        price: price,
        category: category,
        video: video,
        mainImg: url1,
        gallery: [url1, url2, url3, url4, url5].filter(u => u !== "")
    };

    try {
        // Google Sheet mein bhejein
        const response = await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });

        // Local Storage update (Sync ke liye)
        let products = JSON.parse(localStorage.getItem('myProducts')) || [];
        products.push(newProduct);
        localStorage.setItem('myProducts', JSON.stringify(products));

        alert("Product Globaly Publish ho gaya!");
        resetAdminForm();
        displayAdminProducts();
        
    } catch (error) {
        console.error("Sheet Error!", error);
        alert("Sheet connection mein dikkat hai!");
    } finally {
        submitBtn.innerText = "PUBLISH PRODUCT";
        submitBtn.disabled = false;
    }
}

// --- 5. Supporting Functions ---
function resetAdminForm() {
    document.getElementById('adminForm').reset(); // Form clear
    for (let i = 1; i <= 5; i++) {
        const pre = document.getElementById(`pre${i}`);
        if (pre) pre.src = "";
    }
}

function displayAdminProducts() {
    const list = document.getElementById('adminProductList');
    if (!list) return;
    
    // Cloud se sync karne ke liye refreshData wala logic index page jaisa hona chahiye
    // Filhal local dikha rahe hain
    let products = JSON.parse(localStorage.getItem('myProducts')) || [];
    list.innerHTML = products.reverse().map(p => `
        <div class="p-card">
            <button class="delete-btn" onclick="deleteProduct(${p.id})">×</button>
            <img src="${p.mainImg}" onerror="this.src='https://via.placeholder.com/150';">
            <p style="font-size:12px; font-weight:bold; margin: 5px 0;">${p.name}</p>
            <p style="color:#ff4757; font-weight:bold; margin: 0;">₹${p.price}</p>
        </div>
    `).join('');
}

function deleteProduct(id) {
    if (confirm("Kya aap is product ko delete karna chahte hain? (Note: Sheet se manually delete karna hoga)")) {
        let products = JSON.parse(localStorage.getItem('myProducts')) || [];
        products = products.filter(p => p.id !== id);
        localStorage.setItem('myProducts', JSON.stringify(products));
        displayAdminProducts();
    }
}

function logout() { window.location.href = "index.html"; }