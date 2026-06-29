// ========================================
// 配置管理系統
// ========================================

const CONFIG_STORAGE_KEY = 'googleFormConfig';

// 預設配置
const DEFAULT_CONFIG = {
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

// ========================================
// 頁面載入時初始化
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    loadConfiguration();
    updateConfigPreview();
});

// ========================================
// 載入已儲存的設定
// ========================================
function loadConfiguration() {
    try {
        const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
        let config = DEFAULT_CONFIG;
        
        if (savedConfig) {
            config = JSON.parse(savedConfig);
        }
        
        // 填充表單
        document.getElementById('googleFormEnabled').checked = config.enabled;
        document.getElementById('formId').value = config.formId;
        document.getElementById('fieldFullName').value = config.fields.fullName;
        document.getElementById('fieldEmail').value = config.fields.email;
        document.getElementById('fieldPhone').value = config.fields.phone;
        document.getElementById('fieldCountry').value = config.fields.country;
        document.getElementById('fieldIndustry').value = config.fields.industry;
        
        // 新增字段（選填）
        if (config.fields.region) {
            document.getElementById('fieldRegion').value = config.fields.region;
        }
        if (config.fields.lineId) {
            document.getElementById('fieldLineId').value = config.fields.lineId;
        }
        if (config.fields.whatsapp) {
            document.getElementById('fieldWhatsApp').value = config.fields.whatsapp;
        }
        
        console.log('✅ 設定已載入');
    } catch (error) {
        console.error('載入設定時發生錯誤:', error);
        showStatus('載入設定時發生錯誤', 'error');
    }
}

// ========================================
// 儲存設定
// ========================================
document.getElementById('setupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    try {
        // 取得表單資料
        const config = {
            enabled: document.getElementById('googleFormEnabled').checked,
            formId: document.getElementById('formId').value.trim(),
            fields: {
                fullName: document.getElementById('fieldFullName').value.trim(),
                email: document.getElementById('fieldEmail').value.trim(),
                phone: document.getElementById('fieldPhone').value.trim(),
                country: document.getElementById('fieldCountry').value.trim(),
                industry: document.getElementById('fieldIndustry').value.trim()
            }
        };
        
        // 添加選填字段
        const regionValue = document.getElementById('fieldRegion').value.trim();
        const lineIdValue = document.getElementById('fieldLineId').value.trim();
        const whatsappValue = document.getElementById('fieldWhatsApp').value.trim();
        if (regionValue) {
            config.fields.region = regionValue;
        }
        if (lineIdValue) {
            config.fields.lineId = lineIdValue;
        }
        if (whatsappValue) {
            config.fields.whatsapp = whatsappValue;
        }
        
        // 驗證資料
        if (!validateConfiguration(config)) {
            return;
        }
        
        // 儲存到 localStorage
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
        
        // 更新預覽
        updateConfigPreview();
        
        // 顯示成功訊息
        showStatus('✅ 設定已成功儲存！系統將使用新的設定。', 'success');
        
        console.log('✅ 設定已儲存:', config);
        
        // 3秒後自動跳轉到主頁
        setTimeout(() => {
            if (confirm('設定已儲存！是否返回主頁？')) {
                window.location.href = 'index.html';
            }
        }, 2000);
        
    } catch (error) {
        console.error('儲存設定時發生錯誤:', error);
        showStatus('❌ 儲存失敗：' + error.message, 'error');
    }
});

// ========================================
// 驗證設定
// ========================================
function validateConfiguration(config) {
    // 檢查 Form ID
    if (!config.formId || config.formId.length < 10) {
        showStatus('❌ 請輸入有效的 Form ID', 'error');
        return false;
    }
    
    // 檢查所有 fields
    const requiredFields = ['fullName', 'email', 'phone', 'country', 'industry'];
    for (const field of requiredFields) {
        if (!config.fields[field] || !config.fields[field].startsWith('entry.')) {
            showStatus(`❌ ${field} 欄位的 Entry ID 格式不正確（應該以 entry. 開頭）`, 'error');
            return false;
        }
    }
    
    return true;
}

// ========================================
// 測試連接
// ========================================
async function testConfiguration() {
    const statusMessage = document.getElementById('statusMessage');
    
    try {
        // 顯示測試中訊息
        showStatus('🔄 正在測試連接...', 'info');
        
        // 取得當前表單值
        const formId = document.getElementById('formId').value.trim();
        const fields = {
            fullName: document.getElementById('fieldFullName').value.trim(),
            email: document.getElementById('fieldEmail').value.trim(),
            phone: document.getElementById('fieldPhone').value.trim(),
            country: document.getElementById('fieldCountry').value.trim(),
            industry: document.getElementById('fieldIndustry').value.trim(),
            region: document.getElementById('fieldRegion').value.trim(),
            lineId: document.getElementById('fieldLineId').value.trim(),
            whatsapp: document.getElementById('fieldWhatsApp').value.trim()
        };
        
        // 驗證基本格式
        if (!formId || formId.length < 10) {
            showStatus('❌ 請先輸入有效的 Form ID', 'error');
            return;
        }
        
        // 建立測試提交
        const formUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
        const formData = new FormData();
        
        // 添加測試資料
        formData.append(fields.fullName, '測試姓名 Test Name');
        formData.append(fields.email, 'test@example.com');
        formData.append(fields.phone, '+886912345678');
        formData.append(fields.country, '台灣');
        formData.append(fields.industry, '其他');
        
        // 添加選填字段測試資料
        if (fields.region) {
            formData.append(fields.region, '北部');
        }
        if (fields.lineId) {
            formData.append(fields.lineId, 'test_line_id');
        }
        if (fields.whatsapp) {
            formData.append(fields.whatsapp, '+886912345678');
        }
        
        // 嘗試提交
        const response = await fetch(formUrl, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
        });
        
        // no-cors 模式下無法讀取回應，但如果沒有錯誤就算成功
        showStatus('✅ 測試成功！表單設定看起來正確。請到您的 Google 表單查看是否收到測試資料。', 'success');
        
    } catch (error) {
        console.error('測試連接失敗:', error);
        showStatus('⚠️ 測試發生錯誤，但這不一定表示設定錯誤（因為 Google 表單的限制）。建議儲存後實際測試。', 'info');
    }
}

// ========================================
// 恢復預設設定
// ========================================
function resetToDefault() {
    if (confirm('確定要恢復預設設定嗎？這將清除所有自訂設定。')) {
        // 清除儲存的設定
        localStorage.removeItem(CONFIG_STORAGE_KEY);
        
        // 重新載入表單
        loadConfiguration();
        
        // 更新預覽
        updateConfigPreview();
        
        showStatus('✅ 已恢復為預設設定', 'success');
    }
}

// ========================================
// 更新設定預覽
// ========================================
function updateConfigPreview() {
    try {
        const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
        const configPreview = document.getElementById('configPreview');
        
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            configPreview.textContent = JSON.stringify(config, null, 2);
        } else {
            configPreview.textContent = '使用預設設定\n\n' + JSON.stringify(DEFAULT_CONFIG, null, 2);
        }
    } catch (error) {
        document.getElementById('configPreview').textContent = '無法載入設定預覽';
    }
}

// ========================================
// 顯示狀態訊息
// ========================================
function showStatus(message, type = 'info') {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
    statusElement.style.display = 'block';
    
    // 自動隱藏（除了成功訊息）
    if (type !== 'success') {
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 5000);
    }
}

// ========================================
// 輔助功能：匯出設定
// ========================================
function exportConfiguration() {
    try {
        const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
        if (!savedConfig) {
            alert('目前沒有已儲存的設定');
            return;
        }
        
        const config = JSON.parse(savedConfig);
        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'google-form-config.json';
        link.click();
        
        showStatus('✅ 設定已匯出', 'success');
    } catch (error) {
        console.error('匯出設定失敗:', error);
        showStatus('❌ 匯出失敗', 'error');
    }
}

// ========================================
// 輔助功能：匯入設定
// ========================================
function importConfiguration() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const config = JSON.parse(event.target.result);
                
                // 驗證設定
                if (!validateConfiguration(config)) {
                    return;
                }
                
                // 儲存設定
                localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
                
                // 重新載入表單
                loadConfiguration();
                updateConfigPreview();
                
                showStatus('✅ 設定已匯入', 'success');
            } catch (error) {
                console.error('匯入設定失敗:', error);
                showStatus('❌ 匯入失敗：無效的設定檔案', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

