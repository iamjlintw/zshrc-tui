// 全螢幕 TUI：只用 Node 內建的 readline 按鍵事件與 ANSI 控制碼，不依賴套件。
// 值一律不顯示在畫面上；輸入值時只顯示字元數。
import { emitKeypressEvents } from "node:readline";
import { isValidName, SERVICE } from "./paths.mjs";
import { listEntries, removeEntry, saveEntry } from "./store.mjs";
import { MSG } from "./strings.mjs";

const ESC = "\x1b[";
const out = process.stdout;

export function runTui() {
	if (!process.stdin.isTTY || !out.isTTY) throw new Error(MSG.tuiNeedTty);

	const state = {
		entries: [],
		index: 0,
		message: "",
		mode: "list", // list | input | confirm
		input: null, // { label, hidden, buffer, onSubmit }
		confirm: null, // { label, onYes }
	};

	function refresh() {
		state.entries = listEntries();
		state.index = Math.min(state.index, Math.max(0, state.entries.length - 1));
	}

	function current() {
		return state.entries[state.index];
	}

	function render() {
		const lines = [];
		lines.push(`${ESC}1m${MSG.tuiTitle(SERVICE)}${ESC}0m`, "");
		if (state.entries.length === 0) lines.push(`  ${MSG.listEmpty}`);
		const width = Math.max(8, ...state.entries.map((e) => e.name.length));
		state.entries.forEach((e, i) => {
			const cursor = i === state.index ? ">" : " ";
			const stored = e.stored ? MSG.statusStored : `${ESC}31m${MSG.statusMissing}${ESC}0m`;
			const shell = e.inShell ? `　${ESC}2m${MSG.statusShell}${ESC}0m` : "";
			const row = `${cursor} ${e.name.padEnd(width)}  ${stored}${shell}`;
			lines.push(i === state.index ? `${ESC}7m${row}${ESC}0m` : row);
		});
		lines.push("");
		if (state.mode === "input") {
			const { label, hidden, buffer } = state.input;
			lines.push(`${label}${hidden ? MSG.tuiTyped(buffer.length) : buffer}`, `${ESC}2m${MSG.tuiInputHelp}${ESC}0m`);
		} else if (state.mode === "confirm") {
			lines.push(state.confirm.label, `${ESC}2m${MSG.tuiConfirmHelp}${ESC}0m`);
		} else {
			lines.push(`${ESC}2m${MSG.tuiHelp}${ESC}0m`);
		}
		if (state.message) lines.push("", state.message);
		out.write(`${ESC}H${ESC}2J${lines.join("\n")}`);
	}

	function ask(label, hidden, onSubmit) {
		state.mode = "input";
		state.input = { label, hidden, buffer: "", onSubmit };
	}

	function act(fn) {
		try {
			state.message = fn();
		} catch (error) {
			state.message = `${ESC}31m${error.message}${ESC}0m`;
		}
		state.mode = "list";
		state.input = null;
		state.confirm = null;
		refresh();
	}

	function promptValue(name) {
		ask(MSG.tuiAskValue(name), true, (value) => {
			act(() => {
				saveEntry(name, value);
				return `${MSG.saved(name)}　${MSG.applyHint}`;
			});
			// 游標移到剛存的那一筆，接著按 Enter 改的才是它。
			const i = state.entries.findIndex((x) => x.name === name);
			if (i >= 0) state.index = i;
		});
	}

	function onListKey(str, key) {
		const e = current();
		switch (key.name) {
			case "up":
			case "k":
				state.index = Math.max(0, state.index - 1);
				break;
			case "down":
			case "j":
				state.index = Math.min(state.entries.length - 1, state.index + 1);
				break;
			case "a":
				state.message = "";
				ask(MSG.tuiAskName, false, (name) => {
					if (!isValidName(name)) return act(() => { throw new Error(MSG.invalidName(name)); });
					if (state.entries.some((x) => x.name === name)) return act(() => { throw new Error(MSG.tuiExists(name)); });
					promptValue(name);
				});
				break;
			case "return":
			case "e":
				if (e) {
					state.message = "";
					promptValue(e.name);
				}
				break;
			case "d":
				if (e) {
					state.mode = "confirm";
					state.confirm = {
						label: MSG.tuiConfirmDelete(e.name),
						onYes: () => act(() => {
							removeEntry(e.name);
							return MSG.deleted(e.name);
						}),
					};
				}
				break;
			case "r":
				state.message = "";
				refresh();
				break;
			case "q":
				quit();
				return;
		}
	}

	function onInputKey(str, key) {
		const input = state.input;
		if (key.name === "escape") return act(() => MSG.tuiCancelled);
		if (key.name === "return") return input.onSubmit(input.buffer.trim());
		if (key.name === "backspace") {
			input.buffer = input.buffer.slice(0, -1);
			return;
		}
		// 貼上時一個事件可能帶多個字元；控制字元一律略過。
		if (str && !key.ctrl && !key.meta) input.buffer += str.replace(/[\x00-\x1f\x7f]/g, "");
	}

	function onKeypress(str, key = {}) {
		if (key.ctrl && key.name === "c") return quit();
		if (state.mode === "input") onInputKey(str, key);
		else if (state.mode === "confirm") {
			if (key.name === "y") state.confirm.onYes();
			else act(() => MSG.tuiCancelled);
		} else onListKey(str, key);
		if (!quitting) render();
	}

	let quitting = false;
	function quit() {
		quitting = true;
		process.stdin.off("keypress", onKeypress);
		process.stdin.setRawMode(false);
		process.stdin.pause();
		out.write(`${ESC}?1049l`);
	}

	emitKeypressEvents(process.stdin);
	process.stdin.setRawMode(true);
	process.stdin.resume();
	out.write(`${ESC}?1049h`);
	refresh();
	render();
	process.stdin.on("keypress", onKeypress);
}
