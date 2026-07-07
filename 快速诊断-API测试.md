# 🔬 API 快速诊断指南

## 步骤 1：测试 API 是否工作

在浏览器中打开：
```
https://script.google.com/macros/s/AKfycbyXER_dDeDD5a6z-gsbkXKScuXLvIXq3WhKUjJTJqOBAXcRB_bGE_0tkKKG9jQu9Ey7kA/exec?action=getRegions
```

---

## 📊 根据结果判断

### ✅ 情况 A：看到 JSON 格式的地点列表

**显示内容**：
```json
{
  "success": true,
  "regions": [
    {
      "id": "1",
      "text": "11/3 星期一 晚上 7:00~9:00 捷運新店區公所站一號出口1分鐘到 北新路一段259號2樓 [剩餘 30 個名額]",
      "fullDesc": "11/3 星期一 晚上 7:00~9:00 捷運新店區公所站一號出口1分鐘到 北新路一段259號2樓",
      "sortOrder": 1,
      "availableSeats": 30,
      "language": "zh-TW"
    },
    {
      "id": "2",
      "text": "11/5 星期三 下午 2:00~4:00 捷運新店區公所站一號出口1分鐘到 北新路一段259號2樓 [剩餘 50 個名額]",
      "fullDesc": "11/5 星期三 下午 2:00~4:00 捷運新店區公所站一號出口1分鐘到 北新路一段259號2樓",
      "sortOrder": 2,
      "availableSeats": 50,
      "language": "zh-TW"
    }
  ],
  "count": 2
}
```

**结论**：✅ **API 完全正常！后端已正确设置！**

**原因**：前端可能还在使用缓存

**解决方法**：
1. 完全关闭浏览器（所有窗口）
2. 重新打开浏览器
3. 访问 http://localhost:8000 或 https://ifittw01-ai.github.io/AI-auto-sales/
4. 按 Ctrl + Shift + R 强制刷新

---

### ⚠️ 情况 B：看到空的数据列表

**显示内容**：
```json
{
  "success": true,
  "regions": [],
  "count": 0
}
```

**结论**：⚠️ **API 工作正常，但没有数据**

**原因**：Google Sheet 中的问题
- 没有创建「評估地點」工作表
- 工作表名称错误（有空格或拼写错误）
- 工作表中没有数据
- 所有数据的「是否啟用」都是「否」
- 所有数据都已过期或未到开始日期

**解决方法**：

#### 检查工作表是否存在
1. 打开 Google Sheet：
   ```
   https://docs.google.com/spreadsheets/d/1vFBIC47zfEysQTALJYOM5tMGvAhp47XRMHT4qkQNGQo/edit
   ```
2. 查看左下角是否有「評估地點」工作表（不能有空格）
3. 如果没有，点击「+」新增

#### 检查数据格式
1. 点击「評估地點」工作表
2. 确认第一行是标题：
   ```
   選項ID | 排序 | 完整描述 | 開始日期 | 結束日期 | 最大容量 | 目前報名數 | 是否啟用 | 語言
   ```
3. 确认第二行有数据
4. 确认「是否啟用」列是「是」
5. 确认「開始日期」已经到了（或为空）
6. 确认「結束日期」还没过（或为空）

#### 范例数据（复制粘贴到第二行）
```
1	1	11/3 星期一 晚上 7:00~9:00 捷運新店區公所站一號出口1分鐘到 北新路一段259號2樓	2024/11/01	2024/11/30	30	0	是	zh-TW
```

---

### ❌ 情况 C：看到纯文本消息

**显示内容**：
```
Google Apps Script 正在運行！

可用的 API：
- ?action=getRegions - 獲取評估地點列表
- ?action=getRegions&lang=zh-TW - 獲取指定語言的評估地點
```

**结论**：❌ **API 使用了增强版代码，但可能有其他问题**

**原因**：
- 虽然代码已更新，但可能 SPREADSHEET_ID 错误
- 可能工作表名称不匹配

**解决方法**：

#### 检查 SPREADSHEET_ID
打开 Google Apps Script，检查第 22 行：
```javascript
const SPREADSHEET_ID = '1vFBIC47zfEysQTALJYOM5tMGvAhp47XRMHT4qkQNGQo';
```

确认这个 ID 和你的 Google Sheet URL 中的 ID 一致：
```
https://docs.google.com/spreadsheets/d/【这里就是ID】/edit
```

#### 检查工作表名称
在 Apps Script 中，确认第 23 行：
```javascript
const SHEET_NAME_REGIONS = '評估地點';
```

然后在 Google Sheet 中确认工作表名称完全一致（区分大小写）

---

### ❌ 情况 D：看到旧版本消息

**显示内容**：
```
Google Apps Script 正在運行！請使用 POST 方法提交表單。
```

**结论**：❌ **还在使用旧版代码**

**原因**：
- 没有复制 `google-apps-script-enhanced.js` 的代码
- 复制了但没有保存
- 保存了但没有重新部署
- 重新部署了但没有选择「新版本」

**解决方法**：

1. **复制代码**：
   - 打开 `google-apps-script-enhanced.js`
   - 按 Ctrl + A 全选
   - 按 Ctrl + C 复制

2. **粘贴到 Apps Script**：
   - 打开 https://script.google.com
   - 找到你的项目
   - 在 Code.gs 中按 Ctrl + A 全选
   - 按 Ctrl + V 粘贴
   - 点击「💾 储存」

3. **重新部署**（重要！）：
   - 点击「部署」→「管理部署」
   - 点击现有部署旁的「✏️ 编辑」
   - **版本**：选择「**新版本**」（不是 HEAD）
   - 点击「部署」
   - 等待 1-2 分钟

4. **重新测试**：
   - 刷新 API 测试网址
   - 应该会看到 JSON 格式的数据

---

### ❌ 情况 E：看到错误页面或 404

**显示内容**：
```
404 Not Found
或其他错误信息
```

**结论**：❌ **部署 URL 错误或部署失败**

**原因**：
- 部署 URL 不正确
- 部署权限不是「所有人」
- 部署已被删除

**解决方法**：

1. **检查部署**：
   - 打开 https://script.google.com
   - 点击「部署」→「管理部署」
   - 确认有一个活跃的部署
   - 复制「网页应用程序」URL

2. **更新 script.js**：
   - 将新的 URL 更新到 `script.js` 第 326 行
   - 提交并推送到 GitHub

3. **检查权限**：
   - 在部署设置中
   - 「谁可以存取」必须设为「所有人」
   - 不能是「只有我」

---

## 🎯 快速检查清单

测试 API 之前，请确认：

- [ ] Google Sheet 存在且 ID 正确
- [ ] 有「評估地點」工作表（左下角可以看到）
- [ ] 工作表中有数据（至少一行）
- [ ] 数据的「是否啟用」列是「是」
- [ ] Google Apps Script 代码已更新
- [ ] 已保存代码（💾）
- [ ] 已重新部署（选择「新版本」）
- [ ] 部署权限是「所有人」
- [ ] 已等待 1-2 分钟让部署生效

---

## 📞 需要帮助？

如果测试后还有问题，请提供：

1. **API 测试结果**：
   ```
   （粘贴你看到的内容）
   ```

2. **Google Sheet 截图**：
   - 显示「評估地點」工作表
   - 显示数据内容

3. **Apps Script 部署截图**：
   - 显示部署状态
   - 显示部署 URL

这样我能快速帮你定位问题！

