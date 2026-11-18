# opencode-composer-controls

OpenCode Desktop のチャット入力欄を **自由に大きくでき、送信キーも選べる** ようにする GUI プラグインです。

- **Enter は改行、Ctrl+Enter（⌘+Enter）で送信** が既定。誤送信がなくなります。
- 入力欄の **上端をドラッグして高さを変更**。クリックすると小さい既定の高さに戻ります。
- 送信キー・高さ・高さの記憶は **設定画面** から変更でき、サーバー側に保存されます。
- アプリ本体は変更しません（実験的 GUI プラグイン API のみ使用）。

## 機能

### 1. 送信キー

| 設定 | Enter | Shift+Enter | Ctrl/⌘+Enter |
| --- | --- | --- | --- |
| **Ctrl+Enter で送信（既定）** | 改行 | 改行 | 送信 |
| Enter で送信（アプリ標準） | 送信 | 改行 | 送信（代替送信） |

- IME の変換確定 Enter は横取りしません。
- `@`・`/`・履歴などのサジェストが開いているときは、アプリ本来の「候補を確定」動作を優先します。
- 入力欄以外（検索ボックス等）には影響しません。

### 2. 入力欄のリサイズ

- 入力欄の上端に細いハンドルがあります（ホバーで表示）。
- 上へドラッグすると高く、下へドラッグすると低くなります（120px〜画面の80%）。
- ハンドルをクリックすると、アプリ標準の高さ（180px）と設定した高さを切り替えます。
- 「高さを記憶する」がオンのとき、ドラッグ結果は再起動後も復元されます。

### 3. 設定画面

OpenCode の設定 → プラグイン → **入力欄**:

- 送信キー（Ctrl+Enter / Enter）
- 入力欄の高さ（px）
- 高さを記憶して再起動後も復元する

設定は `ctx.storage`（キー `composer-controls/prefs`）に保存されます。GUI 側にも localStorage キャッシュがあり、起動直後の一瞬だけ既定値が見えることはありません。

## インストール

```jsonc
// ~/.config/opencode/opencode.jsonc
{
  "plugins": [
    "/absolute/path/to/opencode-composer-controls"
    // または { "package": "github:YOUR_GITHUB/opencode-composer-controls" }
  ]
}
```

その後、**バックグラウンドサービスごと再起動**してください（ウィンドウを閉じるだけでは不十分）:

```sh
~/.config/ai.opencode.desktop/cli/*/opencode-cli service restart
```

サーバー側は設定変更でホットリロードされますが、GUI プラグインの登録はサービスの起動時にしか行われません。

## 仕組み

```
GUI (gui.tsx)                              Server (index.ts)
  window keydown (capture)                   RPC: composer-controls/prefs
    plain Enter -> preventDefault            RPC: composer-controls/setPrefs
      -> insertLineBreak                         |
  form[data-component="composer"]                +-- ctx.storage に保存
    --oc-cr-h でフォームの高さを指定
    composer-scroll / composer-editor を flex で伸ばす
    上端ハンドル（pointer drag）
```

- **Enter の横取り**: ウィンドウの capture フェーズで `preventDefault()` + `stopPropagation()` し、アプリの Enter 送信分岐に届く前に改行を挿入します。挿入はアプリの Shift+Enter と同じ `insertLineBreak` 経路です。
- **高さ**: アプリは `composer-scroll` に `max-h-[180px]` を付けています。プラグインはフォームに `data-oc-composer-controls` を付け、CSS 変数 `--oc-cr-h` でフォーム全体の高さを指定します。フォームを縦 flex にし、スクロール領域と contenteditable を残りいっぱいに伸ばすので、**枠だけでなく実際に文字を入力できる範囲全体**が広がります。
- **履歴プレビュー**: 入力欄の上で ↑ を押すとアプリがフォーム自身の高さをインライン指定します。このモードではアプリが高さを所有するため、プラグインは上書きもハンドルも解除します（閉じると自動で戻ります）。

## 開発

```sh
npm install
npx tsc --noEmit
npx vite build   # -> dist/gui-experimental.cjs（GUI 側）
```

GUI だけの変更は `npx vite build` 後にウィンドウを再読み込み（Ctrl+R）すれば反映されます。プラグインの追加・GUI 登録の変更は上記のサービス再起動が必要です。

## 既知の制約

- モバイル／タッチキーボードの Return は元々「改行のみ」なので、設定に関係なくそのままです。
- 履歴プレビュー中は Enter が「その履歴項目を選択」になるアプリ標準動作を優先します。
- 高さの上限は画面の 80% です（ウィンドウを極端に小さくした場合に備えた安全弁）。

## License

MIT
