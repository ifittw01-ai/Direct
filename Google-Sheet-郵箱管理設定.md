# 🎯 Google Sheet 郵箱管理設定指南

使用 Google Sheet 管理推廣人員郵箱，**無需重新部署代碼**即可新增或修改推廣人員！

---

## 📋 第一步：創建 Google Sheet

### 1. 創建新的 Google Sheet

前往 [Google Sheets](https://sheets.google.com)，創建新的試算表：

**建議名稱：** `推廣人員郵箱管理`

### 2. 設置工作表結構

在第一個分頁（預設名稱：「工作表1」）：

#### 修改分頁名稱為：`推廣人員`

#### 設置欄位（第一列為標題）：

| A 欄 | B 欄 | C 欄 |
|------|------|------|
| **推廣代碼** | **郵箱** | **姓名** |
| jordantsai777 | jordantsai777@gmail.com | Jordan |
| jordantsai07 | jordantsai07@gmail.com | Jordan (備用) |
| 001 | cchaha888@gmail.com | 推廣夥伴001 |
| 002 | a0928127137@gmail.com | 推廣夥伴002 |
| 003 | peter.w2520701@gmail.com | Peter |
| 005 | gabi4507@gmail.com | Gabi |
| 006 | h0917995529@gmail.com | 推廣夥伴006 |
| 008 | rong20020804@gmail.com | Rong |
| 009 | amy75301@gmail.com | Amy |
| 010 | sasabreakfast@gmail.com | Sasa |

**說明：**
- **A 欄（推廣代碼）：** 必填，用於 `?ref=XXX` 的 URL 參數
- **B 欄（郵箱）：** 必填，接收客戶通知的郵箱
- **C 欄（姓名）：** 選填，方便管理識別

### 3. 取得 Google Sheet ID

打開你剛創建的 Google Sheet，查看網址：

```
https://docs.google.com/spreadsheets/d/【這裡就是 SHEET_ID】/edit
```

**範例：**
```
https://docs.google.com/spreadsheets/d/1vFBIC47zfEysQTALJYOM5tMGvAhp47XRMHT4qkQNGQo/edit
                                      ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                                      這段就是你的 SHEET_ID
```

**📝 複製並保存這個 ID！** 待會需要填入 Google Apps Script 中。

---

## ⚙️ 第二步：修改 Google Apps Script

### 1. 打開 Google Apps Script

前往 [Google Apps Script](https://script.google.com)

找到你的專案（之前部署的專案）

### 2. 替換代碼

將 `google-apps-script-updated.js` 的內容**完整複製**，貼到 `Code.gs` 中

### 3. 修改 SPREADSHEET_ID

找到第 22 行：

```javascript
const SPREADSHEET_ID = '請替換成你的SHEET_ID';  // ⚠️ 必須修改
```

替換成你剛才複製的 Google Sheet ID：

```javascript
const SPREADSHEET_ID = '1vFBIC47zfEysQTALJYOM5tMGvAhp47XRMHT4qkQNGQo';  // ✅ 已修改
```

### 4. 確認其他設定（通常不需要修改）

```javascript
const SHEET_NAME = '推廣人員';  // Sheet 分頁名稱
const DEFAULT_EMAIL = 'jordantsai777@gmail.com';  // 預設郵箱
const CACHE_DURATION = 600;  // 緩存 10 分鐘
```

### 5. 授權 Sheet 存取權限

點擊上方的「執行」按鈕 ▶️（選擇 `getEmailMapping` 函數）

第一次執行會要求授權：
1. 點擊「審查權限」
2. 選擇你的 Google 帳戶
3. 點擊「進階」→「前往（專案名稱）」
4. 點擊「允許」

### 6. 重新部署

1. 點擊右上角「部署」→「管理部署」
2. 點擊「✏️ 編輯」
3. 在「版本」選擇「新增版本」
4. 輸入說明：`使用 Google Sheet + 緩存管理郵箱`
5. 點擊「部署」

✅ **完成！** 現在系統會從 Google Sheet 讀取郵箱映射表。

---

## 🎉 第三步：測試與使用

### 測試緩存功能

在 Google Apps Script 中，點擊上方的函數選擇器，選擇 `getEmailMapping`，點擊執行：

**查看執行記錄：**
1. 點擊左側「執行作業」圖示
2. 查看最新的執行記錄
3. 第一次應該顯示：`📊 從 Google Sheet 讀取郵箱映射表...`
4. 再執行一次，應該顯示：`✅ 從緩存讀取郵箱映射表`

### 清除緩存（用於測試）

如果需要強制重新讀取 Sheet（例如：剛更新了資料），執行 `clearCache` 函數：

1. 選擇函數：`clearCache`
2. 點擊執行 ▶️
3. 查看記錄，應該顯示：`🗑️ 緩存已清除`

---

## 🚀 日常使用：添加新推廣人員

### 超級簡單！只需 3 步驟：

1. **打開 Google Sheet**
2. **在最後一列添加新資料：**
   - 推廣代碼（例如：`011`）
   - 郵箱（例如：`newpartner@gmail.com`）
   - 姓名（例如：`新夥伴`）
3. **儲存！** 🎉

**就這樣！** 10 分鐘內（緩存過期後）系統會自動讀取新資料。

**想要立即生效？** 在 Google Apps Script 執行 `clearCache` 函數即可！

---

## 📊 優勢總結

### ✅ 使用 Google Sheet 管理的好處

| 項目 | 舊方式（硬編碼） | 新方式（Sheet） |
|------|-----------------|----------------|
| 新增推廣人員 | 需修改代碼 + 重新部署 | 只需在 Sheet 新增一列 |
| 修改郵箱 | 需修改代碼 + 重新部署 | 只需在 Sheet 修改 |
| 刪除推廣人員 | 需修改代碼 + 重新部署 | 只需在 Sheet 刪除該列 |
| 授權他人管理 | 需分享 Script 權限 | 只需分享 Sheet 權限 |
| 查看所有推廣人員 | 需查看代碼 | 直接看 Sheet |
| 性能 | 最快 (~0.1秒) | 幾乎一樣快 (~0.1-0.2秒) |

### 🎯 緩存機制說明

- **第一次請求：** 從 Sheet 讀取（~0.5-1 秒）
- **接下來 10 分鐘內的請求：** 從緩存讀取（~0.1 秒）⚡
- **緩存過期後：** 自動重新讀取 Sheet 並更新緩存

**結果：** 99% 的請求都超快速！ 🚀

---

## 🔧 進階設定

### 調整緩存時間

在 `google-apps-script-updated.js` 第 25 行：

```javascript
const CACHE_DURATION = 600;  // 600 秒 = 10 分鐘
```

**建議值：**
- **測試期間：** `60`（1 分鐘）→ 方便快速測試
- **正式運行：** `600`（10 分鐘）→ 平衡性能與即時性
- **不常變動：** `3600`（1 小時）→ 最佳性能

### 修改 Sheet 名稱

如果你的分頁不叫「推廣人員」，修改第 23 行：

```javascript
const SHEET_NAME = '你的分頁名稱';
```

---

## ❓ 常見問題

### Q1: 更新 Sheet 後多久生效？

**A:** 最多 10 分鐘（緩存過期時間）。想要立即生效，執行 `clearCache` 函數。

### Q2: 如果 Sheet 讀取失敗會怎樣？

**A:** 系統會自動使用預設郵箱 `jordantsai777@gmail.com`，確保不會遺失客戶。

### Q3: 可以給其他人編輯 Sheet 的權限嗎？

**A:** 可以！點擊 Sheet 右上角「共用」，添加協作者即可。他們可以直接修改推廣人員資料。

### Q4: 如何確認系統正在使用 Sheet？

**A:** 提交測試表單後，前往 Google Apps Script → 執行作業，查看記錄中是否有：
- `📊 從 Google Sheet 讀取郵箱映射表...` 或
- `✅ 從緩存讀取郵箱映射表`

### Q5: 要備份嗎？

**A:** Google Sheet 自動保存版本歷史記錄。但建議定期匯出一份 CSV 備份。

---

## 📞 需要幫助？

如有問題，請檢查：

1. ✅ SPREADSHEET_ID 是否正確
2. ✅ Sheet 分頁名稱是否為「推廣人員」
3. ✅ 第一列是否為標題（推廣代碼 | 郵箱 | 姓名）
4. ✅ Google Apps Script 是否已授權存取 Sheet
5. ✅ 是否已重新部署

---

🎉 **恭喜！你現在可以輕鬆管理推廣人員郵箱了！**

