// common.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, onSnapshot, query, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase Configuration (Empty key, provided by environment)
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    apiKey: "",
    authDomain: "dummy.firebaseapp.com",
    projectId: "dummy-project"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const appId = typeof __app_id !== 'undefined' ? __app_id : 'my-quest';
export let currentUser = null;

// Helper: 疑似的なメールアドレスを作成 (ユーザーネームでのログイン要件を満たすため)
export const formatEmail = (username) => `${username}@myquest.dummy`;

// UI Elements Generation
export function initCommonUI(currentPage) {
    createHeader(currentPage);
    createSideMenu();
    if (currentPage !== 'login') {
        createBottomNav(currentPage);
        setupCoinListener();
    }
    createFooter();
}

function createHeader(currentPage) {
    const header = document.createElement('header');
    header.className = 'bg-orange-600 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-50 border-b-4 border-orange-800';
    
    let leftContent = '';
    if (currentPage !== 'login') {
        leftContent = `
            <div class="flex items-center bg-orange-800 rounded-full px-3 py-1 border-2 border-orange-900">
                <svg class="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                <span id="header-coin-count" class="font-bold">--</span>
            </div>
        `;
    } else {
        leftContent = `<div></div>`;
    }

    header.innerHTML = `
        ${leftContent}
        <h1 class="text-xl font-black tracking-wider cursor-pointer" id="header-title">My Quest</h1>
        <button id="hamburger-btn" class="p-2 focus:outline-none">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </button>
    `;
    document.body.prepend(header);

    document.getElementById('header-title').addEventListener('click', () => {
        if (currentUser) window.location.href = 'quest.html';
    });

    document.getElementById('hamburger-btn').addEventListener('click', toggleSideMenu);
}

function createSideMenu() {
    const menuHtml = `
        <div id="sideMenu">
            <a href="guide.html" target="_blank">使い方ガイド</a>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSdlvIr5ehyy3dInl_XTkA5F64H7yFIigL2dzFW0IoXnl8ajdw/viewform" target="_blank">お問い合わせ</a>
            <a href="release-notes.html" target="_blank" style="border-bottom: 1px solid #D97706; padding-bottom: 16px;">リリースノート</a>
            
            <div style="margin-top: 16px;">
                <a href="https://qcda-dev.github.io/HP/" target="_blank">QcDa Projectとは</a>
                <div style="padding-left: 16px; margin-top: 8px;">
                    <a href="https://qcda-dev.github.io/HP/terms-of-service.html" target="_blank" style="font-size: 14px; color: #78350F; font-weight: normal; padding: 6px 15px;">利用規約</a>
                    <a href="https://qcda-dev.github.io/HP/community-guidelines.html" target="_blank" style="font-size: 14px; color: #78350F; font-weight: normal; padding: 6px 15px;">コミュニティガイドライン</a>
                </div>
            </div>
            
            <div style="position: absolute; bottom: 20px; left: 32px; font-size: 12px; color: #9A3412;">ver 1.0.0</div>
        </div>
        <div id="menuOverlay"></div>
    `;
    document.body.insertAdjacentHTML('beforeend', menuHtml);
    document.getElementById('menuOverlay').addEventListener('click', toggleSideMenu);
}

function toggleSideMenu() {
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    if (sideMenu.style.width === '250px') {
        sideMenu.style.width = '0';
        overlay.style.display = 'none';
    } else {
        sideMenu.style.width = '250px';
        overlay.style.display = 'block';
    }
}

function createBottomNav(currentPage) {
    const navItems = [
        { id: 'quest', name: 'クエスト', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>', link: 'quest.html' },
        { id: 'exchange', name: '交換', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>', link: 'exchange.html' },
        { id: 'use', name: '使用', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>', link: 'use.html' },
        { id: 'settings', name: '設定', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>', link: 'settings.html' }
    ];

    let navHtml = '<nav id="bottomNav">';
    navItems.forEach(item => {
        const isActive = currentPage === item.id || (currentPage.startsWith('settings') && item.id === 'settings');
        navHtml += `
            <a href="${item.link}" class="nav-item ${isActive ? 'active' : ''}">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">${item.icon}</svg>
                <span>${item.name}</span>
            </a>
        `;
    });
    navHtml += '</nav>';
    document.body.insertAdjacentHTML('beforeend', navHtml);
}

function createFooter() {
    const footer = document.createElement('footer');
    footer.innerHTML = `
        <p>&copy; 2025 QcDa Project. All Rights Reserved.</p>
        <div class="mt-2 space-x-4">
            <a href="https://qcda-dev.github.io/HP/terms-of-service.html" target="_blank" class="underline">利用規約</a>
            <a href="https://qcda-dev.github.io/HP/community-guidelines.html" target="_blank" class="underline">コミュニティガイドライン</a>
        </div>
    `;
    document.body.appendChild(footer);
}

// ユーザー初期化・コイン監視
export function setupAuthGuard(callback) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            // ユーザープロファイルの初期化確認
            const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
            const profileSnap = await getDoc(profileRef);
            if (!profileSnap.exists()) {
                await setDoc(profileRef, { coins: 0, weekStart: 'monday' });
            }
            if (callback) callback(user);
        } else {
            currentUser = null;
            if (!window.location.pathname.endsWith('index.html')) {
                window.location.href = 'index.html';
            }
        }
    });
}

function setupCoinListener() {
    if (!currentUser) return;
    const profileRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'info');
    onSnapshot(profileRef, (doc) => {
        if (doc.exists()) {
            const coinEl = document.getElementById('header-coin-count');
            if(coinEl) coinEl.textContent = doc.data().coins || 0;
        }
    }, (error) => console.error("Coin listener error:", error));
}

// ポップアップ表示
export function showPopup(message, showCloseBtn = true, extraButtonsHtml = '') {
    const popupId = 'custom-popup-' + Date.now();
    const popupHtml = `
        <div id="${popupId}" class="popup-overlay fade-in">
            <div class="popup-content">
                <p class="text-lg font-bold mb-6">${message}</p>
                <div class="flex justify-center space-x-4">
                    ${showCloseBtn ? `<button class="rpg-button px-6 py-2" onclick="document.getElementById('${popupId}').remove()">閉じる</button>` : ''}
                    ${extraButtonsHtml}
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHtml);
    return popupId;
}

// 日付リセット判定ロジック
export function isCompleted(lastCompletedAt, type, weekStart) {
    if (!lastCompletedAt) return false;
    const lastDate = lastCompletedAt.toDate();
    const now = new Date();

    if (type === 'daily' || ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].includes(type)) {
        return lastDate.toDateString() === now.toDateString();
    } else if (type === 'weekly') {
        return isSameWeek(lastDate, now, weekStart);
    } else if (type === 'monthly') {
        return lastDate.getFullYear() === now.getFullYear() && lastDate.getMonth() === now.getMonth();
    }
    return false;
}

function isSameWeek(date1, date2, weekStart) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0,0,0,0);
    d2.setHours(0,0,0,0);
    
    // 週の開始日（0: 日曜, 1: 月曜）
    const startOffset = weekStart === 'monday' ? 1 : 0;
    
    // d1の週の開始日を計算
    const day1 = d1.getDay();
    const diff1 = (day1 < startOffset ? 7 : 0) + day1 - startOffset;
    d1.setDate(d1.getDate() - diff1);
    
    // d2の週の開始日を計算
    const day2 = d2.getDay();
    const diff2 = (day2 < startOffset ? 7 : 0) + day2 - startOffset;
    d2.setDate(d2.getDate() - diff2);

    return d1.getTime() === d2.getTime();
}

export function getCurrentDayString() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
}

// コイン更新関数
export async function updateCoins(amount) {
    if(!currentUser) return;
    const profileRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'info');
    const snap = await getDoc(profileRef);
    if(snap.exists()){
        const currentCoins = snap.data().coins || 0;
        await updateDoc(profileRef, { coins: currentCoins + amount });
    }
}
