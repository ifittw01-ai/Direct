// ========================================
// Google Apps Script - 增強版（支持動態評估地點管理）
// ========================================
// 新功能：
// 1. 從 Google Sheet 動態讀取評估地點
// 2. 支持排序、開始/結束日期、容量限制
// 3. 自動隱藏過期或額滿的選項
// 4. 多語言支持

// ========================================
// 配置設定
// ========================================
const SPREADSHEET_ID = '1YUeS99x4qoSX3A216en65AQJEcADUCPCXY6hAnEEKcg';  // ⚠️ 請修改為你的 Google Sheet ID
const SHEET_NAME_PROMOTERS = '推廣人員';  // 推廣人員工作表
const SHEET_NAME_REGIONS = '評估地點';    // 評估地點工作表
const DEFAULT_EMAIL = 'jordantsai777@gmail.com';
const CACHE_DURATION = 600;  // 緩存時間（秒）

// ========================================
// 從 Google Sheet 讀取郵箱映射表（含緩存）
// ========================================
function getEmailMapping() {
  try {
    const cache = CacheService.getScriptCache();
    const cachedData = cache.get('EMAIL_MAPPING');
    
    if (cachedData) {
      Logger.log('✅ 從緩存讀取郵箱映射表');
      return JSON.parse(cachedData);
    }
    
    Logger.log('📊 從 Google Sheet 讀取郵箱映射表...');
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME_PROMOTERS);
    
    if (!sheet) {
      Logger.log('❌ 找不到工作表: ' + SHEET_NAME_PROMOTERS);
      return {};
    }
    
    const data = sheet.getDataRange().getValues();
    const mapping = {};
    
    for (let i = 1; i < data.length; i++) {
      const refCode = String(data[i][0]).trim();
      const email = String(data[i][1]).trim();
      
      if (refCode && email) {
        mapping[refCode] = email;
      }
    }
    
    Logger.log('✅ 成功讀取 ' + Object.keys(mapping).length + ' 個推廣代碼');
    cache.put('EMAIL_MAPPING', JSON.stringify(mapping), CACHE_DURATION);
    
    return mapping;
    
  } catch (error) {
    Logger.log('❌ 讀取郵箱映射表失敗: ' + error);
    return {};
  }
}

// ========================================
// 獲取評估地點列表（增強版）
// ========================================
function getRegionList() {
  try {
    Logger.log('📍 正在讀取評估地點列表...');
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME_REGIONS);
    
    if (!sheet) {
      Logger.log('❌ 找不到工作表: ' + SHEET_NAME_REGIONS);
      Logger.log('💡 請在 Google Sheet 中創建「評估地點」工作表');
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    const regions = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 設置為今天 00:00
    
    // 從第二列開始讀取（第一列是標題）
    for (let i = 1; i < data.length; i++) {
      const id = String(data[i][0]).trim();              // A列：選項ID
      const sortOrder = data[i][1] || 999;               // B列：排序（數字越小越前面）
      const fullDesc = String(data[i][2]).trim();        // C列：完整描述
      const startDate = data[i][3];                      // D列：開始日期
      const endDate = data[i][4];                        // E列：結束日期
      const maxCapacity = data[i][5] || 0;               // F列：最大容量（0=無限制）
      const currentCount = data[i][6] || 0;              // G列：目前報名數
      const enabled = String(data[i][7]).trim();         // H列：是否啟用
      const language = String(data[i][8]).trim() || 'zh-TW';  // I列：語言
      
      // 檢查是否啟用
      if (enabled !== '是' || !id || !fullDesc) {
        continue;
      }
      
      // 檢查日期範圍
      let isInDateRange = true;
      if (startDate && startDate instanceof Date) {
        if (today < startDate) {
          Logger.log(`⏳ 選項 ${id} 尚未開始（開始日期：${startDate}）`);
          isInDateRange = false;
        }
      }
      if (endDate && endDate instanceof Date) {
        if (today > endDate) {
          Logger.log(`⏰ 選項 ${id} 已過期（結束日期：${endDate}）`);
          isInDateRange = false;
        }
      }
      
      if (!isInDateRange) {
        continue;
      }
      
      // 檢查容量
      let isFull = false;
      let availableSeats = 0;
      if (maxCapacity > 0) {
        availableSeats = maxCapacity - currentCount;
        if (availableSeats <= 0) {
          Logger.log(`🈵 選項 ${id} 已額滿（${currentCount}/${maxCapacity}）`);
          isFull = true;
          continue; // 跳過額滿的選項
        }
      }
      
      // 構建顯示文字（包含剩餘名額）
      let displayText = fullDesc;
      if (maxCapacity > 0 && availableSeats > 0) {
        if (availableSeats <= 5) {
          displayText += ` [僅剩 ${availableSeats} 個名額]`;
        } else {
          displayText += ` [剩餘 ${availableSeats} 個名額]`;
        }
      }
      
      regions.push({
        id: id,
        text: displayText,
        fullDesc: fullDesc,
        sortOrder: sortOrder,
        availableSeats: availableSeats,
        language: language
      });
    }
    
    // 按排序順序排列
    regions.sort((a, b) => a.sortOrder - b.sortOrder);
    
    Logger.log('✅ 成功讀取 ' + regions.length + ' 個評估地點');
    return regions;
    
  } catch (error) {
    Logger.log('❌ 讀取評估地點失敗: ' + error);
    Logger.log('詳細錯誤: ' + error.stack);
    return [];
  }
}

// ========================================
// 更新報名人數（當有人報名時）
// ========================================
function updateRegionCount(regionId) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME_REGIONS);
    
    if (!sheet) {
      Logger.log('❌ 找不到工作表: ' + SHEET_NAME_REGIONS);
      return false;
    }
    
    const data = sheet.getDataRange().getValues();
    
    // 找到對應的行並更新計數
    for (let i = 1; i < data.length; i++) {
      const id = String(data[i][0]).trim();
      
      if (id === regionId) {
        const currentCount = data[i][6] || 0;
        const newCount = Number(currentCount) + 1;
        
        // 更新 G 列（第 7 欄，目前報名數）
        sheet.getRange(i + 1, 7).setValue(newCount);
        
        Logger.log(`✅ 已更新地點 ${regionId} 的報名人數：${currentCount} → ${newCount}`);
        return true;
      }
    }
    
    Logger.log(`⚠️ 找不到地點 ID: ${regionId}`);
    return false;
    
  } catch (error) {
    Logger.log('❌ 更新報名人數失敗: ' + error);
    return false;
  }
}

// ========================================
// 根據推廣代碼獲取目標郵箱
// ========================================
function getNotificationEmail(refCode) {
  const emailMapping = getEmailMapping();
  const notificationEmail = emailMapping[refCode] || DEFAULT_EMAIL;
  
  Logger.log('🔍 推廣代碼: ' + (refCode || '無'));
  Logger.log('📧 目標郵箱: ' + notificationEmail);
  
  return notificationEmail;
}

// ========================================
// 處理 GET 請求 - 提供評估地點 API
// ========================================
function doGet(e) {
  try {
    const action = e.parameter.action;
    const lang = e.parameter.lang || 'zh-TW';
    
    // 獲取評估地點列表
    if (action === 'getRegions') {
      const allRegions = getRegionList();
      
      // 根據語言過濾（如果需要）
      const regions = allRegions.filter(r => !r.language || r.language === lang);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        regions: regions,
        count: regions.length
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 默認響應
    return ContentService.createTextOutput(
      'Google Apps Script 正在運行！\n\n' +
      '可用的 API：\n' +
      '- ?action=getRegions - 獲取評估地點列表\n' +
      '- ?action=getRegions&lang=zh-TW - 獲取指定語言的評估地點'
    );
    
  } catch (error) {
    Logger.log('❌ GET 請求處理失敗: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================================
// 處理 POST 請求 - 處理表單提交
// ========================================
function doPost(e) {
  try {
    const params = e.parameter;
    
    // 獲取推廣代碼和目標郵箱
    const refCode = params.ref || params['推廣代碼'] || '';
    const notificationEmail = getNotificationEmail(refCode);
    
    // 獲取客戶資料
    const customerName = params['姓名'] || '';
    const customerEmail = params['電子郵件'] || '';
    const customerPhone = params['電話號碼'] || params['電話'] || '';
    const customerCountry = params['國家地區'] || '';
    const customerIndustry = params['行業'] || '';
    const customerRegion = params['評估地區'] || '';
    const customerRegionId = params['評估地區ID'] || '';  // 新增：地區ID
    const customerLineId = params['LINE_ID'] || params['LINE ID'] || '未提供';
    const customerWhatsapp = params['WhatsApp號碼'] || params['WhatsApp'] || '未提供';
    
    Logger.log('📧 準備發送郵件...');
    Logger.log('推廣代碼: ' + refCode);
    Logger.log('目標郵箱: ' + notificationEmail);
    Logger.log('客戶姓名: ' + customerName);
    Logger.log('客戶郵箱: ' + customerEmail);
    Logger.log('客戶電話: ' + customerPhone);
    Logger.log('國家地區: ' + customerCountry);
    Logger.log('行業: ' + customerIndustry);
    Logger.log('評估地區: ' + customerRegion);
    Logger.log('地區ID: ' + customerRegionId);
    Logger.log('LINE ID: ' + customerLineId);
    Logger.log('WhatsApp: ' + customerWhatsapp);
    
    // 🆕 更新報名人數
    if (customerRegionId) {
      updateRegionCount(customerRegionId);
    }
    
    // 發送通知郵件給推廣人員
    const promoterSubject = `🎯 新客戶報名通知 - ${customerName}`;
    const promoterBody = `
親愛的推廣夥伴，

恭喜！您有一位新客戶報名了！

=== 📋 客戶資訊 ===
姓名：${customerName}
電子郵件：${customerEmail}
電話：${customerPhone}
國家地區：${customerCountry}
行業：${customerIndustry}
評估地區：${customerRegion}
LINE ID：${customerLineId}
WhatsApp：${customerWhatsapp}

推廣代碼：${refCode || '無（預設）'}

=== 📞 下一步行動 ===
請盡快聯繫這位客戶，提供優質的服務體驗！

建議聯繫方式：
📧 Email: ${customerEmail}
📱 WhatsApp: ${customerWhatsapp !== '未提供' ? customerWhatsapp : customerPhone}
💬 LINE: ${customerLineId}

祝您成交順利！🎉

---
直球對決
自動通知系統
    `.trim();
    
    try {
      MailApp.sendEmail({
        to: notificationEmail,
        subject: promoterSubject,
        body: promoterBody
      });
      Logger.log('✅ 已發送郵件給推廣人員: ' + notificationEmail);
    } catch (error) {
      Logger.log('❌ 發送推廣人員郵件失敗: ' + error);
    }
    
    // 發送確認郵件給報名客戶
    if (customerEmail) {
      const customerSubject = `感謝您報名「直球對決」`;
      const regionInfo = customerRegion ? `\n\n記得您的時間與地址：${customerRegion}` : '';
      
      const customerBody = `
${customerName}，

感謝您對「直球對決」有興趣！${regionInfo}

歡迎您的到來！

如欲詢問問題，請點選以下連結加入官方社群：
👉 https://line.me/ti/g2/lwbHM8cXtERXRSpCKRNz1q7769jgTxzsKA7iTw?utm_source=invitation&utm_medium=link_copy&utm_campaign=default

🔑 密碼：13579

我們期待與您在社群中見面，一起探索 AI 創業的無限可能！🚀

---
直球對決 團隊
      `.trim();
      
      try {
        MailApp.sendEmail({
          to: customerEmail,
          subject: customerSubject,
          body: customerBody
        });
        Logger.log('✅ 已發送確認郵件給客戶: ' + customerEmail);
      } catch (error) {
        Logger.log('❌ 發送客戶確認郵件失敗: ' + error);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: '提交成功！'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('❌ 處理失敗: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: '處理失敗: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================================
// 手動清除緩存（用於測試）
// ========================================
function clearCache() {
  const cache = CacheService.getScriptCache();
  cache.remove('EMAIL_MAPPING');
  Logger.log('🗑️ 緩存已清除');
}

