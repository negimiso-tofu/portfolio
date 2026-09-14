# tax-hp — あおば税理士事務所（架空・制作見本）

ポートフォリオ用のコーポレートサイト見本。**士業サイトの型**を1本作りきることが目的です。

## 状態

| 工程 | 担当 | 状態 |
|---|---|---|
| 骨子（HTML構造・SEO・アクセシビリティ） | クラリス（Claude Code） | ✅ 完了（2026-09-11） |
| デザイン（配色・タイポ・余白・演出） | Codex | ⏳ 未着手 |
| 画像（ヒーロー・代表写真・OGP） | リュミエール | ⏳ 未着手 |
| 公開 | マスター | ⏳ 未着手 |

## 構成

```
tax-hp/
├─ index.html      トップ
├─ service.html    サービス・料金（#komon #kakutei #sogyo #sozoku #price #faq）
├─ about.html      事務所概要・アクセス
├─ contact.html    お問い合わせ（フォーム）
├─ styles.css      骨子用。Codexが全面的に書き換えてよい
├─ script.js       スマホ用ナビ開閉のみ
├─ sitemap.xml     本番ドメイン直下に置き直すこと
├─ robots.txt      同上（サブフォルダでは無効）
└─ assets/
   ├─ favicon.svg  仮
   ├─ ogp.png      ★未作成
   ├─ hero-office.webp ★未作成
   └─ daihyo.webp  ★未作成
```

## 入れてあるSEO・アクセシビリティ

- ページ固有の `title` / `meta description` / `canonical`
- OGP・Twitterカード（画像は未作成）
- 構造化データ：`AccountingService`（LocalBusiness系）／`WebSite`／`BreadcrumbList`／`Service`＋`Offer`／`FAQPage`／`Person`／`ContactPage`
- 見出し階層は `h1` 1本 → `h2` → `h3` の順で飛ばさない
- 表示パンくず ＋ `BreadcrumbList` を一致させる
- スキップリンク、`:focus-visible`、`aria-current="page"`、`aria-expanded`／`hidden` の連動
- 表は `caption` と `th scope` あり、横スクロールは `.table-scroll` で包む
- フォームは `label` と `for` の対応、`autocomplete`、`inputmode` を指定
- `prefers-reduced-motion` に対応

## Codexへの引き継ぎ事項

1. `styles.css` の冒頭コメントにある **残すべき3点** は消さないこと
2. `.img-placeholder` は画像が入るところ。`role="img"` と `aria-label` の文言をそのまま `alt` に移す
3. 画像は `<picture>` ＋ WebP、`width`/`height` 指定、ファーストビュー以外は `loading="lazy"`
4. Googleマップの `iframe` には `title` と `loading="lazy"` を必ず付ける
5. ヘッダーとフッターは4ページで同じHTML。1つ直したら4つとも直すこと
6. フォームの `action="#"` は仮。送信先（Formspree等）は別途決める

詳細なデザイン指示は作業フォルダの `プロンプト_Codex税理士HPデザイン_20260911.md` を参照。
