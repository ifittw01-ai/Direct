// ========================================
// Google Apps Script - 處理表單提交並發送郵件 (使用 Google Sheet + 緩存)
// ========================================
// 部署說明：
// 1. 創建 Google Sheet，命名為「推廣人員郵箱管理」
//    第一列為標題：推廣代碼 | 郵箱 | 姓名（選填）
//    從第二列開始填入資料
// 2. 前往 https://script.google.com
// 3. 找到你現有的專案（或創建新專案）
// 4. 將此代碼複製到 Code.gs 中
// 5. 修改下方的 SPREADSHEET_ID 為你的 Google Sheet ID
// 6. 部署為網頁應用程式
// 7. 授權存取權限
// 8. 複製網頁應用程式 URL 到 script.js 的 GOOGLE_SCRIPT_URL

// ========================================
// 配置設定
// ========================================
// ⚠️ 請將下方的 SPREADSHEET_ID 改為你的 Google Sheet ID
// 如何取得？打開你的 Google Sheet，網址中的長串英數字即為 ID
// 例如：https://docs.google.com/spreadsheets/d/【這裡就是ID】/edit
const SPREADSHEET_ID = '1vFBIC47zfEysQTALJYOM5tMGvAhp47XRMHT4qkQNGQo';  // ⚠️ 必須修改
const SHEET_NAME = '推廣人員';  // Sheet 分頁名稱（第1個頁簽）
const DEFAULT_EMAIL = 'jordantsai777@gmail.com';  // 預設郵箱（找不到推廣代碼時使用）
const CACHE_DURATION = 600;  // 緩存時間（秒）- 10 分鐘
const CUSTOMER_SHEET_NAME = '客戶報名記錄';
const CUSTOMER_HEADERS = [
  '報名時間', '客戶姓名', '電話號碼', '電子郵件', '國家地區',
  '行業', '評估地點', 'LINE ID', 'WhatsApp', '推廣代碼'
];

function ensureCustomerSheet(spreadsheet) {
  let dataSheet = spreadsheet.getSheetByName(CUSTOMER_SHEET_NAME);

  if (!dataSheet) {
    dataSheet = spreadsheet.insertSheet(CUSTOMER_SHEET_NAME);
    dataSheet.setFrozenRows(1);
  }

  dataSheet.getRange(1, 1, 1, CUSTOMER_HEADERS.length).setValues([CUSTOMER_HEADERS]);

  const extraColumns = dataSheet.getMaxColumns() - CUSTOMER_HEADERS.length;
  if (extraColumns > 0) {
    dataSheet.deleteColumns(CUSTOMER_HEADERS.length + 1, extraColumns);
  }

  return dataSheet;
}

function createCustomerSheetBackup_(spreadsheet, sourceSheet) {
  const timeZone = Session.getScriptTimeZone() || 'Asia/Taipei';
  const timestamp = Utilities.formatDate(new Date(), timeZone, 'yyyyMMdd_HHmmss');
  let backupName = CUSTOMER_SHEET_NAME + '_修正前備份_' + timestamp;

  if (spreadsheet.getSheetByName(backupName)) {
    backupName += '_' + new Date().getTime();
  }

  const backupSheet = sourceSheet.copyTo(spreadsheet);
  backupSheet.setName(backupName);
  spreadsheet.setActiveSheet(sourceSheet);

  return backupName;
}

function isEmailLike_(value) {
  const text = String(value || '').trim();
  return text.includes('@');
}

function isBlank_(value) {
  return String(value || '').trim() === '';
}

function isPhoneLike_(value) {
  const text = String(value || '').trim();
  if (!text || text.includes('@')) return false;

  const digitCount = text.replace(/\D/g, '').length;
  if (digitCount < 3) return false;

  return /^[\d\s()+\-#.]+$/.test(text);
}

// ========================================
// 一次性修復：修正舊資料中 C/D 欄寫反或 Email 落在 C 欄的資料
// ========================================
function repairSwappedPhoneEmailColumns() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(CUSTOMER_SHEET_NAME);

  if (!sheet) {
    throw new Error('找不到工作表：' + CUSTOMER_SHEET_NAME);
  }

  const backupName = createCustomerSheetBackup_(spreadsheet, sheet);
  const lastRow = sheet.getLastRow();
  const totalChecked = Math.max(lastRow - 1, 0);
  const fixedRows = [];
  const swappedRows = [];
  const movedEmailOnlyRows = [];

  if (totalChecked === 0) {
    const result = {
      backupSheet: backupName,
      totalChecked: 0,
      fixedCount: 0,
      fixedRows: [],
      swappedRows: [],
      movedEmailOnlyRows: []
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  // 從第 2 列開始檢查 C 欄（電話號碼）與 D 欄（電子郵件）
  const values = sheet.getRange(2, 3, totalChecked, 2).getValues();

  values.forEach((row, index) => {
    const phoneColumnValue = row[0];
    const emailColumnValue = row[1];
    const sheetRowNumber = index + 2;

    if (isEmailLike_(phoneColumnValue) && isPhoneLike_(emailColumnValue)) {
      // C 是 Email、D 是電話：兩欄對調
      sheet.getRange(sheetRowNumber, 3, 1, 2).setValues([[
        emailColumnValue,
        phoneColumnValue
      ]]);
      fixedRows.push(sheetRowNumber);
      swappedRows.push(sheetRowNumber);
    } else if (isEmailLike_(phoneColumnValue) && isBlank_(emailColumnValue)) {
      // C 是 Email、D 空白：Email 移到 D，C 清空
      sheet.getRange(sheetRowNumber, 3, 1, 2).setValues([[
        '',
        phoneColumnValue
      ]]);
      fixedRows.push(sheetRowNumber);
      movedEmailOnlyRows.push(sheetRowNumber);
    }
  });

  const result = {
    backupSheet: backupName,
    totalChecked: totalChecked,
    fixedCount: fixedRows.length,
    fixedRows: fixedRows,
    swappedRows: swappedRows,
    movedEmailOnlyRows: movedEmailOnlyRows
  };

  Logger.log('✅ C/D 欄錯位修正完成');
  Logger.log('備份分頁：' + backupName);
  Logger.log('總共檢查：' + totalChecked + ' 筆資料');
  Logger.log('修正筆數：' + fixedRows.length);
  Logger.log('修正列：' + (fixedRows.length ? fixedRows.join(', ') : '無'));
  Logger.log('C/D 對調列：' + (swappedRows.length ? swappedRows.join(', ') : '無'));
  Logger.log('Email 從 C 移到 D、C 清空列：' + (movedEmailOnlyRows.length ? movedEmailOnlyRows.join(', ') : '無'));
  Logger.log(JSON.stringify(result));

  return result;
}

// ========================================
// 從 Google Sheet 讀取郵箱映射表（含緩存）
// ========================================
function getEmailMapping() {
  try {
    // 1. 先嘗試從緩存讀取
    const cache = CacheService.getScriptCache();
    const cachedData = cache.get('EMAIL_MAPPING');
    
    if (cachedData) {
      Logger.log('✅ 從緩存讀取郵箱映射表');
      return JSON.parse(cachedData);
    }
    
    // 2. 緩存過期，從 Sheet 讀取
    const mapping = getEmailMappingFromSheet();
    
    // 3. 存入緩存（10 分鐘）
    cache.put('EMAIL_MAPPING', JSON.stringify(mapping), CACHE_DURATION);
    
    return mapping;
    
  } catch (error) {
    Logger.log('❌ 讀取郵箱映射表失敗: ' + error);
    return {};
  }
}

// ========================================
// 直接從 Sheet 讀取郵箱映射表（不使用緩存）
// ========================================
function getEmailMappingFromSheet() {
  try {
    Logger.log('📊 從 Google Sheet 讀取郵箱映射表...');
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      Logger.log('❌ 找不到工作表: ' + SHEET_NAME);
      return {};
    }
    
    const data = sheet.getDataRange().getValues();
    const mapping = {};
    
    // 從第二列開始讀取（第一列是標題）
    for (let i = 1; i < data.length; i++) {
      const refCode = String(data[i][0]).trim();  // 第一欄：推廣代碼
      const email = String(data[i][1]).trim();     // 第二欄：郵箱
      
      if (refCode && email) {
        mapping[refCode] = email;
      }
    }
    
    Logger.log('✅ 成功讀取 ' + Object.keys(mapping).length + ' 個推廣代碼');
    return mapping;
    
  } catch (error) {
    Logger.log('❌ 讀取郵箱映射表失敗: ' + error);
    Logger.log('⚠️ 請檢查 SPREADSHEET_ID 是否正確');
    return {};
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
// 手動清除緩存（用於測試）
// ========================================
function clearCache() {
  const cache = CacheService.getScriptCache();
  cache.remove('EMAIL_MAPPING');
  Logger.log('🗑️ 緩存已清除');
}

// ========================================
// 主函數 - 處理 POST 請求
// ========================================
function doPost(e) {
  try {
    // 解析表單數據
    const params = e.parameter;
    
    // 獲取推廣代碼和目標郵箱（從 Google Sheet 讀取）
    const refCode = params.ref || params['推廣代碼'] || '';
    const notificationEmail = getNotificationEmail(refCode);
    
    // 獲取客戶資料
    const customerName = params['姓名'] || '';
    const customerEmail = params['電子郵件'] || '';
    const customerPhone = params['電話號碼'] || params['電話'] || '';
    const customerCountry = params['國家地區'] || '';
    const customerIndustry = params['行業'] || '';
    const customerRegion = params['評估地區'] || '';
    const customerLineId = params['LINE_ID'] || params['LINE ID'] || '未提供';
    const customerWhatsapp = params['WhatsApp號碼'] || params['WhatsApp'] || '未提供';
    
    // 記錄日誌
    Logger.log('📧 準備處理表單提交...');
    Logger.log('推廣代碼: ' + refCode);
    Logger.log('目標郵箱: ' + notificationEmail);
    Logger.log('客戶姓名: ' + customerName);
    Logger.log('客戶郵箱: ' + customerEmail);
    Logger.log('客戶電話: ' + customerPhone);
    Logger.log('國家地區: ' + customerCountry);
    Logger.log('行業: ' + customerIndustry);
    Logger.log('評估地區: ' + customerRegion);
    Logger.log('LINE ID: ' + customerLineId);
    Logger.log('WhatsApp: ' + customerWhatsapp);
    
    // ========================================
    // 1. 保存到 Google Sheet
    // ========================================
    try {
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      const dataSheet = ensureCustomerSheet(spreadsheet);
      
      dataSheet.appendRow([
        new Date(),
        customerName,
        customerPhone,
        customerEmail,
        customerCountry,
        customerIndustry,
        customerRegion,
        customerLineId,
        customerWhatsapp,
        refCode
      ]);
      
      Logger.log('✅ 數據已保存到 Google Sheet');
    } catch (error) {
      Logger.log('❌ 保存數據失敗: ' + error);
    }
    
    // ========================================
    // 2. 發送通知郵件給推廣人員
    // ========================================
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
    
    // ========================================
    // 3. 發送確認郵件給報名客戶
    // ========================================
    if (customerEmail) {
      const customerSubject = `感謝您報名「直球對決」`;
      
      // 準備地區信息顯示
      const regionInfo = customerRegion ? `\n\n記得您的時間與地址：${customerRegion}` : '';
      
      const customerBody = `
${customerName}，

感謝您對「直球對決」有興趣！${regionInfo}

歡迎您的到來！

如欲詢問問題，請點選以下連結加入官方社群：
👉 https://line.me/ti/g2/lwbHM8cXtERXRSpCKRNz1q7769jgTxzsKA7iTw?utm_source=invitation&utm_medium=link_copy&utm_campaign=default

🔑 密碼：13579

我們期待與您在社群中見面，一起見證人生的改變！🚀

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
    
    // 返回成功響應
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
// 處理 GET 請求 - 獲取評估地點列表（根據國家）
// ========================================
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getRegions') {
      // 獲取國家參數（默認為台灣）
      const country = e.parameter.country || 'TW';
      
      Logger.log('📍 獲取評估地點 - 國家: ' + country);
      
      // 從 Google Sheet 讀取評估地點
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheet = spreadsheet.getSheetByName('評估地點');
      
      if (!sheet) {
        Logger.log('❌ 找不到「評估地點」工作表');
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: '找不到評估地點工作表'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      const data = sheet.getDataRange().getValues();
      const regions = [];
      
      // 從第二列開始讀取
      // 表格結構：ID | 國家 | 地點描述 | 是否啟用
      for (let i = 1; i < data.length; i++) {
        const id = data[i][0];                          // 第1列：ID
        const regionCountry = String(data[i][1]).trim(); // 第2列：國家 (TW/MY)
        const description = data[i][2];                  // 第3列：地點描述
        const isActive = String(data[i][3]).trim();      // 第4列：是否啟用
        
        // 只返回匹配國家且啟用的地點
        const active = (isActive === '是' || isActive === 'yes' || isActive === 'YES' || 
                       isActive === 'true' || isActive === 'TRUE' || isActive === '1' ||
                       isActive === '');  // 空白也視為啟用
        
        if (id && regionCountry === country && description && active) {
          regions.push({
            id: String(id),
            text: String(description)
          });
        }
      }
      
      // 不需要排序，直接按照 Sheet 中的行順序顯示
      
      Logger.log('✅ 找到 ' + regions.length + ' 個地點（' + country + '）');
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        regions: regions,
        country: country
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 默認響應
    return ContentService.createTextOutput('Google Apps Script 正在運行！');
    
  } catch (error) {
    Logger.log('❌ doGet 錯誤: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: '錯誤: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
