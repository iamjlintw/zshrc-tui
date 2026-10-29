# zshrc-tui

把環境變數的 key/value 存進 macOS Keychain，開 shell 時單向同步成環境變數的 TUI 設定器。

- 值只存在 Keychain（service `zshrc-tui-env`，account = 變數名稱），檔案裡只有名稱。
- `~/.zshrc` 只加一個區塊；開 shell 時由 `shell/init.zsh`（純 zsh，不跑 Node）逐一讀出並 `export`。
- shell 已經設定的同名變數**不覆蓋**；讀不到（不存在、Keychain 鎖住、拒絕授權）就安靜跳過，不擋 shell 啟動。
- 不依賴任何套件：Node 內建模組 + 系統的 `security`、`zsh`。
- 只支援 macOS。

## 安裝

```sh
git clone https://github.com/iamjlintw/zshrc-tui.git
cd zshrc-tui
ln -s "$PWD/bin/zshrc-tui" ~/.local/bin/zshrc-tui   # 或任何在 PATH 上的位置
zshrc-tui install                                   # 在 ~/.zshrc 加入同步區塊（會先備份）
```

需要 Node 18 以上。`~/.zshrc` 的區塊會指向 clone 下來的 `shell/init.zsh`，裝好後別搬動或刪掉這個資料夾；要搬的話先 `zshrc-tui uninstall`，搬完再 `install`。

## 使用

```sh
zshrc-tui                                  # 開 TUI
printf '%s' "$KEY" | zshrc-tui set DEEPSEEK_API_KEY   # 從 stdin 設定；終端機上直接執行則不回顯輸入
zshrc-tui get DEEPSEEK_API_KEY
zshrc-tui list
zshrc-tui rm DEEPSEEK_API_KEY
zshrc-tui uninstall                        # 移除 ~/.zshrc 的同步區塊（會先備份）
```

TUI 按鍵：`↑↓`/`jk` 移動、`a` 新增、`Enter`/`e` 修改值、`d` 刪除、`r` 重新整理、`q` 離開。畫面上不顯示值。

改完要開新的 shell，或執行 `source ~/.zshrc` 才會生效；已在執行中的程式要重開才會讀到新值。

## 檔案

| 位置 | 內容 |
|---|---|
| Keychain，service `zshrc-tui-env` | 值 |
| `$XDG_CONFIG_HOME/zshrc-tui/vars`（預設 `~/.config/zshrc-tui/vars`） | 要同步的變數名稱，一行一個，權限 600 |
| `~/.zshrc`（`$ZDOTDIR` 優先）`# >>> zshrc-tui >>>` 區塊 | source `shell/init.zsh` |
| `~/.zshrc.bak.<時間>` | install／uninstall 前的備份；改完 `zsh -n` 檢查失敗會自動還原 |

```
bin/zshrc-tui     入口（TUI 與子指令）
lib/paths.mjs     路徑與常數（改預設值要同步改 shell/init.zsh）
lib/strings.mjs   顯示文案
lib/keychain.mjs  Keychain 存取
lib/registry.mjs  名稱清單
lib/store.mjs     CLI／TUI 共用操作（Keychain 與名稱清單一起改）
lib/zshrc.mjs     ~/.zshrc 區塊的加入與移除
lib/tui.mjs       TUI
shell/init.zsh    開 shell 時的同步
```

## 注意

- 寫入時值會短暫出現在 `security` 的 argv，同帳號的行程看得到（`security` 沒有從 stdin 讀值的選項）。
- 同步進環境變數後，該 shell 啟動的所有程式都會繼承到這些值。
- 第一次讀某筆值時 macOS 可能跳出授權視窗，選「永遠允許」之後就不會再問。
- 測試可用 `ZSHRC_TUI_SERVICE`、`XDG_CONFIG_HOME`、`ZDOTDIR` 指到別處，不碰真的設定。

## 授權

MIT，見 [LICENSE](LICENSE)。
