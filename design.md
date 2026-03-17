# BirdDex — 自分だけの野鳥図鑑 設計書

## 1. プロジェクト概要

撮影した野鳥を記録し、自分だけの図鑑を作成する Web アプリケーション。

- **コンセプト**: 撮影した野鳥を「いつ・どこで・写真・一言メモ」で登録し、一覧・ヒートマップで振り返る
- **ユーザー**: 自分専用（GitHub OAuth 認証）

---

## 2. 技術構成

| レイヤー       | 技術                   | 備考                                          |
| -------------- | ---------------------- | --------------------------------------------- |
| フロントエンド | SolidJS + Vite         | TanStack Router, Solid Query                  |
| バックエンド   | Hono (Node.js)         | REST API                                      |
| ORM            | Drizzle ORM            | TypeScript-first, マイグレーション管理        |
| DB             | PostgreSQL 16          |                                               |
| 画像ストレージ | Azure Blob Storage     | ローカルは RustFS で代替（S3互換）            |
| 認証           | GitHub OAuth           | Arctic ライブラリ + セッション管理            |
| ヒートマップ   | Leaflet + leaflet.heat | OpenStreetMap タイルベース                    |
| モノレポ管理   | pnpm workspaces        | Turborepo でビルド最適化                      |
| ローカル環境   | Docker Compose         | PostgreSQL + RustFS + アプリ                  |
| デプロイ先     | Azure Container Apps   | Azure Database for PostgreSQL Flexible Server |

---

## 3. モノレポ構成

```
birdlog/
├── apps/
│   ├── web/                  # SolidJS フロントエンド
│   │   ├── src/
│   │   │   ├── routes/       # ページコンポーネント
│   │   │   ├── components/   # 共通コンポーネント
│   │   │   ├── lib/          # API クライアント, ユーティリティ
│   │   │   └── assets/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                  # Hono バックエンド (DDD)
│       ├── src/
│       │   ├── presentation/       # Presentation 層
│       │   │   ├── routes/         #   Hono ルート定義
│       │   │   ├── middleware/     #   認証, エラーハンドリング, バリデーション
│       │   │   └── dto/            #   リクエスト / レスポンス型 + Zod スキーマ
│       │   ├── application/        # Application 層
│       │   │   ├── use-cases/      #   ユースケース (RegisterSighting, AddPhoto, etc.)
│       │   │   └── dto/            #   アプリケーション層の入出力型
│       │   ├── domain/             # Domain 層
│       │   │   ├── entities/       #   エンティティ (Sighting, Species, Photo, User)
│       │   │   ├── value-objects/  #   値オブジェクト (Coordinates, SpeciesName)
│       │   │   ├── repositories/   #   リポジトリインターフェース (ISightingRepo, etc.)
│       │   │   └── services/       #   ドメインサービス
│       │   ├── infrastructure/     # Infrastructure 層
│       │   │   ├── db/             #   Drizzle スキーマ, マイグレーション
│       │   │   ├── repositories/   #   リポジトリ実装 (DrizzleSightingRepo, etc.)
│       │   │   ├── storage/        #   Blob Storage クライアント (S3 互換)
│       │   │   └── auth/           #   GitHub OAuth クライアント (Arctic)
│       │   ├── di/                 # DI コンテナ (依存性注入の組み立て)
│       │   │   └── container.ts
│       │   └── index.ts
│       ├── drizzle.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared/               # 共有型定義 (API レスポンス型など)
│       ├── src/
│       │   └── types.ts
│       ├── tsconfig.json
│       └── package.json
│
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   └── docker-compose.yml
│
├── infra/                    # Azure デプロイ設定
│   └── bicep/                # IaC (Bicep テンプレート)
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── .env.example
```

---

## 3.1 DDD レイヤー設計（API）

### 各レイヤーの責務

| レイヤー       | 責務                                                                                         | 依存先                         |
| -------------- | -------------------------------------------------------------------------------------------- | ------------------------------ |
| Presentation   | HTTP の入出力を担当。Hono ルート定義、リクエストバリデーション（Zod）、レスポンス整形        | Application                    |
| Application    | ユースケースの実行。トランザクション制御、複数ドメインサービスの協調                         | Domain                         |
| Domain         | ビジネスルールの中核。エンティティ、値オブジェクト、リポジトリインターフェース。外部依存なし | なし（最内層）                 |
| Infrastructure | 技術的な実装詳細。DB アクセス（Drizzle）、Blob Storage、OAuth クライアント                   | Domain（インターフェース実装） |

### 依存関係のルール

- 依存は常に外側 → 内側（Presentation → Application → Domain）
- Infrastructure は Domain 層のリポジトリインターフェースを実装する（依存性逆転）
- Domain 層は Drizzle, Hono, S3 クライアントなど具体的な技術に依存しない
- DI コンテナ（`di/container.ts`）でインターフェースと実装を束ねる

### 主要なドメインモデル

**エンティティ**: `User`, `Species`, `Sighting`, `Photo`
**値オブジェクト**: `Coordinates`（lat/lng のバリデーション付き）, `SpeciesName`（空文字・重複チェック）, `BlobKey`（ストレージパス生成ロジック）
**リポジトリインターフェース**: `IUserRepository`, `ISpeciesRepository`, `ISightingRepository`, `IPhotoRepository`, `IBlobStorage`

### 主要なユースケース

- `RegisterSighting` — 観察記録の新規登録
- `AddPhotoToSighting` — 写真アップロード + 種の紐づけ
- `ManageSpecies` — 野鳥マスタの CRUD（削除時の写真存在チェック含む）
- `GetSpeciesGallery` — 野鳥別写真一覧の取得
- `GetHeatmapData` — ヒートマップ用座標データの集計

---

## 4. データベーススキーマ

### users テーブル

| カラム     | 型          | 制約                          | 説明                |
| ---------- | ----------- | ----------------------------- | ------------------- |
| id         | UUID        | PK, default gen_random_uuid() |                     |
| github_id  | VARCHAR     | UNIQUE, NOT NULL              | GitHub ユーザーID   |
| username   | VARCHAR     | NOT NULL                      | GitHub ユーザー名   |
| avatar_url | VARCHAR     |                               | GitHub アバター URL |
| created_at | TIMESTAMPTZ | NOT NULL, default now()       |                     |

### species テーブル（野鳥マスタ）

ユーザーが自分で作成・管理する野鳥の種類マスタ。

| カラム      | 型           | 制約                          | 説明                 |
| ----------- | ------------ | ----------------------------- | -------------------- |
| id          | UUID         | PK, default gen_random_uuid() |                      |
| user_id     | UUID         | FK → users.id, NOT NULL       |                      |
| name        | VARCHAR(200) | NOT NULL                      | 種名（例: カワセミ） |
| description | TEXT         |                               | 特徴メモ（任意）     |
| sort_order  | INT          | NOT NULL, default 0           | 表示順               |
| created_at  | TIMESTAMPTZ  | NOT NULL, default now()       |                      |
| updated_at  | TIMESTAMPTZ  | NOT NULL, default now()       |                      |

**ユニーク制約**: `(user_id, name)` — 同一ユーザー内での種名重複を防止
**インデックス**: `(user_id, sort_order)`

### sightings テーブル（観察記録）

「いつ・どこで」の撮影行動を記録。種名は写真側で管理する。

| カラム        | 型             | 制約                          | 説明           |
| ------------- | -------------- | ----------------------------- | -------------- |
| id            | UUID           | PK, default gen_random_uuid() |                |
| user_id       | UUID           | FK → users.id, NOT NULL       |                |
| memo          | TEXT           |                               | 一言メモ       |
| sighted_at    | DATE           | NOT NULL                      | 撮影日         |
| latitude      | DECIMAL(10, 7) | NOT NULL                      | 緯度           |
| longitude     | DECIMAL(10, 7) | NOT NULL                      | 経度           |
| location_name | VARCHAR(200)   |                               | 場所名（任意） |
| created_at    | TIMESTAMPTZ    | NOT NULL, default now()       |                |
| updated_at    | TIMESTAMPTZ    | NOT NULL, default now()       |                |

**インデックス**: `(user_id, sighted_at DESC)`

### photos テーブル

写真ごとに野鳥マスタを紐づける。1回の撮影で複数種を撮影した場合にも対応。

| カラム            | 型          | 制約                                          | 説明                      |
| ----------------- | ----------- | --------------------------------------------- | ------------------------- |
| id                | UUID        | PK, default gen_random_uuid()                 |                           |
| sighting_id       | UUID        | FK → sightings.id ON DELETE CASCADE, NOT NULL |                           |
| species_id        | UUID        | FK → species.id ON DELETE RESTRICT, NOT NULL  | 写真に写っている野鳥      |
| blob_url          | VARCHAR     | NOT NULL                                      | Azure Blob / MinIO の URL |
| thumbnail_url     | VARCHAR     |                                               | サムネイル URL            |
| original_filename | VARCHAR     | NOT NULL                                      | 元のファイル名            |
| sort_order        | INT         | NOT NULL, default 0                           | 表示順                    |
| created_at        | TIMESTAMPTZ | NOT NULL, default now()                       |                           |

**インデックス**: `(species_id, created_at DESC)` — 野鳥別写真一覧用

---

## 5. API エンドポイント

### 認証

| Method | Path                    | 説明                              |
| ------ | ----------------------- | --------------------------------- |
| GET    | `/auth/github`          | GitHub OAuth 開始（リダイレクト） |
| GET    | `/auth/github/callback` | コールバック処理 → セッション発行 |
| POST   | `/auth/logout`          | セッション破棄                    |
| GET    | `/auth/me`              | 現在のユーザー情報                |

### 観察記録 (Sightings)

| Method | Path                 | 説明                                       |
| ------ | -------------------- | ------------------------------------------ |
| GET    | `/api/sightings`     | 一覧取得（ページネーション, フィルタ対応） |
| GET    | `/api/sightings/:id` | 詳細取得（写真 + 種名含む）                |
| POST   | `/api/sightings`     | 新規登録                                   |
| PUT    | `/api/sightings/:id` | 更新                                       |
| DELETE | `/api/sightings/:id` | 削除（写真も CASCADE）                     |

**GET /api/sightings クエリパラメータ**:

- `page`, `limit` — ページネーション
- `species_id` — 野鳥マスタ ID でフィルタ
- `from`, `to` — 日付範囲
- `sort` — `date_desc`（デフォルト）, `date_asc`

### 野鳥マスタ (Species)

| Method | Path                      | 説明                                             |
| ------ | ------------------------- | ------------------------------------------------ |
| GET    | `/api/species`            | 一覧取得（写真数カウント付き）                   |
| GET    | `/api/species/:id`        | 詳細取得                                         |
| POST   | `/api/species`            | 新規作成                                         |
| PUT    | `/api/species/:id`        | 更新（名前, 説明, 並び順）                       |
| DELETE | `/api/species/:id`        | 削除（写真が紐づいていたら 409 エラー）          |
| GET    | `/api/species/:id/photos` | この野鳥の写真一覧（撮影日順, ページネーション） |

### 写真 (Photos)

| Method | Path                        | 説明                                       |
| ------ | --------------------------- | ------------------------------------------ |
| POST   | `/api/sightings/:id/photos` | 写真アップロード（multipart + species_id） |
| PUT    | `/api/photos/:id`           | 写真メタ更新（species_id 変更など）        |
| DELETE | `/api/photos/:id`           | 写真削除                                   |

### ヒートマップ

| Method | Path                     | 説明                      |
| ------ | ------------------------ | ------------------------- |
| GET    | `/api/sightings/heatmap` | 全記録の座標 + 重みを返す |

---

## 6. 画面構成

| 画面           | パス                  | 概要                                                      |
| -------------- | --------------------- | --------------------------------------------------------- |
| ログイン       | `/login`              | GitHub ログインボタン                                     |
| ダッシュボード | `/`                   | 統計サマリー + 最近の記録                                 |
| 図鑑一覧       | `/species`            | 登録した野鳥マスタをカード形式で一覧（代表写真 + 写真数） |
| 野鳥詳細       | `/species/:id`        | 野鳥の情報 + その野鳥の写真ギャラリー                     |
| 野鳥マスタ管理 | `/species/manage`     | 野鳥の追加・編集・削除・並べ替え                          |
| 観察記録一覧   | `/sightings`          | 撮影記録を時系列で一覧                                    |
| 記録詳細       | `/sightings/:id`      | 写真・メモ・地図ピン                                      |
| 新規記録       | `/sightings/new`      | フォーム（日付, 位置, メモ, 写真 + 種選択）               |
| 記録編集       | `/sightings/:id/edit` | 登録内容の編集                                            |
| ヒートマップ   | `/map`                | Leaflet 地図上にヒートマップ表示（種でフィルタ可）        |

---

## 7. 認証フロー

1. ユーザーが「GitHub でログイン」をクリック
2. API が GitHub OAuth URL へリダイレクト（Arctic で生成）
3. GitHub で認可後、コールバック URL に code が返る
4. API が code → access_token を取得、GitHub API でユーザー情報取得
5. users テーブルに upsert（初回は新規作成）
6. セッション Cookie（HttpOnly, Secure, SameSite=Lax）を発行
7. フロントに リダイレクト

---

## 8. 画像アップロードフロー

1. フロントから `POST /api/sightings/:id/photos` に multipart/form-data で送信（`species_id` を含む）
2. API がファイルバリデーション（MIME type, サイズ上限 10MB）
3. `species_id` が現在のユーザーのマスタに存在するか検証
4. ファイル名を `{sighting_id}/{uuid}.{ext}` で生成
5. Azure Blob Storage（ローカルは RustFS）にアップロード
6. サムネイル生成（リサイズ済み画像を別キーで保存）
7. photos テーブルに blob_url, thumbnail_url, species_id を保存
8. レスポンスで photo オブジェクトを返す

---

## 9. Docker Compose（ローカル開発）

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: birdlog
      POSTGRES_USER: birdlog
      POSTGRES_PASSWORD: birdlog
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

  rustfs:
    image: rustfs/rustfs:latest
    ports:
      - '9000:9000'
      - '9001:9001'
    environment:
      RUSTFS_ROOT_USER: rustfsadmin
      RUSTFS_ROOT_PASSWORD: rustfsadmin
    volumes:
      - rustfsdata:/data
      - rustfslogs:/logs

  api:
    build:
      context: .
      dockerfile: docker/Dockerfile.api
    environment:
      DATABASE_URL: postgres://birdlog:birdlog@db:5432/birdlog
      BLOB_ENDPOINT: http://rustfs:9000
      BLOB_ACCESS_KEY: rustfsadmin
      BLOB_SECRET_KEY: rustfsadmin
      BLOB_BUCKET: birdlog-photos
      GITHUB_CLIENT_ID: ${GITHUB_CLIENT_ID}
      GITHUB_CLIENT_SECRET: ${GITHUB_CLIENT_SECRET}
      SESSION_SECRET: ${SESSION_SECRET}
    ports:
      - '3000:3000'
    depends_on:
      - db
      - rustfs

  web:
    build:
      context: .
      dockerfile: docker/Dockerfile.web
    ports:
      - '5173:5173'
    depends_on:
      - api

volumes:
  pgdata:
  rustfsdata:
  rustfslogs:
```

---

## 10. Azure デプロイ構成

| Azure サービス                                | 用途                     |
| --------------------------------------------- | ------------------------ |
| Azure Container Apps                          | API + Web のコンテナ実行 |
| Azure Database for PostgreSQL Flexible Server | DB                       |
| Azure Blob Storage                            | 写真ストレージ           |
| Azure Container Registry                      | Docker イメージ管理      |

CI/CD は GitHub Actions を想定：push → build → ACR push → Container Apps デプロイ。

---

## 11. 環境変数一覧

```env
# Database
DATABASE_URL=postgres://user:pass@host:5432/birdlog

# Blob Storage
BLOB_ENDPOINT=https://<account>.blob.core.windows.net  # Azure
BLOB_ACCESS_KEY=
BLOB_SECRET_KEY=
BLOB_BUCKET=birdlog-photos

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback

# Session
SESSION_SECRET=

# App
NODE_ENV=development
API_URL=http://localhost:3000      # フロントから API への URL
CORS_ORIGIN=http://localhost:5173  # CORS 許可オリジン
```

---

## 12. 開発の進め方（推奨マイルストーン）

### Phase 1: 基盤構築

- モノレポセットアップ（pnpm + Turborepo）
- Docker Compose 環境構築
- Drizzle スキーマ定義 + マイグレーション
- Hono サーバー起動 + ヘルスチェック

### Phase 2: 認証

- GitHub OAuth フロー実装（Arctic）
- セッション管理ミドルウェア
- `/auth/me` エンドポイント

### Phase 3: CRUD コア

- 野鳥マスタ CRUD API + 管理画面
- 観察記録の CRUD API
- SolidJS での一覧・詳細・登録フォーム
- 写真アップロード（MinIO 連携）+ 種の選択 UI
- 野鳥別写真ギャラリー画面

### Phase 4: ヒートマップ

- `/api/sightings/heatmap` API
- Leaflet + leaflet.heat でフロント実装

### Phase 5: デプロイ

- Dockerfile 最適化（マルチステージビルド）
- Bicep テンプレートで Azure リソース構築
- GitHub Actions CI/CD パイプライン
