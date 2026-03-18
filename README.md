# BirdDex — 自分だけの野鳥図鑑

撮影した野鳥を「いつ・どこで・写真・一言メモ」で登録し、一覧・ヒートマップで振り返る個人用 Web アプリケーション。

## 技術構成

| レイヤー                      | 技術                                              |
| ----------------------------- | ------------------------------------------------- |
| フロントエンド                | SolidJS + Vite + TailwindCSS v4                   |
| ルーティング / データフェッチ | TanStack Router + Solid Query                     |
| バックエンド                  | Hono (Node.js / ESM)                              |
| ORM                           | Drizzle ORM + drizzle-kit                         |
| DB                            | PostgreSQL 16                                     |
| 画像ストレージ                | Azure Blob Storage（ローカルは RustFS / S3 互換） |
| 画像リサイズ                  | sharp                                             |
| 認証                          | GitHub OAuth（Arctic） + Cookie セッション        |
| ヒートマップ                  | Leaflet + leaflet.heat                            |
| モノレポ                      | pnpm workspaces + Turborepo                       |
| ローカル環境                  | Docker Compose（PostgreSQL + RustFS）             |
| デプロイ                      | Azure Container Apps + GitHub Actions             |
| IaC                           | Azure Bicep                                       |

## リポジトリ構成

```
bird-dex/
├── apps/
│   ├── api/                        # Hono バックエンド（DDD）
│   │   └── src/
│   │       ├── presentation/       # Hono ルート / ミドルウェア / Zod DTO
│   │       ├── application/        # ユースケース
│   │       ├── domain/             # エンティティ / 値オブジェクト / リポジトリIF
│   │       ├── infrastructure/     # Drizzle / S3 / Arctic 実装
│   │       └── di/                 # DI コンテナ
│   └── web/                        # SolidJS フロントエンド
│       └── src/
│           ├── routes/             # ページコンポーネント（TanStack Router）
│           ├── components/         # UI コンポーネント
│           └── lib/                # API クライアント / クエリ / ユーティリティ
├── packages/
│   └── shared/                     # API レスポンス共有型定義
├── docker/                         # Dockerfile + Docker Compose
├── infra/bicep/                    # Azure Bicep IaC
├── .env.example
└── turbo.json
```

## ローカル開発環境のセットアップ

### 前提条件

- Node.js >= 20
- pnpm >= 10
- Docker + Docker Compose

### 手順

**1. 依存パッケージのインストール**

```bash
pnpm install
```

**2. 環境変数の設定**

```bash
cp .env.example .env
```

`.env` を編集して GitHub OAuth の認証情報を入力する。

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
SESSION_SECRET=change-me-to-a-long-random-string-at-least-32-chars
```

> GitHub OAuth App の設定:
>
> - Homepage URL: `http://localhost:5173`
> - Callback URL: `http://localhost:3000/auth/github/callback`

**3. インフラ起動（DB + ストレージ）**

```bash
cd docker
docker compose up -d
```

PostgreSQL (`:5432`) と RustFS (`:9000`) が起動し、バケット `birdlog-photos` が自動作成される。

**4. DBマイグレーション**

```bash
pnpm --filter @bird-dex/api db:push
```

**5. 開発サーバー起動**

```bash
pnpm dev
```

| サービス          | URL                   |
| ----------------- | --------------------- |
| フロントエンド    | http://localhost:5173 |
| API               | http://localhost:3000 |
| RustFS コンソール | http://localhost:9001 |

## 主なコマンド

```bash
# 全パッケージのビルド
pnpm build

# 型チェック
pnpm type-check

# DBスキーマの変更からマイグレーションファイルを生成
pnpm --filter @bird-dex/api db:generate

# Drizzle Studio（DB ブラウザ）
pnpm --filter @bird-dex/api db:studio
```

## 環境変数一覧

| 変数                   | 説明                              | デフォルト（ローカル）                              |
| ---------------------- | --------------------------------- | --------------------------------------------------- |
| `DATABASE_URL`         | PostgreSQL 接続文字列             | `postgres://birdlog:birdlog@localhost:5432/birdlog` |
| `BLOB_ENDPOINT`        | S3 互換ストレージのエンドポイント | `http://localhost:9000`                             |
| `BLOB_ACCESS_KEY`      | ストレージアクセスキー            | `rustfsadmin`                                       |
| `BLOB_SECRET_KEY`      | ストレージシークレット            | `rustfsadmin`                                       |
| `BLOB_BUCKET`          | バケット名                        | `birdlog-photos`                                    |
| `GITHUB_CLIENT_ID`     | GitHub OAuth App クライアント ID  | —                                                   |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App シークレット     | —                                                   |
| `GITHUB_REDIRECT_URI`  | OAuth コールバック URL            | `http://localhost:3000/auth/github/callback`        |
| `SESSION_SECRET`       | セッション署名キー（32文字以上）  | —                                                   |
| `PORT`                 | API サーバーポート                | `3000`                                              |
| `CORS_ORIGIN`          | CORS 許可オリジン                 | `http://localhost:5173`                             |
| `VITE_API_URL`         | フロントからの API 向け URL       | `http://localhost:3000`                             |

## API エンドポイント

| Method | Path                        | 説明                                       |
| ------ | --------------------------- | ------------------------------------------ |
| GET    | `/auth/github`              | GitHub OAuth 開始                          |
| GET    | `/auth/github/callback`     | OAuth コールバック                         |
| POST   | `/auth/logout`              | ログアウト                                 |
| GET    | `/auth/me`                  | ログイン中のユーザー情報                   |
| GET    | `/api/sightings`            | 観察記録一覧（ページネーション・フィルタ） |
| POST   | `/api/sightings`            | 観察記録の新規登録                         |
| GET    | `/api/sightings/:id`        | 観察記録の詳細                             |
| PUT    | `/api/sightings/:id`        | 観察記録の更新                             |
| DELETE | `/api/sightings/:id`        | 観察記録の削除                             |
| GET    | `/api/sightings/heatmap`    | ヒートマップ用座標データ                   |
| GET    | `/api/species`              | 野鳥マスタ一覧                             |
| POST   | `/api/species`              | 野鳥マスタの作成                           |
| GET    | `/api/species/:id`          | 野鳥マスタの詳細                           |
| PUT    | `/api/species/:id`          | 野鳥マスタの更新                           |
| DELETE | `/api/species/:id`          | 野鳥マスタの削除                           |
| GET    | `/api/species/:id/photos`   | 野鳥別写真一覧                             |
| POST   | `/api/sightings/:id/photos` | 写真アップロード                           |
| PUT    | `/api/photos/:id`           | 写真メタデータの更新                       |
| DELETE | `/api/photos/:id`           | 写真の削除                                 |

## 画面構成

| 画面                 | パス                  |
| -------------------- | --------------------- |
| ログイン             | `/login`              |
| ダッシュボード       | `/`                   |
| 野鳥図鑑一覧         | `/species`            |
| 野鳥詳細・ギャラリー | `/species/:id`        |
| 野鳥マスタ管理       | `/species/manage`     |
| 観察記録一覧         | `/sightings`          |
| 観察記録詳細         | `/sightings/:id`      |
| 新規観察記録         | `/sightings/new`      |
| 観察記録編集         | `/sightings/:id/edit` |
| ヒートマップ         | `/map`                |

## デプロイ

Azure へのデプロイは GitHub Actions で自動化されている。

- **PR**: ビルド + 型チェック
- **main へのマージ**: ACR へのイメージ push + Container Apps へのデプロイ

Bicep テンプレートによる Azure リソースの初期構築:

```bash
az deployment sub create \
  --location japaneast \
  --template-file infra/bicep/main.bicep \
  --parameters infra/bicep/main.bicepparam
```
