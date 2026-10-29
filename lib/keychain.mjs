// macOS Keychain 存取：service = SERVICE，account = 變數名稱。只用系統內建的 `security`。
import { execFileSync } from "node:child_process";
import { isValidName, SERVICE } from "./paths.mjs";
import { MSG } from "./strings.mjs";

function checkName(name) {
	if (!isValidName(name)) throw new Error(MSG.invalidName(name));
}

function security(args) {
	return execFileSync("security", args, { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
}

/** 取值；不存在、空值或使用者拒絕授權都回傳 null。 */
export function getSecret(name) {
	checkName(name);
	let value;
	try {
		value = security(["find-generic-password", "-s", SERVICE, "-a", name, "-w"]);
	} catch {
		return null;
	}
	value = value.replace(/\n$/, "");
	return value === "" ? null : value;
}

/** 只查有沒有這筆、不讀值，所以不會跳出授權視窗。 */
export function hasSecret(name) {
	checkName(name);
	try {
		security(["find-generic-password", "-s", SERVICE, "-a", name]);
		return true;
	} catch {
		return false;
	}
}

/** 寫入，已存在就更新。 */
export function setSecret(name, value) {
	checkName(name);
	if (!value) throw new Error(MSG.emptyValue);
	// -U：已存在就更新。值會短暫出現在 argv，同帳號的行程看得到（security 沒有從 stdin 讀值的選項）。
	security(["add-generic-password", "-s", SERVICE, "-a", name, "-w", value, "-U"]);
}

/** 刪除，回傳是否真的刪掉。 */
export function deleteSecret(name) {
	checkName(name);
	try {
		security(["delete-generic-password", "-s", SERVICE, "-a", name]);
		return true;
	} catch {
		return false;
	}
}
