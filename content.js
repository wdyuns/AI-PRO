let searchTerm = "";
let isLocked = false; 
let isSidebarVisible = true;
let config = { fontSize: 14, fontColor: "#334155", bgColor: "#ffffff" }; 
let itemsData = []; 

const ICONS = {
    pin: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    pinned: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    settings: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
    close: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    clear: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
};

function saveAllStates(el) {
    const state = {
        pos: { top: el.style.top, left: el.style.left, width: el.style.width, height: el.style.height },
        settings: config,
        isVisible: isSidebarVisible
    };
    localStorage.setItem('timeline_pro_data', JSON.stringify(state));
}

function loadAllStates(el) {
    const saved = localStorage.getItem('timeline_pro_data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.pos) { Object.assign(el.style, data.pos); el.style.right = "auto"; }
            if (data.settings) config = data.settings;
            if (data.isVisible !== undefined) isSidebarVisible = data.isVisible;
        } catch (e) { console.error("读取存档失败", e); }
    }
}

function toggleSidebar(show) {
    const sidebar = document.getElementById('timeline-sidebar');
    const restoreBtn = document.getElementById('timeline-restore-btn');
    if (!sidebar || !restoreBtn) return;
    isSidebarVisible = show;
    if (show) {
        sidebar.classList.remove('is-hidden');
        restoreBtn.classList.remove('is-visible');
    } else {
        sidebar.classList.add('is-hidden');
        restoreBtn.classList.add('is-visible');
    }
    saveAllStates(sidebar);
}

function initOrUpdate() {
    let sidebar = document.getElementById('timeline-sidebar');
    let restoreBtn = document.getElementById('timeline-restore-btn');

    if (!restoreBtn) {
        restoreBtn = document.createElement('div');
        restoreBtn.id = 'timeline-restore-btn';
        restoreBtn.title = "重新打开导航面板";
        restoreBtn.innerHTML = '<span>对话索引</span>';
        document.body.appendChild(restoreBtn);
        restoreBtn.onclick = () => toggleSidebar(true);
    }

    if (!sidebar) {
        sidebar = document.createElement('div');
        sidebar.id = 'timeline-sidebar';
        document.body.appendChild(sidebar);
        
        const handles = ['n','s','e','w','nw','ne','sw','se'];
        const handlesHtml = handles.map(h => `<div class="resize-handle rs-${h}" data-handle="${h}"></div>`).join('');

        sidebar.innerHTML = `
            ${handlesHtml}
            <div class="timeline-header" id="timeline-drag-handle">
                <span>对话导航索引</span>
                <div class="header-controls">
                    <button id="lock-btn" class="icon-btn-modern" title="锁定/解锁（锁定后不可拖拽及缩放）">${ICONS.pin}</button>
                    <button id="settings-btn" class="icon-btn-modern" title="显示/隐藏设置">${ICONS.settings}</button>
                    <button id="close-btn" class="icon-btn-modern close-x" title="隐藏面板">${ICONS.close}</button>
                </div>
            </div>
            <div id="settings-panel" style="display:none">
                <div class="setting-title">界面参数</div>
                <div class="setting-row">
                    <span>显示字号 (px)</span>
                    <div class="modern-stepper">
                        <button class="stepper-btn" id="font-minus" title="缩小字号">−</button>
                        <input type="number" id="set-font-size" value="${config.fontSize}" readonly>
                        <button class="stepper-btn" id="font-plus" title="增大字号">+</button>
                    </div>
                </div>
                <div class="setting-row"><span>字体颜色</span><input type="color" id="set-font-color" value="${config.fontColor}" title="选择列表字体颜色"></div>
                <div class="setting-row"><span>背景颜色</span><input type="color" id="set-bg-color" value="${config.bgColor}" title="选择列表背景颜色"></div>
                <button id="reset-all-btn" class="reset-btn" title="清空缓存，重置所有样式与位置">恢复默认设置</button>
            </div>
            <div class="search-wrapper" id="search-container">
                <div class="search-inner">
                    <input type="text" id="timeline-search-input" placeholder="关键词检索..." title="输入关键词实时过滤对话" value="${searchTerm}">
                    <div id="search-clear" class="search-clear-btn" title="清除搜索内容">${ICONS.clear}</div>
                </div>
            </div>
            <div id="timeline-list"></div>
        `;

        loadAllStates(sidebar);
        setupEventListeners(sidebar);
        makeDraggable(sidebar, sidebar.querySelector('#timeline-drag-handle'));
        makeResizable(sidebar);
        toggleSidebar(isSidebarVisible);
    }
    renderList();
}

function setupEventListeners(sidebar) {
    sidebar.querySelector('#close-btn').onclick = () => toggleSidebar(false);
    sidebar.querySelector('#lock-btn').onclick = (e) => {
        isLocked = !isLocked;
        e.currentTarget.innerHTML = isLocked ? ICONS.pinned : ICONS.pin;
        e.currentTarget.classList.toggle('is-active', isLocked);
    };

    sidebar.querySelector('#settings-btn').onclick = (e) => {
        const panel = sidebar.querySelector('#settings-panel');
        const searchBar = sidebar.querySelector('#search-container');
        const isOpening = panel.style.display !== 'block';
        panel.style.display = isOpening ? 'block' : 'none';
        searchBar.style.display = isOpening ? 'none' : 'block';
        e.currentTarget.classList.toggle('is-active', isOpening);
    };

    sidebar.querySelector('#reset-all-btn').onclick = () => { localStorage.removeItem('timeline_pro_data'); location.reload(); };
    
    const sizeInput = sidebar.querySelector('#set-font-size');
    sidebar.querySelector('#font-plus').onclick = () => { config.fontSize = Math.min(40, parseInt(config.fontSize) + 1); sizeInput.value = config.fontSize; saveAllStates(sidebar); renderList(); };
    sidebar.querySelector('#font-minus').onclick = () => { config.fontSize = Math.max(8, parseInt(config.fontSize) - 1); sizeInput.value = config.fontSize; saveAllStates(sidebar); renderList(); };

    const update = (id, key) => { sidebar.querySelector(id).oninput = (e) => { config[key] = e.target.value; saveAllStates(sidebar); renderList(); }; };
    update('#set-font-color', 'fontColor');
    update('#set-bg-color', 'bgColor');

    const searchInput = sidebar.querySelector('#timeline-search-input');
    const clearBtn = sidebar.querySelector('#search-clear');
    searchInput.oninput = (e) => { searchTerm = e.target.value; clearBtn.style.display = searchTerm ? 'flex' : 'none'; renderList(); };
    clearBtn.onclick = () => { searchTerm = ""; searchInput.value = ""; clearBtn.style.display = 'none'; renderList(); searchInput.focus(); };
}

function renderList() {
    const isGemini = window.location.host.includes('gemini');
    const listContainer = document.getElementById('timeline-list');
    if (!listContainer) return;

    const domQueries = isGemini 
        ? document.querySelectorAll('.query-text, .user-query-content, [data-test-id="user-query"]') 
        : document.querySelectorAll('[data-message-author-role="user"]');
    
    itemsData = [];
    let html = "";
    
    // 动态计算序号大小：比正文小 4px，最小不低于 10px
    const indexFontSize = Math.max(10, config.fontSize - 4);
    const indexBoxSize = Math.max(22, config.fontSize + 6);

    domQueries.forEach((el, index) => {
        const text = el.innerText.trim();
        if (text.length < 2 || (searchTerm && !text.toLowerCase().includes(searchTerm.toLowerCase()))) return;
        itemsData.push({ text, element: el });
        let displayChat = text.replace(/\n/g, ' '); 
        if (displayChat.length > 30) displayChat = displayChat.substring(0, 28) + "...";
        
        // 修改点：序号(item-index)的宽高和字号随 config.fontSize 动态变化
        html += `
            <div class="timeline-item" title="${text}" style="font-size:${config.fontSize}px; color:${config.fontColor}; background-color:${config.bgColor};">
                <span class="item-index" style="font-size:${indexFontSize}px; width:${indexBoxSize}px; height:${indexBoxSize}px;">${index + 1}</span>
                <span class="item-content">${displayChat}</span>
            </div>`;
    });
    listContainer.innerHTML = html || `<div style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;font-style:italic;">未发现匹配内容</div>`;
    listContainer.querySelectorAll('.timeline-item').forEach((itemNode, idx) => {
        itemNode.onclick = () => {
            const target = itemsData[idx].element;
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                target.animate([{ boxShadow: '0 0 0 0 rgba(51, 65, 85, 0)' }, { boxShadow: '0 0 0 6px rgba(51, 65, 85, 0.2)' }, { boxShadow: '0 0 0 0 rgba(51, 65, 85, 0)' }], { duration: 1000 });
            }
        };
    });
}

function makeDraggable(el, handle) {
    handle.onmousedown = (e) => {
        if (isLocked || e.target.closest('.icon-btn-modern')) return;
        let px = e.clientX, py = e.clientY;
        const move = (me) => { el.style.top = (el.offsetTop + (me.clientY - py)) + "px"; el.style.left = (el.offsetLeft + (me.clientX - px)) + "px"; el.style.right = "auto"; px = me.clientX; py = me.clientY; };
        const up = () => { saveAllStates(el); document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
        document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    };
}

function makeResizable(el) {
    const handles = el.querySelectorAll('.resize-handle');
    handles.forEach(h => {
        h.onmousedown = (e) => {
            if (isLocked) return;
            e.preventDefault();
            const type = h.dataset.handle;
            const sx = e.clientX, sy = e.clientY, sw = el.offsetWidth, sh = el.offsetHeight, sl = el.offsetLeft, st = el.offsetTop;
            const move = (me) => {
                let nw = sw, nh = sh, nl = sl, nt = st;
                if (type.includes('e')) nw = Math.max(200, sw + (me.clientX - sx));
                if (type.includes('s')) nh = Math.max(150, sh + (me.clientY - sy));
                if (type.includes('w')) { let d = me.clientX - sx; if (sw - d > 200) { nw = sw - d; nl = sl + d; } }
                if (type.includes('n')) { let d = me.clientY - sy; if (sh - d > 150) { nh = sh - d; nt = st + d; } }
                el.style.width = nw + 'px'; el.style.height = nh + 'px'; el.style.left = nl + 'px'; el.style.top = nt + 'px';
            };
            const up = () => { saveAllStates(el); document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
            document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
        };
    });
}

const run = () => { initOrUpdate(); };
if (document.readyState === 'complete') setTimeout(run, 1000);
else window.addEventListener('load', () => setTimeout(run, 1000));

let db;
const ob = new MutationObserver((mutations) => { 
    if (mutations.some(m => document.getElementById('timeline-sidebar')?.contains(m.target)) || document.activeElement?.tagName === 'INPUT') return; 
    clearTimeout(db); db = setTimeout(renderList, 1000); 
});
ob.observe(document.body, { childList: true, subtree: true });