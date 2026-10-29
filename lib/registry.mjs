// 名稱清單：一行一個變數名稱，`#` 之後當註解。只記名稱、不記值。
// 用純文字而不用 JSON，是為了讓 shell/init.zsh 不靠 Node 也能讀，開 shell 才快。
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { configDir, isValidName, registryFile } from "./paths.mjs";

export function readNames() {
	const file = registryFile();
	if (!existsSync(file)) return [];
	const names = readFileSync(file, "utf-8")
		.split(/\r?\n/)
		.map((line) => line.replace(/#.*/, "").trim())
		.filter(isValidName);
	return [...new Set(names)].sort();
}

export function writeNames(names) {
	const dir = configDir();
	mkdirSync(dir, { recursive: true, mode: 0o700 });
	const body = [...new Set(names)].filter(isValidName).sort().join("\n");
	// 先寫暫存檔再改名，中途失敗不會留下寫一半的清單。
	const tmp = `${registryFile()}.${process.pid}.tmp`;
	writeFileSync(tmp, body ? `${body}\n` : "", { encoding: "utf-8", mode: 0o600 });
	renameSync(tmp, registryFile());
}

export function addName(name) {
	writeNames([...readNames(), name]);
}

export function removeName(name) {
	writeNames(readNames().filter((n) => n !== name));
}
