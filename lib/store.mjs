// CLI 與 TUI 共用的操作：Keychain 與名稱清單一起改，兩邊不會各說各話。
import { deleteSecret, hasSecret, setSecret } from "./keychain.mjs";
import { isValidName } from "./paths.mjs";
import { addName, readNames, removeName } from "./registry.mjs";
import { MSG } from "./strings.mjs";

export function assertMac() {
	if (process.platform !== "darwin") throw new Error(MSG.unsupportedPlatform(process.platform));
}

/** 清單上每個名稱的狀態；不讀值。 */
export function listEntries() {
	return readNames().map((name) => ({
		name,
		stored: hasSecret(name),
		inShell: Boolean(process.env[name]),
	}));
}

export function saveEntry(name, value) {
	if (!isValidName(name)) throw new Error(MSG.invalidName(name));
	setSecret(name, value);
	addName(name);
}

export function removeEntry(name) {
	if (!isValidName(name)) throw new Error(MSG.invalidName(name));
	deleteSecret(name);
	removeName(name);
}
