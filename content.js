/* --- content.js v0.4 (Final Fix: Boundary Safety & Scope) --- */

let searchTerm = "";
let isLocked = false; 
let isSidebarVisible = true;
let showOnlyBookmarks = false; 
let config = { fontSize: 14, fontColor: "#2d3748", bgColor: "#ffffff", promptHeight: 200 }; 
let itemsData = []; 
let bookmarks = JSON.parse(localStorage.getItem('timeline_pro_bookmarks') || '[]');
let selectedPrompts = new Set(); 
let selectedTags = new Set(); 

const defaultTags = [
    { key: 'Python', color: '#4c8bf5', bg: '#4c8bf515', label: 'PY' },
    { key: 'JavaScript', color: '#718096', bg: '#f7f9fc', label: 'JS' },
    { key: '报错', color: '#ef4444', bg: '#fee2e2', label: 'BUG' },
    { key: 'AI', color: '#4c8bf5', bg: '#f7f9fc', label: 'AI' },
    { key: '翻译', color: '#10b981', bg: '#ecfdf5', label: '译' }
];
let customTags = JSON.parse(localStorage.getItem('timeline_pro_tags')) || defaultTags;
let customPrompts = JSON.parse(localStorage.getItem('timeline_pro_prompts') || '[]');

const ICONS = {
    pin: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    pinned: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="currentColor" stroke-width="2.2"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    settings: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
    close: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    clear: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
    star: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    trash: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    plus: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
};

function saveAllStates(el) {
    const state = { pos: { top: el.style.top, left: el.style.left, width: el.style.width, height: el.style.height }, settings: config, isVisible: isSidebarVisible };
    localStorage.setItem('timeline_pro_data', JSON.stringify(state));
    localStorage.setItem('timeline_pro_tags', JSON.stringify(customTags));
    localStorage.setItem('timeline_pro_prompts', JSON.stringify(customPrompts));
}

function loadAllStates(el) {
    const saved = localStorage.getItem('timeline_pro_data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.pos) { Object.assign(el.style, data.pos); el.style.right = "auto"; }
            if (data.settings) config = { ...config, ...data.settings };
            if (data.isVisible !== undefined) isSidebarVisible = data.isVisible;
        } catch (e) {}
    }
}

function getSmartMeta(text) {
    let tag = customTags.find(c => text.toLowerCase().includes(c.key.toLowerCase()));
    let cleanText = text.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
    let summary = cleanText;
    if (summary.length > 100) summary = summary.substring(0, 97) + "...";
    return { tag, summary };
}

function toggleSidebar(show) {
    const sidebar = document.getElementById('timeline-sidebar'), restoreBtn = document.getElementById('timeline-restore-btn');
    if (!sidebar || !restoreBtn) return;
    isSidebarVisible = show;
    sidebar.classList.toggle('is-hidden', !show);
    restoreBtn.classList.toggle('is-visible', !show);
    saveAllStates(sidebar);
}

function insertTextToActiveInput(text) {
    let inputEl = document.querySelector('#prompt-textarea') || document.querySelector('[contenteditable="true"]') || document.querySelector('textarea');
    if (inputEl) {
        inputEl.focus();
        if (inputEl.isContentEditable || inputEl.getAttribute('contenteditable') === 'true') {
            document.execCommand('insertText', false, text);
        } else {
            const start = inputEl.selectionStart, end = inputEl.selectionEnd, val = inputEl.value;
            inputEl.value = val.substring(0, start) + text + val.substring(end);
            inputEl.selectionStart = inputEl.selectionEnd = start + text.length;
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
    } else {
        alert("未找到输入框");
    }
}

function renderPrompts() {
    const container = document.getElementById('prompt-list'), bulkBtn = document.getElementById('bulk-delete-prompts');
    if (!container) return;
    container.innerHTML = customPrompts.length > 0 ? customPrompts.map((p, idx) => {
            const content = typeof p === 'object' ? p.content : p;
            const color = typeof p === 'object' ? p.color : '#eef2f8';
            const isSel = selectedPrompts.has(idx);
            return `<div class="prompt-item ${isSel ? 'is-selected' : ''}" style="border-left: 3px solid ${color}" data-idx="${idx}" title="点击插入"><input type="checkbox" class="prompt-checkbox" ${isSel ? 'checked' : ''} data-idx="${idx}"><span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin:0 5px;">${content}</span><button class="delete-prompt-btn" data-idx="${idx}">${ICONS.trash}</button></div>`;
        }).join('') : `<div style="font-size:11px; color:#718096; text-align:center; padding:5px;">暂无提示词</div>`;
    bulkBtn.style.display = selectedPrompts.size > 0 ? 'block' : 'none';
    setupPromptItemEvents(container);
}

function setupPromptItemEvents(container) {
    const sidebar = document.getElementById('timeline-sidebar');
    container.querySelectorAll('.prompt-item').forEach(item => { item.onclick = (e) => { if (e.target.closest('.delete-prompt-btn') || e.target.closest('.prompt-checkbox')) return; insertTextToActiveInput(typeof customPrompts[item.dataset.idx] === 'object' ? customPrompts[item.dataset.idx].content : customPrompts[item.dataset.idx]); }; });
    container.querySelectorAll('.prompt-checkbox').forEach(cb => { cb.onchange = (e) => { const idx = parseInt(cb.dataset.idx); e.target.checked ? selectedPrompts.add(idx) : selectedPrompts.delete(idx); renderPrompts(); }; });
    container.querySelectorAll('.delete-prompt-btn').forEach(btn => { btn.onclick = (e) => { e.stopPropagation(); customPrompts.splice(btn.dataset.idx, 1); selectedPrompts.clear(); saveAllStates(sidebar); renderPrompts(); }; });
}

function setupPromptEvents(sidebar) {
    const section = sidebar.querySelector('#prompt-section'), editor = sidebar.querySelector('#prompt-editor'), confirmLayer = sidebar.querySelector('#prompt-confirm-layer');
    const input = sidebar.querySelector('#new-prompt-content'), colorInput = sidebar.querySelector('#new-prompt-color');
    sidebar.querySelector('#prompt-resizer').onmousedown = (e) => { e.preventDefault(); const startY = e.clientY, startH = section.offsetHeight; const move = (me) => { section.style.height = Math.max(100, Math.min(500, startH + (startY - me.clientY))) + 'px'; config.promptHeight = section.offsetHeight; }; const up = () => { saveAllStates(sidebar); document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); }; document.addEventListener('mousemove', move); document.addEventListener('mouseup', up); };
    sidebar.querySelector('#add-prompt-btn').onclick = () => { editor.style.display = editor.style.display === 'none' ? 'block' : 'none'; if(editor.style.display === 'block') input.focus(); };
    sidebar.querySelector('#cancel-prompt').onclick = () => { editor.style.display = 'none'; input.value = ''; };
    sidebar.querySelector('#save-prompt').onclick = () => { if (input.value.trim()) { customPrompts.push({ content: input.value.trim(), color: colorInput.value }); saveAllStates(sidebar); renderPrompts(); input.value = ''; editor.style.display = 'none'; } };
    sidebar.querySelector('#bulk-delete-prompts').onclick = () => { sidebar.querySelector('#confirm-msg').innerText = `确定删除选中的 ${selectedPrompts.size} 个提示词吗？`; confirmLayer.style.display = 'flex'; };
    sidebar.querySelector('#confirm-cancel').onclick = () => { confirmLayer.style.display = 'none'; };
    sidebar.querySelector('#confirm-ok').onclick = () => { const sortedIdx = Array.from(selectedPrompts).sort((a, b) => b - a); sortedIdx.forEach(idx => customPrompts.splice(idx, 1)); selectedPrompts.clear(); saveAllStates(sidebar); renderPrompts(); confirmLayer.style.display = 'none'; };
}

function renderTagsEditor() {
    const container = document.getElementById('custom-tags-editor'), bulkBtn = document.getElementById('bulk-delete-tags');
    if (!container) return;
    container.innerHTML = customTags.length > 0 ? customTags.map((tag, idx) => { const isSel = selectedTags.has(idx); return `<div class="tag-edit-item ${isSel ? 'is-selected' : ''}" style="border-left: 3px solid ${tag.color}; margin-bottom: 6px;"><div style="display:flex; align-items:center; gap:8px;"><input type="checkbox" class="tag-checkbox" ${isSel ? 'checked' : ''} data-idx="${idx}"><b style="font-size:12px; color:#2d3748;">${tag.label}</b><span style="font-size:11px; color:#718096;">(${tag.key})</span></div><button class="icon-btn-modern delete-tag-btn" data-idx="${idx}" style="color:#718096;">${ICONS.trash}</button></div>`}).join('') : `<div style="font-size:11px; color:#718096; text-align:center; padding:5px;">暂无自定义标签</div>`;
    if (bulkBtn) bulkBtn.style.display = selectedTags.size > 0 ? 'block' : 'none';
    container.querySelectorAll('.tag-checkbox').forEach(cb => { cb.onchange = (e) => { const idx = parseInt(cb.dataset.idx); e.target.checked ? selectedTags.add(idx) : selectedTags.delete(idx); renderTagsEditor(); }; });
    container.querySelectorAll('.delete-tag-btn').forEach(btn => btn.onclick = () => { customTags.splice(btn.dataset.idx, 1); selectedTags.clear(); saveAllStates(document.getElementById('timeline-sidebar')); renderTagsEditor(); renderList(); });
}

function initOrUpdate() {
    let sidebar = document.getElementById('timeline-sidebar'), restoreBtn = document.getElementById('timeline-restore-btn');
    if (!restoreBtn) { restoreBtn = document.createElement('div'); restoreBtn.id = 'timeline-restore-btn'; restoreBtn.innerHTML = '<span>对话索引</span>'; document.body.appendChild(restoreBtn); restoreBtn.onclick = () => toggleSidebar(true); }
    if (!sidebar) {
        sidebar = document.createElement('div'); sidebar.id = 'timeline-sidebar'; document.body.appendChild(sidebar);
        sidebar.innerHTML = `${['n','s','e','w','nw','ne','sw','se'].map(h => `<div class="resize-handle rs-${h}" data-handle="${h}"></div>`).join('')}
            <div class="timeline-header" id="timeline-drag-handle"><span>AI 导航索引</span><div class="header-controls"><button id="lock-btn" class="icon-btn-modern" title="固定/移动">${ICONS.pin}</button><button id="settings-btn" class="icon-btn-modern" title="设置">${ICONS.settings}</button><button id="close-btn" class="icon-btn-modern close-x" title="隐藏">${ICONS.close}</button></div></div>
            <div id="settings-panel" style="display:none; flex-direction:column; flex:1; overflow:hidden; position:relative; background:#f7f9fc;">
                <div style="flex-shrink:0; padding:16px 16px 0 16px;">
                    <div class="setting-title" style="margin-bottom:12px; font-size:13px; letter-spacing:1px; color:#718096; font-weight:600;">界面参数</div>
                    <div class="setting-row" style="margin-bottom:12px;"><span>预览字号</span><div class="modern-stepper"><button class="stepper-btn" id="font-minus">−</button><input type="number" id="set-font-size" value="${config.fontSize}" readonly><button class="stepper-btn" id="font-plus">+</button></div></div>
                    <div id="inline-list-container" style="margin-bottom:16px; padding:4px; border:1px dashed #eef2f8; border-radius:8px; background:rgba(255,255,255,0.5);"></div>
                    <div style="height:1px; background:#eef2f8; margin-bottom:16px;"></div>
                    <div class="setting-row" style="margin-bottom:10px;"><span>文字颜色</span><input type="color" id="set-font-color" value="${config.fontColor}"></div>
                    <div class="setting-row" style="margin-bottom:10px;"><span>背景色调</span><input type="color" id="set-bg-color" value="${config.bgColor}"></div>
                    <button id="reset-all-btn" class="reset-btn" style="margin-top:6px; margin-bottom:16px; padding:8px 0; border-style:dashed; background:transparent;">恢复默认设置</button>
                    <div class="setting-title" style="border-top:1px solid #eef2f8; padding-top:16px; margin-top:4px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; font-size:13px; letter-spacing:1px; color:#718096; font-weight:600;"><span>自定义标签管理</span><div style="display:flex; gap:8px;"><button id="bulk-delete-tags" style="display:none; background:none; border:none; color:#ef4444; font-size:10px; cursor:pointer; font-weight:700;">删除选中</button><span id="clear-tags-btn" class="tag-clear-link">清空</span></div></div>
                </div>
                <div id="custom-tags-editor" style="flex:1; overflow-y:auto; padding:0 16px;"></div>
                <div id="tag-editor-box-wrapper" style="flex-shrink:0; padding:12px 16px 16px 16px; border-top:1px solid #eef2f8; background:#fff;"><div id="tag-editor-box" style="padding:0; border:none; background:transparent; margin-top:0;"><input type="text" id="new-tag-key" class="tag-input-modern" placeholder="关键词 (如:Python)" style="margin-bottom:8px; height:32px;"><input type="text" id="new-tag-label" class="tag-input-modern" placeholder="缩写 (如:PY)" style="margin-bottom:8px; height:32px;"><div class="prompt-editor-footer" style="padding-top:4px;"><div style="display:flex; align-items:center; gap:8px; font-size:12px; font-weight:600; color:#718096;">颜色 <input type="color" id="new-tag-color" class="modern-color-dot" value="#4c8bf5" style="width:20px; height:20px;"></div><button id="add-tag-btn" class="prompt-action-btn" style="background:#2d3748; color:white; padding:6px 14px; font-size:11px;">添加标签</button></div></div></div>
                <div id="tag-confirm-layer" class="prompt-confirm-overlay" style="display:none;"><div class="prompt-confirm-box"><div id="tag-confirm-msg"></div><div class="prompt-actions" style="margin-top:10px;"><button id="tag-confirm-cancel" class="prompt-action-btn" style="background:transparent; color:#ffffff; font-size:11px;">取消</button><button id="tag-confirm-ok" class="prompt-action-btn" style="background:#ef4444; color:white; border:none; font-size:11px;">确定执行</button></div></div></div>
            </div>
            <div class="search-wrapper" id="search-container"><div class="search-inner"><input type="text" id="timeline-search-input" placeholder="关键词检索..." value="${searchTerm}"><div id="search-clear" class="search-clear-btn">${ICONS.clear}</div></div></div>
            <div class="filter-bar" id="filter-container"><div class="filter-item ${showOnlyBookmarks ? 'is-active' : ''}" id="toggle-bookmark-filter"><input type="checkbox" class="filter-checkbox-hidden" ${showOnlyBookmarks ? 'checked' : ''} id="bookmark-filter-checkbox"><span style="font-weight: 700; letter-spacing: 0.5px;">仅显示已标记</span></div></div>
            <div id="timeline-list"></div>
            <div id="prompt-section" style="height: ${config.promptHeight}px"><div id="prompt-resizer"></div><div class="prompt-header"><span>常用提示词</span><div style="display:flex; gap:8px; align-items:center;"><button id="bulk-delete-prompts" style="display:none; background:none; border:none; color:#ef4444; font-size:10px; cursor:pointer; font-weight:700;">删除选中</button><button id="add-prompt-btn" class="icon-btn-modern">${ICONS.plus}</button></div></div><div id="prompt-list" class="prompt-container"></div><div id="prompt-confirm-layer" class="prompt-confirm-overlay" style="display:none;"><div class="prompt-confirm-box"><div id="confirm-msg"></div><div class="prompt-actions" style="margin-top:10px;"><button id="confirm-cancel" class="prompt-action-btn" style="background:transparent; color:#ffffff;">取消</button><button id="confirm-ok" class="prompt-action-btn" style="background:#ef4444; color:white; border:none;">确定删除</button></div></div></div><div id="prompt-editor"><textarea id="new-prompt-content" placeholder="输入常用提示词内容..."></textarea><div class="prompt-editor-footer"><div style="display:flex; align-items:center; gap:8px; font-size:12px; font-weight:600; color:#718096;">颜色 <input type="color" id="new-prompt-color" class="modern-color-dot" value="#4c8bf5"></div><div class="prompt-actions"><button id="cancel-prompt" class="prompt-action-btn" style="color: #2d3748; border: 1px solid #718096; background: #f7f9fc; margin-right: 8px;">取消</button><button id="save-prompt" class="prompt-action-btn" style="background: #4c8bf5; color: white;">保存</button></div></div></div></div>`;
        loadAllStates(sidebar); setupEventListeners(sidebar); setupPromptEvents(sidebar); renderTagsEditor(); renderPrompts(); makeDraggable(sidebar, sidebar.querySelector('#timeline-drag-handle')); makeResizable(sidebar); toggleSidebar(isSidebarVisible);
    }
    renderList();
}

function setupEventListeners(sidebar) {
    sidebar.querySelector('#close-btn').onclick = () => toggleSidebar(false);
    sidebar.querySelector('#lock-btn').onclick = (e) => { isLocked = !isLocked; e.currentTarget.innerHTML = isLocked ? ICONS.pinned : ICONS.pin; e.currentTarget.classList.toggle('is-active', isLocked); };
    sidebar.querySelector('#settings-btn').onclick = (e) => {
        const panel = sidebar.querySelector('#settings-panel'), sc = sidebar.querySelector('#search-container'), ps = sidebar.querySelector('#prompt-section'), fc = sidebar.querySelector('#filter-container');
        const isOpening = panel.style.display !== 'flex'; panel.style.display = isOpening ? 'flex' : 'none';
        sc.style.display = ps.style.display = fc.style.display = isOpening ? 'none' : (isOpening ? 'none' : 'block');
        if(!isOpening) { ps.style.display = 'flex'; fc.style.display = 'flex'; }
        e.currentTarget.classList.toggle('is-active', isOpening); renderList();
    };
    const filterContainer = sidebar.querySelector('#toggle-bookmark-filter');
    if (filterContainer) { filterContainer.onclick = () => { showOnlyBookmarks = !showOnlyBookmarks; sidebar.querySelector('#bookmark-filter-checkbox').checked = showOnlyBookmarks; filterContainer.classList.toggle('is-active', showOnlyBookmarks); renderList(); }; }
    sidebar.querySelector('#add-tag-btn').onclick = () => { const k = sidebar.querySelector('#new-tag-key').value.trim(), l = sidebar.querySelector('#new-tag-label').value.trim(), c = sidebar.querySelector('#new-tag-color').value; if (k && l) { customTags.push({ key: k, label: l.toUpperCase(), color: c, bg: c + '15' }); saveAllStates(sidebar); renderTagsEditor(); renderList(); sidebar.querySelector('#new-tag-key').value = ''; sidebar.querySelector('#new-tag-label').value = ''; } };
    const tagLayer = sidebar.querySelector('#tag-confirm-layer'), tagMsg = sidebar.querySelector('#tag-confirm-msg');
    let tagMode = "clear";
    sidebar.querySelector('#clear-tags-btn').onclick = () => { tagMode = "clear"; tagMsg.innerText = "确定清空所有自定义标签吗？"; tagLayer.style.display = 'flex'; };
    sidebar.querySelector('#bulk-delete-tags').onclick = () => { tagMode = "bulk"; tagMsg.innerText = `确定删除选中的 ${selectedTags.size} 个标签吗？`; tagLayer.style.display = 'flex'; };
    sidebar.querySelector('#tag-confirm-cancel').onclick = () => tagLayer.style.display = 'none';
    sidebar.querySelector('#tag-confirm-ok').onclick = () => { if (tagMode === "clear") { customTags = []; } else { const sorted = Array.from(selectedTags).sort((a,b) => b-a); sorted.forEach(i => customTags.splice(i,1)); } selectedTags.clear(); saveAllStates(sidebar); renderTagsEditor(); renderList(); tagLayer.style.display = 'none'; };
    sidebar.querySelector('#reset-all-btn').onclick = () => { if(confirm('恢复默认设置？（界面配置将清空，但保留自定义标签、提示词和收藏内容）')) { localStorage.removeItem('timeline_pro_data'); location.reload(); } };
    sidebar.querySelector('#font-plus').onclick = () => { config.fontSize++; sidebar.querySelector('#set-font-size').value = config.fontSize; saveAllStates(sidebar); renderList(); };
    sidebar.querySelector('#font-minus').onclick = () => { config.fontSize--; sidebar.querySelector('#set-font-size').value = config.fontSize; saveAllStates(sidebar); renderList(); };
    sidebar.querySelector('#set-font-color').oninput = (e) => { config.fontColor = e.target.value; saveAllStates(sidebar); renderList(); };
    sidebar.querySelector('#set-bg-color').oninput = (e) => { config.bgColor = e.target.value; saveAllStates(sidebar); renderList(); };
    const si = sidebar.querySelector('#timeline-search-input'), cl = sidebar.querySelector('#search-clear');
    si.oninput = (e) => { searchTerm = e.target.value; cl.style.display = searchTerm ? 'flex' : 'none'; renderList(); };
    cl.onclick = () => { searchTerm = ""; si.value = ""; cl.style.display = 'none'; renderList(); si.focus(); };
}

let lastRenderHash = ""; 
function renderList() {
    const mainList = document.getElementById('timeline-list'), inlineContainer = document.getElementById('inline-list-container'), settingsPanel = document.getElementById('settings-panel');
    if (!mainList || !inlineContainer) return;
    const isSettingsOpen = settingsPanel && settingsPanel.style.display === 'flex', isGemini = window.location.host.includes('gemini');
    const domQueries = isGemini ? document.querySelectorAll('.query-text, .user-query-content, [data-test-id="user-query"]') : document.querySelectorAll('[data-message-author-role="user"]');
    
    // 生成状态Hash，避免重复渲染
    const currentStatusHash = `${domQueries.length}-${searchTerm}-${showOnlyBookmarks}-${bookmarks.length}-${isSettingsOpen}`;
    if (!isSettingsOpen && currentStatusHash === lastRenderHash) return; 
    lastRenderHash = currentStatusHash;

    let tempItems = [], html = "";
    const allNodes = Array.from(domQueries), targetNodes = isSettingsOpen ? (allNodes.length > 0 ? [allNodes[allNodes.length - 1]] : []) : allNodes;

    targetNodes.forEach((el, index) => {
        let rawText = (el.querySelector('.whitespace-pre-wrap') || el).innerText.trim();
        if (rawText.length < 2) return;
        
        // 修复：更稳健的 ID 生成，依赖内容哈希而非 Index
        const textHash = rawText.substring(0, 20).replace(/[^\w\u4e00-\u9fa5]/g, '') + rawText.length;
        const itemID = `uuid-${textHash}`;
        
        const { tag, summary } = getSmartMeta(rawText); 
        const isBookmarked = bookmarks.includes(itemID); 
        if (!isSettingsOpen && ((searchTerm && !rawText.toLowerCase().includes(searchTerm.toLowerCase())) || (showOnlyBookmarks && !isBookmarked))) return;
        
        tempItems.push({ element: el, id: itemID });
        html += `<div class="timeline-item" style="font-size:${config.fontSize}px; color:${config.fontColor}; background:${isSettingsOpen ? 'transparent' : config.bgColor}; border-left: none !important;" title="点击跳转">
            <div class="bookmark-btn ${isBookmarked ? 'is-active' : ''}" data-id="${itemID}">${ICONS.star}</div>
            <span class="item-index" style="width:24px; height:24px; font-size:11px;">${isSettingsOpen ? allNodes.length : index + 1}</span>
            <div class="item-content"><div class="item-title-row"><span class="item-summary">${summary}</span>${tag ? `<span class="item-tag" style="color:${tag.color}; background:${tag.bg}">${tag.label}</span>` : ''}</div></div>
        </div>`;
    });
    itemsData = tempItems;
    const finalHtml = html || `<div style="text-align:center;padding:20px;color:#718096;font-size:12px;">${showOnlyBookmarks ? '暂无标记项' : '无匹配结果'}</div>`;
    const targetWrapper = isSettingsOpen ? inlineContainer : mainList;
    if (targetWrapper.innerHTML !== finalHtml) { targetWrapper.innerHTML = finalHtml; setupItemClicks(targetWrapper); }
    mainList.style.display = isSettingsOpen ? "none" : "block"; inlineContainer.style.display = isSettingsOpen ? "block" : "none";
}

function setupItemClicks(container) {
    container.querySelectorAll('.bookmark-btn').forEach(btn => btn.onclick = (e) => { e.stopPropagation(); const id = btn.dataset.id, index = bookmarks.indexOf(id); if (index > -1) bookmarks.splice(index, 1); else bookmarks.push(id); localStorage.setItem('timeline_pro_bookmarks', JSON.stringify(bookmarks)); lastRenderHash = ""; renderList(); });
    container.querySelectorAll('.timeline-item').forEach((it, idx) => it.onclick = () => { if (!itemsData[idx]) return; const target = itemsData[idx].element; target.scrollIntoView({ behavior: 'smooth', block: 'center' }); target.animate([{boxShadow:'0 0 0 0 rgba(0,0,0,0)', background: 'rgba(76,139,245,0.05)'}, {boxShadow:'0 0 0 4px rgba(76,139,245,0.1)', background: 'rgba(76,139,245,0.1)'}, {boxShadow:'0 0 0 0 rgba(0,0,0,0)', background: 'transparent'}], { duration: 1500 }); });
}

function makeDraggable(el, handle) {
    handle.onmousedown = (e) => {
        if (isLocked || e.target.closest('button')) return;
        let px = e.clientX, py = e.clientY;
        const move = (me) => { 
            let newLeft = el.offsetLeft + (me.clientX - px), newTop = el.offsetTop + (me.clientY - py);
            // 修复：边界检查，防止拖出屏幕
            const maxLeft = window.innerWidth - el.offsetWidth, maxTop = window.innerHeight - el.offsetHeight;
            newLeft = Math.max(0, Math.min(newLeft, maxLeft)); newTop = Math.max(0, Math.min(newTop, maxTop));
            el.style.top = newTop + "px"; el.style.left = newLeft + "px"; el.style.right = "auto"; px = me.clientX; py = me.clientY; 
        };
        const up = () => { saveAllStates(el); document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
        document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    };
}

function makeResizable(el) {
    el.querySelectorAll('.resize-handle').forEach(h => {
        h.onmousedown = (e) => {
            if (isLocked) return;
            const type = h.dataset.handle, sx = e.clientX, sy = e.clientY, sw = el.offsetWidth, sh = el.offsetHeight, sl = el.offsetLeft, st = el.offsetTop;
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
if (document.readyState === 'complete') setTimeout(run, 1500); else window.addEventListener('load', () => setTimeout(run, 1500));
let db; const ob = new MutationObserver(() => { clearTimeout(db); db = setTimeout(renderList, 600); });
ob.observe(document.body, { childList: true, subtree: true });
;
// ================= END OF PLUGIN 1 =================


/* ==========================================================================
   MERGED SEPARATOR: The code below comes from Plugin 2 (content.js)
   ========================================================================== */

(function () {
  "use strict";

  const CONFIG = {
    selectors: `
      .response-content, 
      .message.assistant, 
      .prose, 
      [role='article'], 
      .markdown, 
      [data-message-author-role='assistant'], 
      .agent-turn,
      div[class*='markdown']
    `,
    toastDuration: 2000, 
    minTextLength: 2,
    animDuration: 500 
  };

  const HIDDEN_HISTORY = [];

  const ICONS = {
    copy: `<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
    delete: `<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    undo: `<svg viewBox="0 0 24 24"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>`,
    sectionCopy: `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>`,
    image: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`
  };

  // ================== 核心工具：公式处理 ==================
  function extractLatexFromElement(mathEl) {
    if (!mathEl) return null; // 安全检查
    const mjxContainer = mathEl.closest("mjx-container") || mathEl;
    if (mjxContainer.tagName === "MJX-CONTAINER" && mjxContainer.hasAttribute("data-tex")) {
        return mjxContainer.getAttribute("data-tex");
    }
    const dataTarget = mathEl.closest("[data-math], [data-math-src]") || mathEl;
    if (dataTarget.hasAttribute("data-math") || dataTarget.hasAttribute("data-math-src")) {
        return (dataTarget.getAttribute("data-math") || dataTarget.getAttribute("data-math-src"))?.trim();
    }
    const annotation = mathEl.querySelector("annotation[encoding='application/x-tex']");
    if (annotation) return annotation.textContent.trim();
    const annotationXml = mathEl.querySelector("annotation-xml[encoding='application/x-tex']");
    if (annotationXml) return annotationXml.textContent.trim();
    const script = mathEl.querySelector("script[type='math/tex']");
    if (script) return script.textContent.trim();
    return null;
  }

  function standardizePunctuation(text) {
    if (!text) return "";
    return text.replace(/[\uff01-\uff5e]/g, function(ch) {
      if (ch.charCodeAt(0) === 0xFF0C) return ch; 
      return String.fromCharCode(ch.charCodeAt(0) - 65248);
    });
  }

  function getCleanText(element) {
    const clone = element.cloneNode(true);
    const tools = clone.querySelectorAll(".ai-btn-group, .ai-section-copy-btn");
    tools.forEach(t => t.remove());

    const mathCandidates = clone.querySelectorAll("mjx-container, .katex, .math-block, .math-inline, [data-math]");
    mathCandidates.forEach(node => {
        if (!clone.contains(node)) return; 
        const latex = extractLatexFromElement(node);
        if (latex) {
            let cleanTex = latex.replace(/^\\\(|\\\)$|^\\\[|\\\]$/g, "").trim();
            cleanTex = cleanTex.replace(/\s+/g, " ");
            const isSimple = !cleanTex.includes("\\") && !cleanTex.includes("{") && cleanTex.length < 50;
            if (isSimple) {
                node.replaceWith(document.createTextNode(` ${cleanTex} `));
            } else {
                node.replaceWith(document.createTextNode(` $${cleanTex}$ `));
            }
        }
    });

    let text = "";
    if (element.tagName === "PRE") {
      text = clone.textContent; 
    } else {
      text = clone.innerText;
      text = text.replace(/^[ \t]+|[ \t]+$/gm, "");
      text = text.replace(/[ \t]{2,}/g, " ");
      text = text.replace(/[\r\n]{3,}/g, "\n\n");
    }
    return standardizePunctuation(text.trim());
  }

  // ================== 图片复制逻辑 (已修复：防闪烁/跨域) ==================
  async function executeImageCopy(imgEl) {
    try {
      showToast("正在处理图片...");
      
      // 创建一个新的 Image 对象，不影响 DOM 中的原图
      const proxyImg = new Image();
      proxyImg.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
          proxyImg.onload = resolve;
          proxyImg.onerror = reject;
          proxyImg.src = imgEl.src;
      });

      const canvas = document.createElement("canvas");
      canvas.width = proxyImg.naturalWidth;
      canvas.height = proxyImg.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(proxyImg, 0, 0);

      canvas.toBlob(async (blob) => {
        if (!blob) {
            showToast("图片格式不受支持", "error");
            return;
        }
        try {
            const item = new ClipboardItem({ "image/png": blob });
            await navigator.clipboard.write([item]);
            
            // 视觉反馈
            imgEl.parentElement.classList.remove("copy-pulse-success");
            void imgEl.parentElement.offsetWidth;
            imgEl.parentElement.classList.add("copy-pulse-success");
            setTimeout(() => imgEl.parentElement.classList.remove("copy-pulse-success"), CONFIG.animDuration);
            
            showToast("图片已复制到剪贴板");
        } catch (err) {
            throw new Error("Clipboard write failed");
        }
      }, "image/png");

    } catch (err) {
      console.error("Image copy failed:", err);
      // 降级尝试：直接复制 URL
      try {
          await navigator.clipboard.writeText(imgEl.src);
          showToast("无法复制图像数据，已复制图片链接");
      } catch (e) {
          showToast("复制失败", "error");
      }
    }
  }

  // ================== 文本/公式 复制执行 ==================
  async function executeCopy(text, targetEl, successMsg) {
    if (!text) return;
    try {
      const htmlContent = `
        <div style="
          font-family: 'Times New Roman', 'SimSun', '宋体', serif; 
          font-size: 14pt; 
          line-height: 1.5; 
          color: #000000;
        ">
          ${text.replace(/\n/g, "<br>")}
        </div>
      `;
      const textBlob = new Blob([text], { type: "text/plain" });
      const htmlBlob = new Blob([htmlContent], { type: "text/html" });
      const clipboardItem = new ClipboardItem({ "text/plain": textBlob, "text/html": htmlBlob });
      await navigator.clipboard.write([clipboardItem]);

      if (targetEl) {
        targetEl.classList.remove("copy-pulse-success");
        void targetEl.offsetWidth;
        targetEl.classList.add("copy-pulse-success");
        setTimeout(() => targetEl.classList.remove("copy-pulse-success"), CONFIG.animDuration);
      }
      showToast(successMsg);
    } catch (err) {
      // 降级：仅复制纯文本
      await navigator.clipboard.writeText(text);
      showToast(successMsg + " (仅文本)");
    }
  }

  // ================== UI 组件 ==================
  let globalUndoBall = null;
  let undoBadge = null;

  function updateGlobalBall() {
    if (!globalUndoBall) {
      globalUndoBall = document.createElement("div");
      globalUndoBall.className = "global-undo-ball";
      globalUndoBall.innerHTML = `${ICONS.undo}`;
      undoBadge = document.createElement("div");
      undoBadge.className = "undo-badge";
      globalUndoBall.appendChild(undoBadge);
      globalUndoBall.onclick = (e) => { e.stopPropagation(); restoreLastHidden(); };
      document.body.appendChild(globalUndoBall);
    }
    const count = HIDDEN_HISTORY.length;
    if (count > 0) {
      globalUndoBall.classList.add("visible");
      undoBadge.textContent = count > 99 ? "99+" : count;
    } else {
      globalUndoBall.classList.remove("visible");
    }
  }

  function showToast(message, actionText = null, actionCallback = null) {
    let container = document.querySelector(".ai-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "ai-toast-container";
      document.body.appendChild(container);
    }
    // 修复：不要清空 innerHTML，允许 Toast 堆叠
    
    const toast = document.createElement("div");
    toast.className = "ai-toast";
    const msgSpan = document.createElement("span");
    msgSpan.textContent = message;
    toast.appendChild(msgSpan);
    if (actionText && actionCallback) {
      const btn = document.createElement("button");
      btn.className = "toast-btn";
      btn.textContent = actionText;
      btn.onclick = () => { actionCallback(); toast.remove(); };
      toast.appendChild(btn);
    }
    container.appendChild(toast);
    
    // 自动移除
    setTimeout(() => {
      if (toast && toast.parentNode) {
        toast.style.opacity = "0"; 
        toast.style.transform = "translateY(10px)";
        setTimeout(() => toast.remove(), 300);
      }
    }, CONFIG.toastDuration);
  }

  // ================== 功能逻辑 ==================
  function hideBlock(element) {
    const originalDisplay = element.style.display;
    element.classList.add("folding-anim");
    setTimeout(() => {
      element.classList.remove("folding-anim");
      element.classList.add("hidden-content");
    }, 300);
    HIDDEN_HISTORY.push({ element: element, originalDisplay: originalDisplay });
    updateGlobalBall();
    showToast("内容已隐藏", "撤回", () => restoreLastHidden());
  }

  function restoreLastHidden() {
    if (HIDDEN_HISTORY.length === 0) return;
    const record = HIDDEN_HISTORY.pop();
    const el = record.element;
    el.classList.remove("hidden-content");
    el.style.display = record.originalDisplay || ''; // 防止 undefined
    el.style.opacity = "0"; el.style.maxHeight = "0";
    void el.offsetWidth; 
    el.style.transition = "all 0.4s ease";
    el.style.opacity = "1"; el.style.maxHeight = "2000px";
    setTimeout(() => {
      el.style.transition = ""; el.style.maxHeight = "";
      el.classList.add("copy-pulse-success");
      setTimeout(() => el.classList.remove("copy-pulse-success"), CONFIG.animDuration);
    }, 400);
    updateGlobalBall();
  }

  function toggleSectionFold(headerEl) {
    const level = parseInt(headerEl.tagName.substring(1));
    if (isNaN(level)) return;
    let nextNode = headerEl.nextElementSibling;
    let nodesToToggle = [];
    while (nextNode) {
      if (/^H[1-6]$/.test(nextNode.tagName)) {
        if (parseInt(nextNode.tagName.substring(1)) <= level) break;
      }
      nodesToToggle.push(nextNode);
      nextNode = nextNode.nextElementSibling;
    }
    if (nodesToToggle.length === 0) return;
    const isExpanded = nodesToToggle.some(n => !n.classList.contains("hidden-content"));
    nodesToToggle.forEach(node => {
      isExpanded ? node.classList.add("hidden-content", "folded") : node.classList.remove("hidden-content", "folded");
    });
    headerEl.style.opacity = isExpanded ? "0.6" : "1";
  }

  function copySectionText(headerEl) {
    const level = parseInt(headerEl.tagName.substring(1));
    let nextNode = headerEl.nextElementSibling;
    let textParts = [];
    while (nextNode) {
      if (/^H[1-6]$/.test(nextNode.tagName)) {
        if (parseInt(nextNode.tagName.substring(1)) <= level) break;
      }
      if (!nextNode.classList.contains("hidden-content") && !nextNode.classList.contains("folded")) {
         textParts.push(getCleanText(nextNode));
      }
      nextNode = nextNode.nextElementSibling;
    }
    executeCopy(textParts.join("\n\n"), headerEl, "章节内容已复制");
  }

  function handleMathClick(e) {
    if (e.target.closest(".ai-icon-btn")) return;
    const mathEl = e.target.closest(".math-block, .katex-display, .math-inline, mjx-container, .katex");
    if (!mathEl) return;
    const latex = extractLatexFromElement(mathEl);
    if (!latex) return;
    e.preventDefault(); e.stopPropagation();
    let cleanLatex = latex.replace(/^\\\(|\\\)$|^\\\[|\\\]$/g, "").trim(); 
    cleanLatex = cleanLatex.replace(/\s+/g, " ");
    navigator.clipboard.writeText(`$${cleanLatex}$`).then(() => {
        if (mathEl) {
            mathEl.classList.remove("copy-pulse-success");
            void mathEl.offsetWidth;
            mathEl.classList.add("copy-pulse-success");
            setTimeout(() => mathEl.classList.remove("copy-pulse-success"), CONFIG.animDuration);
        }
        showToast("LaTeX 公式已复制");
    });
  }

  // ================== 注入逻辑 ==================
  function createBtn(iconHtml, title, onClick) {
    const btn = document.createElement("div");
    btn.className = "ai-icon-btn";
    btn.innerHTML = iconHtml;
    btn.title = title;
    btn.onclick = (e) => { e.stopPropagation(); onClick(e); };
    return btn;
  }

  function injectTools() {
    const containers = document.querySelectorAll(CONFIG.selectors);
    containers.forEach(container => {
      if (container.classList.contains("result-streaming")) return;

      // 1. 文本段落注入
      const blocks = container.querySelectorAll("p, li, dd, pre, blockquote, .math-block");
      blocks.forEach(block => {
        if (block.classList.contains("ai-paragraph-ready") || 
            block.closest(".ai-btn-group") || 
            (block.tagName !== 'PRE' && block.textContent.trim().length < CONFIG.minTextLength)) return;
        
        if (block.closest("pre") && block.tagName !== "PRE") return;
        if (block.isContentEditable || block.closest('[contenteditable="true"]')) return;

        // ★ 修复：嵌套检测。如果当前是 li/blockquote 且内部有 p，则不在当前层注入，留给内部 p 注入
        if ((block.tagName === 'LI' || block.tagName === 'BLOCKQUOTE' || block.tagName === 'DD') && block.querySelector('p')) {
             return;
        }

        block.classList.add("ai-paragraph-ready");
        const group = document.createElement("div");
        group.className = "ai-btn-group";
        
        const copyBtn = createBtn(ICONS.copy, "复制", () => {
          const text = getCleanText(block);
          executeCopy(text, block, "格式化复制成功");
        });
        const deleteBtn = createBtn(ICONS.delete, "隐藏", () => hideBlock(block));
        deleteBtn.classList.add("btn-delete");

        group.appendChild(copyBtn);
        group.appendChild(deleteBtn);
        block.appendChild(group);
      });

      // 2. 图片注入
      const images = container.querySelectorAll("img");
      images.forEach(img => {
        if (img.width < 100 || img.height < 100) return;
        
        const wrapper = img.parentElement;
        if (!wrapper || wrapper.classList.contains("ai-image-ready")) return;

        wrapper.classList.add("ai-image-ready");
        const style = window.getComputedStyle(wrapper);
        if (style.position === 'static') wrapper.style.position = 'relative';

        const group = document.createElement("div");
        group.className = "ai-btn-group ai-img-btn-group";
        
        const copyImgBtn = createBtn(ICONS.image, "复制图片", () => executeImageCopy(img));
        const hideImgBtn = createBtn(ICONS.delete, "隐藏", () => hideBlock(wrapper));
        hideImgBtn.classList.add("btn-delete");

        group.appendChild(copyImgBtn);
        group.appendChild(hideImgBtn);
        wrapper.appendChild(group);
      });

      // 3. 标题注入
      const headers = container.querySelectorAll("h1, h2, h3, h4");
      headers.forEach(header => {
        if (header.dataset.aiReady) return;
        if (header.isContentEditable || header.closest('[contenteditable="true"]')) return;

        header.dataset.aiReady = "true";
        header.addEventListener("click", (e) => {
          if (e.target.closest(".ai-section-copy-btn")) return;
          toggleSectionFold(header);
        });
        const secCopyBtn = createBtn(ICONS.sectionCopy, "复制章节", () => copySectionText(header));
        secCopyBtn.className += " ai-section-copy-btn ai-icon-btn";
        header.appendChild(secCopyBtn);
      });
    });
  }

  document.addEventListener("pointerdown", handleMathClick, true);

  let debounceTimer;
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(injectTools, 300);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  injectTools();
})();
