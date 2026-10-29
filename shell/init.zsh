# zshrc-tui：開 shell 時把 Keychain 裡的值單向同步成環境變數。
#
# 由 ~/.zshrc 裡 zshrc-tui 的區塊 source 進來；不跑 Node，開 shell 才快。
# 規則與 lib/paths.mjs 一致：service 預設 zshrc-tui-env、名稱清單在 $XDG_CONFIG_HOME/zshrc-tui/vars。
# shell 已經設定的同名變數不覆蓋；讀不到（不存在、Keychain 鎖住、拒絕授權）就安靜跳過，不擋 shell 啟動。
() {
	emulate -L zsh
	[[ $OSTYPE == darwin* ]] || return 0

	local service=${ZSHRC_TUI_SERVICE:-zshrc-tui-env}
	local registry=${XDG_CONFIG_HOME:-$HOME/.config}/zshrc-tui/vars
	[[ -r $registry ]] || return 0

	local pattern='^[A-Za-z_][A-Za-z0-9_]*$'
	local line name value
	for line in "${(@f)$(<$registry)}"; do
		name=${line%%\#*}
		name=${name//[[:space:]]/}
		[[ $name =~ $pattern ]] || continue
		[[ -n ${(P)name} ]] && continue
		value=$(security find-generic-password -s "$service" -a "$name" -w 2>/dev/null) || continue
		[[ -n $value ]] && export "$name=$value"
	done
}
