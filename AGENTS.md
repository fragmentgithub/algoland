# アルゴランド — エージェント引き継ぎ書

4歳児向けアルゴリズム学習ゲーム集。保護者(開発依頼者)の長男(4歳)が対象ユーザー。
このファイルは Codex / Claude Code などのコーディングエージェントへの引き継ぎ文書。

## プロジェクト概要

- **公開URL**: https://fragmentgithub.github.io/algoland/
- **リポジトリ**: https://github.com/fragmentgithub/algoland (main ブランチ直下を GitHub Pages で配信)
- **技術**: Vanilla JS / CSS のみ。ビルド・依存・フレームワーク一切なし
- **重要制約**: `file://` で index.html を直接開いても動くこと(ES モジュール禁止 = classic script 構成を維持)

## アーキテクチャ

classic `<script>` を index.html 末尾で順番に読み込む。全ファイルがグローバルスコープを共有し、
**読み込み順 = 依存順**。新しいファイルを足すときは順序に注意:

```
js/core.js      $/$$/delay/shuffle/pick, store(localStorage+メモリfallback),
                epoch/later(後述), replayAnim/wobble, 設定変数(diff/limitMin/pin/rateOpt/muted)
js/audio.js     sfx.*(Web Audio生成、音声ファイルなし)
js/speech.js    speak()(ja-JP音声を自動選択: Nanami>natural>Google>Kyoko)、🔈ボタン、ミュート
js/rewards.js   stars / FRIENDS(⭐3,6,10,15,20,26,33,40,50で解放) / pendingFriend / renderFriends
js/pad.js       暗証番号パッド(openPad/closePad/askPin)。4桁入力後180msのpadLock窓、✕は常に勝つ
js/timer.js     1日のプレイ時間制限。localDay()はローカルタイムゾーン基準。
                lockApp()/unlockApp()。日付が変わると自動リセット(1秒間隔のinterval内で検出)
js/options.js   ⚙️設定(PINゲート)。難易度/時間/声の速さ/PIN変更(2回入力確認)
js/ui.js        show()(画面遷移)、renderPips、celebrate→nextbtn→friendol→runNext の連鎖、
                games レジストリ、finishRound()
js/games/g*.js  各ゲーム。IIFEで games.gN = {start} を登録
```

### 最重要の設計パターン: `epoch` / `later()`

画面遷移(`show()`)とロック(`lockApp()`)は `epoch` をインクリメントする。
遅延実行はすべて `later(ms, fn)` を使うこと(epoch が変わっていたら発火しない)。
g4 のロボット実行ループは各 `await` 後に `if (e !== epoch) return;` で中断する。
**生の setTimeout でゲーム進行を書くと、🏠で戻った後に星が二重加算されるバグが再発する。**
このパターンは3回のレビューループで確立したもので、崩さないこと。

### 子供向けUXの原則

- 操作はすべて**タップのみ**(ドラッグ禁止 — 4歳の運動能力向け)
- 文字が読めない前提: 指示は `speak()` で読み上げ、正誤は効果音で判別
- 2回間違えたら正解を `hintpulse` で光らせる(挫折させない)
- 正解ボタンは**同期的に disabled** にする(連打で二重加算しない)。g5 は `current = null` を即時消費
- テキストは分かち書きひらがな(「すうじを じゅんばんに タッチ!」)

## ゲーム仕様(難易度 diff=0/1/2 で変化)

| ID | 名前 | 学習概念 | 難易度差 |
|----|------|---------|---------|
| g1 | すうじのきしゃ | 順序・逐次処理 | ラウンド構成 [3,4,5] / [3,5,7,10] / [5,8,10,12](>10でグリッド4行・風船縮小) |
| g2 | せいくらべ | 選択ソート | 個数増加、diff=2 は rev(大きい順)ラウンドあり |
| g3 | つぎはなあに? | パターン認識 | AB / AB+ABC+AAB / AAB+AABB+ABCD |
| g4 | ロボットのおつかい | 手順の計画・デバッグ | レベル数、diff=2 は岩(rocks)で迂回が必要。⬆️➡️のみ、5x3グリッド、原点(0,0)=左下 |
| g5 | なかまわけ | 分類 | 個数、diff=2 最終ラウンドはバスケット3個 |
| g6 | かたちさがし | 条件判定(AND) | 4択色のみ / 6択色+形 / 8択+ニアミス距離の保証ロジックあり |

g4 のレベルを追加する場合: ⬆️➡️だけで到達可能か必ず確認(負方向の移動は存在しない)。

## 保護者向け機能

- **時間制限**: デフォルト15分/日。`algo4.playSec` を10秒ごとに永続化、タブ非表示中はカウントしない。
  時間切れ→ #timeup ロック画面(z-index 100)→ PIN でリセット
- **PIN**: 初期値 `1234`(README と「おうちのかたへ」モーダルに明記)。⚙️設定も PIN ゲート
- **z-index 階層**: overlay 50 < friendol 60 < confetti 65 < parent 70 < options 80 < timeup 100 < pad 120。
  lockApp() は pad を閉じ全モーダルを非表示にする(pad が lock より上にある事故防止)。
  unlockApp() はロック解除時にホームへ遷移する(epoch も進み残留状態を掃除)

## localStorage キー(プレフィックス `algo4.`)

`stars, muted, diff, limit, pin, rate, playDate, playSec`
localStorage が例外を投げる環境用に `store` がメモリ fallback を持つ。直接 localStorage を触らないこと。

## 検証方法

- ローカル: `.claude/launch.json` の `algo4`(`npx -y serve -l 4173 .`)またはファイル直開き
- 手動スモーク: 各ゲーム1ラウンド+⚙️(PIN 1234)+ `lockApp()`/`unlockApp()` をコンソールから
- 回帰ポイント: ①ラウンド完了直後に🏠連打→ホームにオーバーレイが漏れない ②正解連打→星が1個だけ増える
  ③ロボット実行中に🏠→再入場→GOが正常 ④PINパッド4桁入力直後の⌫/✕
- テスト後は `localStorage` の `algo4.*` を消して初期状態に戻す(⭐や難易度が汚れるため)

## デプロイ

`main` に push するだけ(Pages が legacy build で root を配信)。
`gh run list` で pages-build-deployment を確認。まれに "Deployment failed, try again later" で失敗する。
**注意: `gh run rerun --failed` は queued のまま固まることがあり、それが後続デプロイもブロックする。**
確実な復旧手順は legacy build を直接リクエストすること:
`gh api -X POST repos/fragmentgithub/algoland/pages/builds`
→ 30秒ほどで `gh api repos/fragmentgithub/algoland/pages/builds/latest` が built になる。
反映確認は公開URLの `js/core.js` が 200 を返すか+変更内容のgrep。

## 履歴と既知の判断

- 3回のレビュー→修正ループ済み。修正済みバグ: stale setTimeout(epoch導入)、g5連打二重加算、
  PINパッド180ms窓の二重確定、UTC日付バグ(localDay化)、ロック中の進行継続(lockAppでepoch++)、
  localStorage例外でスクリプト全死
- 2026-07-04 Codex による改善: 全ゲームに「2回間違えたら正解が hintpulse で光る」を統一
  (g3=data-answer / g5=data-cat / g6=data-target)、ロック解除後はホームへ遷移
  (旧・許容トレードオフだった宙ぶらりんラウンド問題を解消)、紙吹雪 z-index を 65 に
  (ロック画面・PINパッドの上に降らないように)
- プレビュー/CI環境では `document.hidden=true` のためタイマーが進まない(仕様: 非表示中はカウントしない)
- **雲は横に流さない(恒久決定)**: 3回「速すぎる」と指摘され、減速(46→130→260→900秒)でも
  解決しなかったため drift を廃止し、定位置で上下6pxふわふわ(cloudfloat)に変更。
  横方向のアニメーションを復活させないこと。CSS更新時は index.html の ?v= と .app-version を上げる
  (タブレットのキャッシュで旧CSSが見え続ける事故が実際に起きた)

## 今後のアイデア(未実装)

- どっちがおもい?(シーソー比較=トーナメント)、めいろ+くりかえしボタン(ループ概念)、
  ⭐カウントアップ演出、おともだち図鑑モーダル、効果音の種類追加
- 難易度の自動調整(連続正解で昇格提案)は保護者制御(PINゲート)と整合させること
