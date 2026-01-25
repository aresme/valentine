// Firebase Configuration for Valentine's Website
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, onValue, remove, get, child } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Firebase configuration - New Valentine Love Portal project
const firebaseConfig = {
    apiKey: "AIzaSyAipOKhWptWm0NHUoVYsOt7k1gatg-M54s",
    authDomain: "valentine-love-portal.firebaseapp.com",
    databaseURL: "https://valentine-love-portal-default-rtdb.firebaseio.com",
    projectId: "valentine-love-portal",
    storageBucket: "valentine-love-portal.firebasestorage.app",
    messagingSenderId: "320349948231",
    appId: "1:320349948231:web:cd134cd634716e51446462"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let visitorIP = null;

// Fetch visitor's IP
async function fetchVisitorIP() {
    if (visitorIP) return visitorIP;

    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        visitorIP = data.ip;
        return visitorIP;
    } catch (error) {
        console.error('Error fetching IP:', error);
        return null;
    }
}

// Generate visitor ID
function getVisitorId() {
    let visitorId = localStorage.getItem('valentine_visitor_id');
    if (!visitorId) {
        visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('valentine_visitor_id', visitorId);
    }
    return visitorId;
}

// Get visitor info
function getVisitorInfo() {
    return {
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer || 'Direct',
        currentPage: window.location.pathname
    };
}

// Register visitor
export async function registerVisitor() {
    const visitorId = getVisitorId();
    const visitorRef = ref(database, `valentine_visitors/${visitorId}`);
    const ip = await fetchVisitorIP();

    const visitorData = {
        id: visitorId,
        ip: ip || 'Unknown',
        firstVisit: localStorage.getItem('valentine_first_visit') || new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        visitCount: parseInt(localStorage.getItem('valentine_visit_count') || '0') + 1,
        info: getVisitorInfo(),
        blocked: false
    };

    if (!localStorage.getItem('valentine_first_visit')) {
        localStorage.setItem('valentine_first_visit', visitorData.firstVisit);
    }
    localStorage.setItem('valentine_visit_count', visitorData.visitCount.toString());

    try {
        await set(visitorRef, visitorData);
        await set(ref(database, `valentine_visitors/${visitorId}/online`), true);
        startHeartbeat(visitorId);
        return visitorId;
    } catch (error) {
        console.error('Error registering visitor:', error);
        return null;
    }
}

// Heartbeat
function startHeartbeat(visitorId) {
    setInterval(async () => {
        try {
            await set(ref(database, `valentine_visitors/${visitorId}/lastSeen`), new Date().toISOString());
            await set(ref(database, `valentine_visitors/${visitorId}/online`), true);
        } catch (error) {
            console.error('Heartbeat error:', error);
        }
    }, 30000);
}

// Convert IP to safe key
function ipToKey(ip) {
    return ip.replace(/\./g, '_');
}

// Check if blocked
export async function checkBlocked(callback) {
    const visitorId = getVisitorId();
    const ip = await fetchVisitorIP();

    if (ip) {
        const blockedIPRef = ref(database, `valentine_blocked_ips/${ipToKey(ip)}`);
        onValue(blockedIPRef, (snapshot) => {
            if (snapshot.exists() && snapshot.val().blocked === true) {
                callback(true);
                return;
            }
            const blockedRef = ref(database, `valentine_visitors/${visitorId}/blocked`);
            onValue(blockedRef, (visitorSnapshot) => {
                callback(visitorSnapshot.val() === true);
            }, { onlyOnce: true });
        });
    } else {
        const blockedRef = ref(database, `valentine_visitors/${visitorId}/blocked`);
        onValue(blockedRef, (snapshot) => {
            callback(snapshot.val() === true);
        });
    }
}

// Get custom link data
export async function getCustomLink(linkId) {
    if (!linkId) return null;
    try {
        const snapshot = await get(child(ref(database), `valentine_links/${linkId}`));
        if (snapshot.exists()) {
            const visitsRef = ref(database, `valentine_links/${linkId}/visits`);
            const currentVisits = snapshot.val().visits || 0;
            set(visitsRef, currentVisits + 1);
            return snapshot.val();
        }
        return null;
    } catch (error) {
        console.error('Error fetching custom link:', error);
        return null;
    }
}

// Export for admin use
export { database, ref, set, onValue, remove, ipToKey };
