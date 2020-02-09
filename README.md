# express-api-server

Node.js + Express で作る最小限の API サーバ

## Environment

- OS:
    - Ubuntu 18.04
    - Windows 10
- Node.js: 12.14.1
    - Yarn package manager: 1.21.1

### Setup
```bash
# create package.json
$ yarn init -y

# install express.js
$ yarn add express
```

***

## 動作確認

### Structure
```bash
./
|_ app/ # Expressアプリケーション
|   |_ api/    # API提供
|   |   |_ index.js # /api/* ルーティング
|   |
|   |_ static/ # 静的ファイルホスティング
|   |
|   |_ app.js  # Expressサーバ｜メインスクリプト
|
|_ package.json
```

#### app/app.js
```javascript
const express = require('express');
const app     = express();

// ※ Express 4.16 以降、Body-Parser機能は標準搭載されている
// ※ 4.16 未満のバージョンを使っている場合は、別途 body-parser パッケージのインストールが必要
app.use(express.json()); // クライアントデータを JSON 形式で取得可能にする
app.use(express.urlencoded({ extended: true })); // 配列型のフォームデータを取得可能にする

// API ルーティング: /api/* => ./api/index.js
app.use('/api/', require('./api/index'));

// 静的ファイルホスティング: /* => ./static/*
app.use('/', express.static(`${__dirname}/static`));

// ポート番号: $EXPRESS_PORT 環境変数 or 3333
const port = process.env.EXPRESS_PORT || 3333;

// サーバ実行
console.log(`Serving on http://localhost:${port}`);
app.listen(port);
```

#### app/api/index.js
```javascript
/**
 * /api/
 */
const express = require('express');
const router = express.Router();

// GET / == /api/ => {message: 'Hello, Express!'}
router.get('/', (req, res) => {
  res.json({
    message: 'Hello, Express!'
  });
})

// export
module.exports = router;
```

### 実行
```bash
# package.json に記述された依存パッケージをインストール
$ yarn install

# app/app.js を実行
$ node app/app.js

# => Serving on http://localhost:3333
```

- http://localhost:3333
    - 静的ファイル `app/static/index.html` がホスティングされる
- http://localhost:3333/api/
    - `app/api/index.js` でルーティングされる
    - JSONデータ `{"message": "Hello, Express!"}` が返される

***

## Docker

### Structure
```bash
./
|_ app/ # 作業ディレクトリ => docker://express:/home/node/app/
|   |_ app.js   # Expressサーバ｜https://web.local/ => docker://express:3333
|
|_ docker/ # Dockerコンテナ設定
|   |_ certs/   # SSL証明書格納ディレクトリ
|   |_ express/ # expressコンテナ
|       |_ Dockerfile
|       |_ package.json # 必要なnode_modulesを記述
|
|_ docker-compose.yml
```

### コンテナ起動
```bash
# Docker実行ユーザIDを合わせてDockerコンテナビルド
$ export UID && docker-compose build

# コンテナ起動
$ export UID && docker-compose up -d

## => https://web.local/ でサーバ稼働
```

### 本番公開時
```bash
# -- user@server

# masterブランチ pull
$ pull origin master

# docker-compose.yml の変更を無視
$ git update-index --assume-unchanged docker-compose.yml

# 本番公開用の docker-compose.yml 作成
## --host <ドメイン名>: 公開ドメイン名
## --email <メールアドレス>: Let's Encrypt 申請用メールアドレス（省略時: admin@<ドメイン名>）
## +noproxy: 複数のDockerComposeで運用していて nginx-proxy, letsencrypt コンテナが別に定義されている場合に指定
$ node handledocker.js --host yourdomain.com --email yourmail@yourdomain.com +noproxy

# Docker実行ユーザIDを合わせてDockerコンテナビルド
$ export UID && docker-compose build

# コンテナ起動
$ export UID && docker-compose up -d
```
