// ========================================
// 页面性能优化 - 加载进度条和图片渐进式加载
// ========================================

// 页面加载进度条
(function() {
    const loadingBar = document.getElementById('loading-bar');
    let progress = 0;
    
    // 模拟进度增长
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 90) {
            progress = 90;
            clearInterval(interval);
        }
        if (loadingBar) {
            loadingBar.style.width = progress + '%';
        }
    }, 200);
    
    // 页面完全加载后完成进度
    window.addEventListener('load', () => {
        if (loadingBar) {
            loadingBar.style.width = '100%';
            setTimeout(() => {
                loadingBar.style.opacity = '0';
                setTimeout(() => {
                    loadingBar.style.display = 'none';
                }, 300);
            }, 500);
        }
    });
})();

// 图片渐进式加载效果
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // 如果图片已经加载完成（来自缓存）
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            // 监听图片加载完成事件
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
            
            // 处理加载错误
            img.addEventListener('error', () => {
                img.classList.add('loaded');
            });
        }
    });
    
    // 使用 Intersection Observer 优化懒加载
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                }
            });
        }, {
            rootMargin: '50px' // 提前50px开始加载
        });
        
        images.forEach(img => {
            if (img.loading === 'lazy') {
                imageObserver.observe(img);
            }
        });
    }
});

// 從 URL 獲取推廣代碼
function getReferralCode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref');
}

// ========================================
// Google 表單設定
// ========================================
// 從 localStorage 載入設定，如果沒有則使用預設值

// 預設設定（後備用）
const DEFAULT_GOOGLE_FORM_CONFIG = {
    enabled: true,
    formId: '1FAIpQLSfgpRp3GyT27oanx3_pLwAlGVgCGdvH-gPnyS_fW-LsueGpFw',
    fields: {
        fullName: 'entry.1124417422',
        email: 'entry.1571446378',
        phone: 'entry.51167075',
        country: 'entry.251150813',
        industry: 'entry.828038711',
        region: 'entry.1586436660',
        lineId: 'entry.1922861190',
        whatsapp: 'entry.1017645638'
    }
};

// 從 localStorage 載入設定
function loadGoogleFormConfig() {
    try {
        const savedConfig = localStorage.getItem('googleFormConfig');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            console.log('✅ 已載入自訂設定');
            return config;
        }
    } catch (error) {
        console.warn('⚠️ 載入設定失敗，使用預設設定:', error);
    }
    console.log('ℹ️ 使用預設設定');
    return DEFAULT_GOOGLE_FORM_CONFIG;
}

// 載入設定
const GOOGLE_FORM_CONFIG = loadGoogleFormConfig();

// 國家對應表（確保與 Google 表單的選項一致）
const COUNTRY_NAMES = {
    'TW': '台灣',
    'HK': '香港',
    'SG': '新加坡',
    'MY': '馬來西亞',
    'CN': '中國',
    'US': '美國',
    'other': '其他'
};

// 行業對應表（確保與 Google 表單的選項一致）
const INDUSTRY_NAMES = {
    'spiritual': '身心靈導師',
    'beauty': '美容 / 美髮',
    'education': '教育 / 培訓',
    'insurance': '保險 / 金融',
    'realestate': '房地產',
    'consultant': '諮詢顧問',
    'freelancer': '自由工作者',
    'coach': '個人教練',
    'ecommerce': '電商 / 微商',
    'other': '其他'
};

// 地區對應表
const REGION_NAMES = {
    'north': '北部',
    'central': '中部',
    'south': '南部'
};

// ========================================
// 頁面功能
// ========================================

// 倒计时功能
function initCountdown() {
    // 设置倒计时结束时间（例如：今天晚上11:59pm）
    const now = new Date();
    const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    // 如果已经过了今天的11:59pm，设置为明天的11:59pm
    if (now > endTime) {
        endTime.setDate(endTime.getDate() + 1);
    }

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance < 0) {
            // 倒计时结束
            const daysEl = document.getElementById('days');
            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');
            const bannerEl = document.getElementById('countdown-banner');
            
            if (daysEl) daysEl.textContent = '00';
            if (hoursEl) hoursEl.textContent = '00';
            if (minutesEl) minutesEl.textContent = '00';
            if (secondsEl) secondsEl.textContent = '00';
            if (bannerEl) bannerEl.textContent = '00:00:00';
            return;
        }

        // 计算天、时、分、秒
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // 更新显示（添加空值检查）
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        const bannerEl = document.getElementById('countdown-banner');
        
        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
        
        // 更新横幅倒计时（包含秒数）
        if (bannerEl) {
            bannerEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }

    // 初始化并每秒更新
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// FAQ折叠功能
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // 关闭其他打开的FAQ
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // 切换当前FAQ
            item.classList.toggle('active');
        });
    });
}

// CTA按钮点击处理 - 打开模态框
function initCTAButtons() {
    const ctaButtons = document.querySelectorAll('.cta-button');
    const modal = document.getElementById('orderModal');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            openModal();
        });
    });
}

// 打开模态框
function openModal() {
    const modal = document.getElementById('orderModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // 防止背景滚动
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('orderModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto'; // 恢复滚动
}

// 显示成功页面
function showSuccessPage(userName, userRegion) {
    const modalContent = document.querySelector('#orderModal .modal-content');
    
    // 保存原始内容
    const originalContent = modalContent.innerHTML;
    
    // 准备地区显示文字
    const regionText = userRegion ? `，評估地區：${userRegion}` : '';
    
    // 显示成功页面内容
    modalContent.innerHTML = `
        <div class="success-page" style="text-align: center; padding: 40px 20px;">
            <div class="success-icon" style="font-size: 80px; margin-bottom: 20px;">
                ✅
            </div>
            <h2 style="color: #2ecc71; margin-bottom: 10px;">提交成功！</h2>
            <p style="font-size: 1.1rem; color: #333; margin-bottom: 30px;">
                感謝 <strong>${userName}</strong>！<br>
                您已成功報名${regionText}，
            </p>
            
            <div style="margin: 30px auto; max-width: 500px;">
                <h3 style="color: #333; margin-bottom: 20px; font-size: 1.3rem; text-align: center;">🎉 立即聯繫我們</h3>
                
                <!-- LINE 區塊 -->
                <div class="contact-section" style="background: linear-gradient(135deg, #06C755 0%, #00B900 100%); padding: 25px; border-radius: 15px; box-shadow: 0 4px 15px rgba(6, 199, 85, 0.3);">
                    <h4 style="color: white; margin-bottom: 15px; font-size: 1.1rem;">
                        💬 透過 LINE 聯繫
                    </h4>
                    <div class="qr-code-container" style="background: white; padding: 20px; border-radius: 10px; display: inline-block; margin-bottom: 10px;">
                        <img src="https://ifittw01-ai.github.io/AI-PT/data/line-qrcode.png?v=20260629b" alt="LINE QR Code" style="width: 180px; height: 180px; display: block;" onerror="this.style.display='none'; this.parentElement.innerHTML='<p style=color:#666;padding:20px>QR Code 載入中...</p>'">
                    </div>
                    <p style="color: white; font-size: 0.9rem; opacity: 0.95; margin-top: 10px;">
                        掃描 QR Code 加入 LINE<br>
                        (密碼:13579)
                    </p>
                </div>
                
                <p style="color: #666; font-size: 0.9rem; text-align: center; margin-top: 20px;">
                    ⚡ 掃描 LINE QR Code，我們將立即為您服務
                </p>
            </div>
            
            <button onclick="location.reload()" style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; border: none; padding: 15px 40px; font-size: 1.1rem; border-radius: 30px; cursor: pointer; margin-top: 20px; box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);">
                關閉
            </button>
        </div>
    `;
    
    // 滾動到彈窗頂部
    setTimeout(() => {
        modalContent.scrollTop = 0;
    }, 100);
}

// 初始化模态框事件
function initModal() {
    const modal = document.getElementById('orderModal');
    const closeBtn = document.querySelector('.close-modal');
    
    // 点击关闭按钮
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // 点击模态框外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
}

// ========================================
// 資料儲存功能
// ========================================

// Google Apps Script 部署 URL（全局变量）
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby-SRUPX2o3Lb0c953ohR7B6IzUdZ-vFYfzcbqkPZ_mujLMmsAWoBxTbWxAHiKcPnQt/exec';

// LocalStorage 資料管理
const STORAGE_KEY = 'customerLeads';

// 儲存資料到 localStorage（本地備份）
function saveToLocalStorage(data) {
    try {
        // 取得現有資料
        let leads = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        
        // 加入新資料
        const newLead = {
            id: Date.now(), // 使用時間戳作為 ID
            ...data,
            createdAt: new Date().toISOString()
        };
        
        leads.push(newLead);
        
        // 儲存回 localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
        
        return { success: true, data: newLead };
    } catch (error) {
        console.error('本地儲存失敗:', error);
        return { success: false, error: error.message };
    }
}

// 提交資料到 Google 表單
async function submitToGoogleForm(data) {
    try {
        // 建立表單提交網址（使用 /d/e/ 格式，因為 Form ID 是從預填連結取得）
        const formUrl = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_CONFIG.formId}/formResponse`;
        
        // 準備表單資料
        const formData = new FormData();
        
        // 添加必填欄位資料
        if (GOOGLE_FORM_CONFIG.fields.fullName && data.fullName) {
            formData.append(GOOGLE_FORM_CONFIG.fields.fullName, data.fullName);
        }
        if (GOOGLE_FORM_CONFIG.fields.email && data.email) {
            formData.append(GOOGLE_FORM_CONFIG.fields.email, data.email);
        }
        if (GOOGLE_FORM_CONFIG.fields.phone && data.phone) {
            formData.append(GOOGLE_FORM_CONFIG.fields.phone, data.phone);
        }
        if (GOOGLE_FORM_CONFIG.fields.country && data.country) {
            formData.append(GOOGLE_FORM_CONFIG.fields.country, COUNTRY_NAMES[data.country] || data.country);
        }
        if (GOOGLE_FORM_CONFIG.fields.industry && data.industry) {
            formData.append(GOOGLE_FORM_CONFIG.fields.industry, INDUSTRY_NAMES[data.industry] || data.industry);
        }
        
        // 添加選填字段：地區、LINE ID 和 WhatsApp
        if (GOOGLE_FORM_CONFIG.fields.region && data.region) {
            formData.append(GOOGLE_FORM_CONFIG.fields.region, REGION_NAMES[data.region] || data.region);
        }
        if (GOOGLE_FORM_CONFIG.fields.lineId && data.lineId && data.lineId !== '未提供') {
            formData.append(GOOGLE_FORM_CONFIG.fields.lineId, data.lineId);
        }
        if (GOOGLE_FORM_CONFIG.fields.whatsapp && data.whatsapp && data.whatsapp !== '未提供') {
            formData.append(GOOGLE_FORM_CONFIG.fields.whatsapp, data.whatsapp);
        }
        
        console.log('📤 正在提交資料到 Google 表單...');
        console.log('表單 URL:', formUrl);
        
        // 打印所有要提交的資料（用於調試）
        console.log('=== 📋 提交的表單資料 ===');
        for (let [key, value] of formData.entries()) {
            console.log(`  ${key}: "${value}"`);
        }
        console.log('========================');
        
        // 使用 no-cors 模式提交（Google Forms 不允許讀取回應，但會正常提交）
        await fetch(formUrl, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
        });
        
        console.log('✅ 資料已成功提交到 Google 表單！');
        return { success: true };
    } catch (error) {
        console.error('❌ Google 表單提交失敗:', error);
        return { success: false, error: error.message };
    }
}

// 處理表單提交（使用 Google Apps Script，支援動態推廣郵箱）
function initOrderForm() {
    const form = document.getElementById('orderForm');
    const submitBtn = document.getElementById('submitBtn');
    
    updateSubmitButtonState();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateOrderFormSelections()) {
            return;
        }

        // 驗證表單
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // 顯示載入狀態
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳ 處理中...</span>';
        
        // 獲取用戶名稱
        const userName = form.querySelector('[name="姓名"]').value;
        
        // 🎯 添加推廣代碼到表單（Google Script 會根據此判斷通知郵箱）
        const refCode = getReferralCode();
        
        console.log('🔖 推廣代碼:', refCode || '無');
        
        // 準備表單資料
        const formData = new FormData(form);
        
        // 行業（下拉選單送完整文字）
        const industrySelect = document.getElementById('industry');
        if (industrySelect && industrySelect.selectedIndex > 0) {
            const industryText = industrySelect.options[industrySelect.selectedIndex].text;
            formData.set('行業', industryText);
        }
        
        // 國家 / 評估地區（卡片選取，明確寫入 FormData）
        const countryValue = document.getElementById('country')?.value?.trim() || '';
        const userRegion = document.getElementById('region')?.value?.trim() || '';
        formData.set('國家地區', countryValue);
        formData.set('評估地區', userRegion);
        
        // 添加推廣代碼
        if (refCode) {
            formData.append('推廣代碼', refCode);
        }
        formData.append('ref', refCode || '');
        
        // 🔍 調試：打印所有提交的資料
        console.log('=== 📋 準備提交的表單資料 ===');
        for (let [key, value] of formData.entries()) {
            console.log(`  ${key}: "${value}"`);
        }
        console.log('========================');
        
        try {
            console.log('📤 正在提交到 Google Apps Script...');
            
            // 提交到 Google Apps Script
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ 提交成功！');
                
                // 顯示成功頁面
                showSuccessPage(userName, userRegion);
                resetOrderFormAfterSubmit();
            } else {
                console.error('❌ 提交失敗:', result.message);
                alert('❌ 提交失敗，請稍後再試或直接透過 LINE 聯繫我們\n\n錯誤: ' + result.message);
            }
        } catch (error) {
            console.error('⚠️ 提交錯誤:', error);
            alert('❌ 網路錯誤，請檢查網路連接後重試');
        } finally {
            submitBtn.innerHTML = '<span>📝 提交資料</span>';
            updateSubmitButtonState();
        }
    });
}

// 平滑滚动
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 滚动动画效果
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // 为各个区块添加动画
    const animatedElements = document.querySelectorAll(
        '.audience-card, .case-card, .testimonial-card, .included-item, .scenario-item'
    );

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// 添加视频播放追踪和覆盖层控制
function initVideoTracking() {
    const video = document.getElementById('mainVideo');
    const overlay = document.getElementById('videoOverlay');
    
    if (video && overlay) {
        // 視頻開始播放時隱藏覆蓋層
        video.addEventListener('play', () => {
            console.log('Video started playing');
            overlay.classList.add('hidden');
            // 这里可以添加分析追踪代码
        });

        // 視頻暫停時顯示覆蓋層
        video.addEventListener('pause', () => {
            console.log('Video paused');
            overlay.classList.remove('hidden');
        });

        // 視頻結束時顯示覆蓋層
        video.addEventListener('ended', () => {
            console.log('Video finished');
            overlay.classList.remove('hidden');
            // 视频结束后可以显示特别优惠等
        });

        // 當視頻從頭開始時確保覆蓋層可見
        video.addEventListener('loadeddata', () => {
            overlay.classList.remove('hidden');
        });
    }
}

// 页面加载时初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    // 🌐 先初始化語言（必須最先執行）
    initLanguage();
    
    initCountdown();
    initFAQ();
    initCTAButtons();
    initModal();
    initOrderForm();
    initSmoothScroll();
    initScrollAnimations();
    initVideoTracking();
    
    // 🆕 初始化國家-地區聯動（預設台灣並載入地點）
    initCountryRegionSync();
});

// 监听页面可见性变化，暂停/恢复倒计时
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page is hidden');
    } else {
        console.log('Page is visible');
        // 重新初始化倒计时以确保准确性
        initCountdown();
    }
});

// ========================================
// 卡片式選項輔助
// ========================================
let regionsLoading = false;

function updateSubmitButtonState() {
    const submitBtn = document.getElementById('submitBtn');
    const countryHidden = document.getElementById('country');
    const regionHidden = document.getElementById('region');
    if (!submitBtn) return;

    const canSubmit = !regionsLoading
        && Boolean(countryHidden?.value?.trim())
        && Boolean(regionHidden?.value?.trim());

    submitBtn.disabled = !canSubmit;
}

function validateOrderFormSelections() {
    const countryHidden = document.getElementById('country');
    const regionHidden = document.getElementById('region');
    const regionCards = document.getElementById('regionCards');

    if (!countryHidden?.value?.trim()) {
        alert('請選擇國家/地區');
        return false;
    }
    if (regionsLoading) {
        alert('評估地點載入中，請稍候再提交');
        return false;
    }
    if (!regionHidden?.value?.trim()) {
        regionCards?.classList.add('option-cards--error');
        regionCards?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        alert('請選擇希望評估的時間地點');
        return false;
    }

    regionCards?.classList.remove('option-cards--error');
    return true;
}

function resetOrderFormAfterSubmit() {
    const form = document.getElementById('orderForm');
    const regionCards = document.getElementById('regionCards');

    form?.reset();
    regionCards?.classList.remove('option-cards--error');
    regionCards?.querySelectorAll('.option-card').forEach(btn => {
        btn.classList.remove('selected');
        btn.setAttribute('aria-pressed', 'false');
    });

    selectCountry('TW');
}

function getFormI18n(key, fallback = '') {
    const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'zh-TW';
    const dict = typeof translations !== 'undefined' ? (translations[lang] || translations['zh-TW']) : {};
    return dict[key] || fallback;
}

function setCardSelection(container, selectedBtn) {
    container.querySelectorAll('.option-card').forEach(btn => {
        const isSelected = btn === selectedBtn;
        btn.classList.toggle('selected', isSelected);
        btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
}

function showRegionPlaceholder(messageKey, fallback) {
    const container = document.getElementById('regionCards');
    const hidden = document.getElementById('region');
    if (!container || !hidden) return;

    hidden.value = '';
    container.classList.add('is-disabled');
    container.innerHTML = `<p class="option-cards-placeholder" data-i18n="${messageKey}">${getFormI18n(messageKey, fallback)}</p>`;
}

function selectRegionCard(btn) {
    const container = document.getElementById('regionCards');
    const hidden = document.getElementById('region');
    if (!btn || !container || !hidden) return;

    const regionText = btn.textContent.trim();
    if (!regionText) return;

    hidden.value = regionText;
    setCardSelection(container, btn);
    container.classList.remove('option-cards--error');
    updateSubmitButtonState();
}

function renderRegionCards(regions) {
    const container = document.getElementById('regionCards');
    const hidden = document.getElementById('region');
    if (!container || !hidden) return;

    hidden.value = '';
    container.classList.remove('is-disabled', 'option-cards--error');
    container.innerHTML = '';

    const validRegions = regions.filter(region => region.text && String(region.text).trim());

    validRegions.forEach(region => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-card';
        btn.dataset.value = region.id;
        btn.textContent = region.text;
        btn.setAttribute('aria-pressed', 'false');
        btn.addEventListener('click', () => selectRegionCard(btn));
        container.appendChild(btn);
    });

    if (validRegions.length > 0) {
        const firstBtn = container.querySelector('.option-card');
        selectRegionCard(firstBtn);
    } else {
        updateSubmitButtonState();
    }
}

function getDefaultRegions(country) {
    if (country === 'MY') {
        return [{ id: 'my1', text: '待定 - 吉隆坡地點' }];
    }
    return [{ id: 'tw1', text: '待定 - 台灣地點' }];
}

// ========================================
// 動態加載評估地點（卡片，從 Google Apps Script）
// ========================================
async function loadRegionOptions(country = 'TW') {
    const container = document.getElementById('regionCards');
    if (!container) {
        console.warn('⚠️ 找不到評估地區卡片容器');
        return;
    }

    console.log('📍 正在載入評估地點...（國家: ' + country + '）');
    regionsLoading = true;
    updateSubmitButtonState();
    showRegionPlaceholder('form-region-loading', '載入中...');

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL + '?action=getRegions&country=' + country);
        const result = await response.json();

        if (result.success && result.regions && result.regions.length > 0) {
            renderRegionCards(result.regions);
            console.log('✅ 成功載入 ' + result.regions.length + ' 個評估地點（' + country + '）');
        } else {
            console.warn('⚠️ 載入評估地點失敗，使用預設選項');
            renderRegionCards(getDefaultRegions(country));
        }
    } catch (error) {
        console.error('❌ 載入評估地點錯誤:', error);
        renderRegionCards(getDefaultRegions(country));
    } finally {
        regionsLoading = false;
        updateSubmitButtonState();
    }
}

// ========================================
// 國家 / 評估地點卡片聯動
// ========================================
function selectCountry(countryCode) {
    const countryCards = document.getElementById('countryCards');
    const countryHidden = document.getElementById('country');
    const btn = countryCards?.querySelector(`.option-card[data-value="${countryCode}"]`);

    if (!btn || !countryHidden || !countryCards) return;

    const countryText = btn.textContent.trim();
    countryHidden.value = countryText;
    countryHidden.dataset.code = countryCode;
    setCardSelection(countryCards, btn);

    console.log('🌍 國家已選擇:', countryText, '(' + countryCode + ')');
    loadRegionOptions(countryCode);
}

function initCountryRegionSync() {
    const countryCards = document.getElementById('countryCards');

    if (!countryCards) {
        console.warn('⚠️ 找不到國家卡片元素');
        return;
    }

    countryCards.querySelectorAll('.option-card').forEach(btn => {
        if (!btn.classList.contains('selected')) {
            btn.setAttribute('aria-pressed', 'false');
        }
        btn.addEventListener('click', () => selectCountry(btn.dataset.value));
    });

    // 預設台灣並載入台灣評估地點
    selectCountry('TW');
    console.log('✅ 國家-地區卡片聯動已初始化（預設台灣）');
}

// 添加急迫感效果
function addUrgencyEffect() {
    const urgencyElements = document.querySelectorAll('.urgency-text, .urgency-badge');
    
    setInterval(() => {
        urgencyElements.forEach(el => {
            el.style.transform = 'scale(1.05)';
            setTimeout(() => {
                el.style.transform = 'scale(1)';
            }, 500);
        });
    }, 3000);
}

// 初始化急迫感效果
addUrgencyEffect();

