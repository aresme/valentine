// Admin Panel JavaScript - Valentine Edition
import { database, ref, set, onValue, remove, ipToKey } from './firebase-config.js';

// ImgBB Free Image Hosting API (FREE & UNLIMITED!)
// Get your free API key from: https://api.imgbb.com/
const IMGBB_API_KEY = 'fb613d8c38d06f67f4dc99e22531302d';

// Message Templates
const MESSAGE_TEMPLATES = {
    romantic: `Every moment with you feels like a beautiful dream I never want to wake up from.
You've painted my world with colors I never knew existed, and filled my heart with a love so deep, words fail to capture its true essence.

Thank you for being my sunshine on cloudy days, my comfort in times of need, and my partner in every adventure life brings. You are my everything.

This Valentine's Day and every day, I choose you. I love you more than yesterday, less than tomorrow, and with all that I am.`,

    playful: `Hey you! Yes, YOU! 💕

You know what I love about us? Everything! From your cute laugh to the way you steal my fries (I pretend to be mad, but I love it).

You're my favorite notification, my best adventure buddy, and the reason I smile at my phone like a weirdo.

Happy Valentine's Day to the most amazing person I know! Now come here and give me a hug! 🤗`,

    heartfelt: `My Dearest Love,

There are not enough words in any language to express how much you mean to me. You came into my life and made everything brighter, warmer, and more beautiful.

You've seen me at my best and my worst, and somehow, you chose to stay. Your love has taught me what it means to be truly happy.

I am so grateful for every moment we share, every laugh, every tear, every memory we create together. You are my heart's home.

With all my love, forever and always.`,

    poetic: `In the garden of my heart, you are the rarest rose,
Blooming with a beauty that only true love knows.
Each petal holds a memory, each thorn a lesson learned,
And in your tender embrace, a forever love I've earned.

The stars may fade at dawn, the moon may hide from sight,
But my love for you burns eternal, an everlasting light.
Through seasons changing, years passing by,
My heart whispers your name, in every lover's sigh.`,

    short: `You. Me. Forever.

Three words, one love, endless possibilities.

Happy Valentine's Day to my everything! 💕`
};

let selectedTheme = 'rose';
let uploadedPhotos = [];
let currentFilter = 'all';

// Initialize when authenticated
window.addEventListener('adminAuthenticated', init);

function init() {
    setupThemeSelector();
    setupPhotoUpload();
    setupFilterTabs();
    loadStats();
    loadLinks();
    loadVisitors();
}

// Theme Selector
function setupThemeSelector() {
    const buttons = document.querySelectorAll('.theme-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTheme = btn.dataset.theme;
        });
    });
}

// Apply Message Template
window.applyTemplate = function () {
    const select = document.getElementById('messageTemplate');
    const textarea = document.getElementById('clientMessage');
    if (select.value && MESSAGE_TEMPLATES[select.value]) {
        textarea.value = MESSAGE_TEMPLATES[select.value];
    }
};

// Photo Upload
function setupPhotoUpload() {
    const area = document.getElementById('photoUploadArea');
    const input = document.getElementById('photoInput');

    area.addEventListener('click', () => input.click());

    area.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.classList.add('dragover');
    });

    area.addEventListener('dragleave', () => {
        area.classList.remove('dragover');
    });

    area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    input.addEventListener('change', () => {
        handleFiles(input.files);
    });
}

function handleFiles(files) {
    const maxPhotos = 6;
    const remaining = maxPhotos - uploadedPhotos.length;

    if (remaining <= 0) {
        alert('Maximum 6 photos allowed!');
        return;
    }

    const filesToProcess = Array.from(files).slice(0, remaining);

    filesToProcess.forEach(file => {
        if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedPhotos.push({
                    file: file,
                    preview: e.target.result,
                    caption: ''
                });
                renderPhotoPreview();
            };
            reader.readAsDataURL(file);
        }
    });
}

function renderPhotoPreview() {
    const grid = document.getElementById('photoPreviewGrid');
    grid.innerHTML = uploadedPhotos.map((photo, index) => `
        <div class="photo-preview">
            <img src="${photo.preview}" alt="Photo ${index + 1}">
            <button class="remove-btn" onclick="removePhoto(${index})">×</button>
            <input type="text" placeholder="Caption..." value="${photo.caption}" 
                   onchange="updateCaption(${index}, this.value)">
        </div>
    `).join('');
}

window.removePhoto = function (index) {
    uploadedPhotos.splice(index, 1);
    renderPhotoPreview();
};

window.updateCaption = function (index, caption) {
    uploadedPhotos[index].caption = caption;
};

// Upload Photos to ImgBB (FREE unlimited hosting)
async function uploadPhotosToImgBB(linkId) {
    const uploaded = [];
    const progressEl = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    if (uploadedPhotos.length === 0) return uploaded;

    progressEl.style.display = 'block';

    for (let i = 0; i < uploadedPhotos.length; i++) {
        const photo = uploadedPhotos[i];

        progressText.textContent = `Uploading ${i + 1}/${uploadedPhotos.length}...`;
        progressFill.style.width = `${((i + 1) / uploadedPhotos.length) * 100}%`;

        try {
            // Convert file to base64
            const base64 = photo.preview.split(',')[1];

            // Upload to ImgBB
            const formData = new FormData();
            formData.append('key', IMGBB_API_KEY);
            formData.append('image', base64);
            formData.append('name', `valentine_${linkId}_${i}`);

            const response = await fetch('https://api.imgbb.com/1/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                uploaded.push({
                    url: result.data.display_url,
                    caption: photo.caption,
                    thumb: result.data.thumb.url,
                    deleteUrl: result.data.delete_url
                });
            } else {
                console.error('ImgBB upload failed:', result);
            }
        } catch (error) {
            console.error('Upload error:', error);
        }
    }

    progressEl.style.display = 'none';
    return uploaded;
}

// Parse Coupons
function parseCoupons() {
    const inputs = document.querySelectorAll('.coupon-input input');
    return Array.from(inputs).map((input, index) => {
        const value = input.value.trim();
        if (!value) return null;

        const parts = value.split(' - ');
        const titlePart = parts[0] || '';
        const desc = parts[1] || '';

        const iconMatch = titlePart.match(/^(\p{Emoji})/u);
        const icon = iconMatch ? iconMatch[1] : '💝';
        const title = titlePart.replace(/^\p{Emoji}\s*/u, '').trim();

        return { id: index, icon, title, description: desc, redeemed: false };
    }).filter(c => c !== null);
}

// Parse Love Reasons
function parseLoveReasons() {
    const text = document.getElementById('loveReasons').value;
    return text.split('\n').filter(line => line.trim()).map(line => line.trim());
}

// Create Custom Link
window.createCustomLink = async function () {
    const name = document.getElementById('clientName').value.trim();
    const sender = document.getElementById('senderName').value.trim() || 'Your Love';
    const message = document.getElementById('clientMessage').value.trim();
    const musicUrl = document.getElementById('customMusicUrl').value.trim();
    const startDate = document.getElementById('startDate').value;

    if (!name) {
        alert('Please enter recipient\'s name!');
        return;
    }

    const linkId = 'v_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    // Upload photos to ImgBB (FREE)
    const photos = await uploadPhotosToImgBB(linkId);

    // Parse coupons and reasons
    const coupons = parseCoupons();
    const loveReasons = parseLoveReasons();

    const linkData = {
        id: linkId,
        name: name,
        sender: sender,
        message: message,
        theme: selectedTheme,
        photos: photos,
        coupons: coupons,
        loveReasons: loveReasons,
        startDate: startDate,
        createdAt: new Date().toISOString(),
        visits: 0
    };

    // Custom Music
    if (musicUrl) {
        if (musicUrl.includes('spotify.com')) {
            // Convert standard Spotify link to embed link
            // e.g., https://open.spotify.com/track/123 -> https://open.spotify.com/embed/track/123
            let embedUrl = musicUrl;
            if (!musicUrl.includes('/embed/')) {
                embedUrl = musicUrl.replace('open.spotify.com/', 'open.spotify.com/embed/');
            }
            linkData.musicType = 'spotify';
            linkData.musicUrl = embedUrl;
        } else {
            // Default to YouTube
            linkData.musicType = 'youtube';
            linkData.musicUrl = musicUrl;
        }
    }

    try {
        await set(ref(database, `valentine_links/${linkId}`), linkData);

        const baseUrl = window.location.origin + window.location.pathname.replace('admin.html', 'index.html');
        const fullUrl = `${baseUrl}?msg=${linkId}`;

        document.getElementById('generatedLink').value = fullUrl;
        document.getElementById('generatedLinkContainer').style.display = 'block';

        // Add WhatsApp Share Button
        const whatsappMsg = `Happy Valentine's Day! 💝 I made something special for you: ${fullUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`;

        // Update or create share button
        let shareBtn = document.getElementById('whatsappShareBtn');
        if (!shareBtn) {
            shareBtn = document.createElement('a');
            shareBtn.id = 'whatsappShareBtn';
            shareBtn.className = 'share-btn whatsapp';
            shareBtn.target = '_blank';
            shareBtn.innerHTML = 'Share on WhatsApp 💚';
            document.querySelector('.link-box').after(shareBtn);
        }
        shareBtn.href = whatsappUrl;

        // Reset form
        uploadedPhotos = [];
        renderPhotoPreview();
        loadLinks();

    } catch (error) {
        console.error('Error creating link:', error);
        alert('Error creating link!');
    }
};

// Copy Link
window.copyLink = function () {
    const input = document.getElementById('generatedLink');
    input.select();
    document.execCommand('copy');

    const btn = input.nextElementSibling;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = originalText, 2000);
};

// Load Stats
function loadStats() {
    onValue(ref(database, 'valentine_visitors'), (snapshot) => {
        const visitors = snapshot.val() || {};
        const total = Object.keys(visitors).length;
        const blocked = Object.values(visitors).filter(v => v.blocked).length;

        document.getElementById('totalVisitors').textContent = total;
        document.getElementById('blockedCount').textContent = blocked;
    });

    onValue(ref(database, 'valentine_links'), (snapshot) => {
        const links = snapshot.val() || {};
        document.getElementById('totalLinks').textContent = Object.keys(links).length;
    });
}

// Load Links
function loadLinks() {
    const container = document.getElementById('linksList');

    onValue(ref(database, 'valentine_links'), (snapshot) => {
        const links = snapshot.val() || {};

        if (Object.keys(links).length === 0) {
            container.innerHTML = '<div class="loading">No links created yet</div>';
            return;
        }

        container.innerHTML = Object.values(links).reverse().map(link => `
            <div class="link-item">
                <div class="link-info">
                    <div class="link-name">💕 For: ${link.name}</div>
                    <div class="link-meta">From: ${link.sender} | Visits: ${link.visits || 0} | Created: ${new Date(link.createdAt).toLocaleDateString()}</div>
                </div>
                <div class="link-actions">
                    <button class="copy-btn" onclick="copyLinkUrl('${link.id}')">Copy Link</button>
                    <button class="delete-btn" onclick="deleteLink('${link.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    });
}

window.copyLinkUrl = function (linkId) {
    const baseUrl = window.location.origin + window.location.pathname.replace('admin.html', 'index.html');
    const fullUrl = `${baseUrl}?msg=${linkId}`;

    navigator.clipboard.writeText(fullUrl).then(() => {
        alert('Link copied!');
    });
};

window.deleteLink = async function (linkId) {
    if (confirm('Delete this Valentine link?')) {
        await remove(ref(database, `valentine_links/${linkId}`));
    }
};

window.refreshLinks = function () {
    loadLinks();
};

// Filter Tabs
function setupFilterTabs() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            loadVisitors();
        });
    });
}

// Load Visitors
function loadVisitors() {
    const container = document.getElementById('visitorsList');

    onValue(ref(database, 'valentine_visitors'), (snapshot) => {
        let visitors = Object.values(snapshot.val() || {});

        if (currentFilter === 'online') {
            visitors = visitors.filter(v => v.online);
        } else if (currentFilter === 'blocked') {
            visitors = visitors.filter(v => v.blocked);
        }

        if (visitors.length === 0) {
            container.innerHTML = '<div class="loading">No visitors found</div>';
            return;
        }

        container.innerHTML = visitors.reverse().map(visitor => `
            <div class="visitor-item">
                <div class="visitor-info">
                    <div class="visitor-name">
                        ${visitor.online ? '🟢' : '⚪'} ${visitor.ip || 'Unknown'}
                        ${visitor.blocked ? '🚫' : ''}
                    </div>
                    <div class="visitor-meta">
                        Visits: ${visitor.visitCount || 1} | 
                        Last: ${new Date(visitor.lastSeen).toLocaleString()}
                    </div>
                </div>
                <div class="visitor-actions">
                    ${visitor.blocked ?
                `<button class="unblock-btn" onclick="unblockVisitor('${visitor.id}', '${visitor.ip}')">Unblock</button>` :
                `<button class="block-btn" onclick="blockVisitor('${visitor.id}', '${visitor.ip}')">Block</button>`
            }
                </div>
            </div>
        `).join('');
    });
}

window.blockVisitor = async function (visitorId, ip) {
    await set(ref(database, `valentine_visitors/${visitorId}/blocked`), true);
    if (ip && ip !== 'Unknown') {
        await set(ref(database, `valentine_blocked_ips/${ipToKey(ip)}`), { blocked: true, blockedAt: new Date().toISOString() });
    }
};

window.unblockVisitor = async function (visitorId, ip) {
    await set(ref(database, `valentine_visitors/${visitorId}/blocked`), false);
    if (ip && ip !== 'Unknown') {
        await remove(ref(database, `valentine_blocked_ips/${ipToKey(ip)}`));
    }
};
