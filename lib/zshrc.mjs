// ~/.zshrc 只動工具自己的區塊（BEGIN/END 標記之間），區塊外一律不碰。
// 寫入前先備份；寫完用 zsh -n 檢查語法，失敗就從備份還原。
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { zshrcFile } from "./paths.mjs";
import { MSG } from "./strings.mjs";

const BEGIN = "# >>> zshrc-tui >>>";
const END = "# <<< zshrc-tui <<<";
const INIT_SCRIPT = join(dirname(dirname(fileURLToPath(import.meta.url))), "shell", "init.zsh");

function block() {
	return `${BEGIN}\n# 開 shell 時把 Keychain 裡的值單向同步成環境變數（由 zshrc-tui 管理）\n[[ -r "${INIT_SCRIPT}" ]] && source "${INIT_SCRIPT}"\n${END}\n`;
}

function timestamp() {
	const d = new Date();
	const p = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function backup(file) {
	// 同一秒內備份兩次時加序號，不覆蓋前一份備份。
	const base = `${file}.bak.${timestamp()}`;
	let target = base;
	for (let i = 1; existsSync(target); i++) target = `${base}-${i}`;
	copyFileSync(file, target);
	return target;
}

function checkSyntax(file, backupFile) {
	try {
		execFileSync("zsh", ["-n", file], { stdio: "ignore" });
	} catch {
		if (backupFile) copyFileSync(backupFile, file);
		throw new Error(MSG.zshrcSyntaxError(file, backupFile));
	}
}

const BLOCK_PATTERN = new RegExp(`\\n?${BEGIN}\\n[\\s\\S]*?${END}\\n?`);

export function install() {
	const file = zshrcFile();
	const current = existsSync(file) ? readFileSync(file, "utf-8") : "";
	if (current.includes(BEGIN)) return MSG.zshrcAlready(file);
	const backupFile = existsSync(file) ? backup(file) : null;
	const sep = current === "" || current.endsWith("\n") ? "" : "\n";
	writeFileSync(file, `${current}${sep}\n${block()}`, "utf-8");
	checkSyntax(file, backupFile);
	return MSG.zshrcInstalled(file, backupFile);
}

export function uninstall() {
	const file = zshrcFile();
	const current = existsSync(file) ? readFileSync(file, "utf-8") : "";
	if (!current.includes(BEGIN)) return MSG.zshrcNotInstalled(file);
	const backupFile = backup(file);
	writeFileSync(file, current.replace(BLOCK_PATTERN, ""), "utf-8");
	checkSyntax(file, backupFile);
	return MSG.zshrcRemoved(file, backupFile);
}
