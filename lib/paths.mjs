// 路徑與共用常數集中在這裡，CLI 與 TUI 都照同一套規則。
// shell/init.zsh 不跑 Node、讀不到這支，這裡的預設值改了，init.zsh 也要同步改。
import { homedir } from "node:os";
import { join } from "node:path";

/** Keychain 的 service 名稱；account = 變數名稱。可用 ZSHRC_TUI_SERVICE 覆寫（測試用）。 */
export const SERVICE = process.env.ZSHRC_TUI_SERVICE || "zshrc-tui-env";

/** 環境變數名稱的白名單格式。 */
export const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** 設定資料夾：$XDG_CONFIG_HOME/zshrc-tui，預設 ~/.config/zshrc-tui。 */
export function configDir() {
	return join(process.env.XDG_CONFIG_HOME || join(homedir(), ".config"), "zshrc-tui");
}

/** 名稱清單：一行一個變數名稱，只有名稱、沒有值。init.zsh 依這份清單同步。 */
export function registryFile() {
	return join(configDir(), "vars");
}

/** 要掛上同步那一行的 zshrc。 */
export function zshrcFile() {
	return join(process.env.ZDOTDIR || homedir(), ".zshrc");
}

export function isValidName(name) {
	return NAME_PATTERN.test(name);
}
