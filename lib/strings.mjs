// 顯示文案集中管理；CLI 與 TUI 共用。
export const MSG = {
	invalidName: (name) => `變數名稱不合法：${name}（只能用英文字母、數字、底線，且不能以數字開頭）`,
	emptyValue: "值是空的",
	unsupportedPlatform: (p) => `目前只支援 macOS（這台是 ${p}）`,
	notFound: (name) => `Keychain 裡沒有 ${name}`,
	saved: (name) => `已存入 ${name}`,
	deleted: (name) => `已刪除 ${name}`,
	applyHint: "開新的 shell，或執行 source ~/.zshrc 後生效",

	usage: `用法：zshrc-tui [指令]

  （不加指令）        開啟 TUI
  list                列出所有變數與狀態
  set <名稱>          設定值（從 stdin 讀取；終端機上輸入不回顯）
  get <名稱>          印出值
  rm <名稱>           刪除（Keychain 與名稱清單）
  install             在 ~/.zshrc 加入同步區塊（會先備份）
  uninstall           從 ~/.zshrc 移除同步區塊（會先備份）
  help                顯示這段說明`,
	unknownCommand: (cmd) => `不認得的指令：${cmd}`,
	missingName: "缺少變數名稱",
	promptValue: (name) => `${name} 的值（輸入不回顯）：`,
	listEmpty: "（名稱清單是空的）",
	statusStored: "Keychain 有值",
	statusMissing: "Keychain 缺值",
	statusShell: "目前 shell 已設定",

	zshrcInstalled: (file, backup) => `已加入同步區塊：${file}${backup ? `（備份：${backup}）` : ""}`,
	zshrcAlready: (file) => `${file} 已經有同步區塊，不用重複加入`,
	zshrcRemoved: (file, backup) => `已移除同步區塊：${file}（備份：${backup}）`,
	zshrcNotInstalled: (file) => `${file} 裡沒有同步區塊`,
	zshrcSyntaxError: (file, backup) => `改完後 zsh -n 語法檢查失敗，已從備份還原：${file} ← ${backup}`,

	tuiTitle: (service) => `zshrc-tui　Keychain service：${service}`,
	tuiHelp: "↑↓/jk 移動　a 新增　Enter/e 修改值　d 刪除　r 重新整理　q 離開",
	tuiInputHelp: "Enter 確定　Esc 取消",
	tuiConfirmHelp: "y 確定　其他鍵取消",
	tuiAskName: "新變數名稱：",
	tuiAskValue: (name) => `${name} 的值（不回顯）：`,
	tuiConfirmDelete: (name) => `確定刪除 ${name}？Keychain 裡的值也會刪掉 (y/N)`,
	tuiTyped: (n) => `已輸入 ${n} 個字元`,
	tuiCancelled: "已取消",
	tuiExists: (name) => `${name} 已經存在，請用 Enter 修改`,
	tuiNeedTty: "TUI 需要在終端機裡執行；非互動用法請看 zshrc-tui help",
};
