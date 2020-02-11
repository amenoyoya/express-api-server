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
|   |_ public/ # 静的ファイルホスティング
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

// 静的ファイルホスティング: /* => ./public/*
app.use('/', express.static(`${__dirname}/public`));

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

***

## Express Server + Webpack 開発

### 開発に必要なパッケージ導入
開発時に必要な Webpack 系のパッケージを導入する（公開時には Webpack でバンドルされた後のファイルを静的ホスティングするだけ）

```bash
# Webpack関連のパッケージをインストール
$ yarn add  webpack webpack-cli babel-loader @babel/core @babel/preset-env \
            babel-polyfill css-loader style-loader

# sass, scss のコンパイラを導入
$ yarn add sass-loader node-sass

# VueとVueのWebpack用ローダをインストール
$ yarn add vue vue-loader vue-template-compiler

# npm scripts を並列実行するためのパッケージをインストール
$ yarn add concurrently
```

### 構成
```bash
./
|_ app/ # Expressアプリケーション
|   |_ api/    # API提供
|   |   |_ index.js # /api/* ルーティング
|   |
|   |_ public/ # 静的ファイルホスティング
|   |   |_ js/
|   |   |   |_ (index.js) # Webpack で生成される
|   |   |
|   |   |_ index.html # ドキュメントルートファイル: js/index.js を読み込む
|   |
|   |_ app.js  # Expressサーバ｜メインスクリプト
|
|_ src/ # Webpack ソースファイル
|   |_ App.vue 
|   |_ index.js # Webpack メインソース
|
|_ package.json
|_ webpack.config.js # Webpack バンドル設定
```

#### app/public/index.html
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <!-- id: app の要素を Vue で制御 -->
    <div id="app"></div>
    <!-- Webpack でバンドルしたJSファイルを読み込む -->
    <script src="/js/index.js"></script>
</body>
</html>
```

#### src/App.vue
```html
<template>
  <div>
    <p>Hello, Vue!</p>
  </div>
</template>
```

#### src/index.js
```javascript
import Vue from 'vue'; // Vue を使う
import App from './App'; // App.vue を読み込む

// IE11/Safari9用のpolyfill
// babel-polyfill を import するだけで IE11/Safari9 に対応した JavaScript にトランスコンパイルされる
import 'babel-polyfill';

new Vue({
  el: '#app', // Vueでマウントする要素
  render: h => h(App), // App.vue をレンダリング
});
```

#### webpack.config.js
```javascript
const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  mode: 'development', // 実行モード: development => 開発, production => 本番
  entry: './src/index.js', // エントリーポイント: ソースとなる JS ファイル
  // 出力設定: => ./app/public/js/index.js
  output: {
    filename: 'index.js', // バンドル後のファイル名
    path: path.join(__dirname, 'app', 'public', 'js') // 出力先のパス（※絶対パスで指定すること）
  },
  // モジュール読み込みの設定
  module: {
    rules: [
      // .js ファイルを babel-loader でトランスコンパイル
      {
        test: /\.js$/,
        exclude: /node_modules/, // node_modules/ 内のファイルは除外
        use: [
          // babel-loader を利用
          {
            loader: 'babel-loader',
            options: {
              // @babel/preset-env の構文拡張を有効に
              presets: ['@babel/preset-env']
            }
          }
        ]
      },
      // Vue単一ファイルコンポーネント（.vue ファイル）読み込み設定
      {
        test: /\.vue$/,
        // vue-loaderを使って .vue ファイルをコンパイル
        use: [
          {
            loader: 'vue-loader',
          },
        ],
      },
      // スタイルシート（.css ファイル）読み込み設定
      {
        // .css ファイル: css-loader => vue-style-loader の順に適用
        // - css-loader: cssをJSにトランスコンパイル
        // - style-loader: <link>タグにスタイル展開
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      // Sass（.scss ファイル）コンパイル設定
      {
        // sass-loader => css-loader => vue-style-loader の順に適用
        // vue-style-loader を使うことで .vue ファイル内で <style lang="scss"> を使えるようになる
        test: /\.scss$/,
        use: ['vue-style-loader', 'css-loader', 'sass-loader'],
      },

      /* アイコンローダーの設定 */
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader?mimetype=image/svg+xml'
        }],
      },
      {
        test: /\.(ttf|eot|woff|woff2)(\d+)?(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader?mimetype=application/font-woff'
        }],
      },
    ]
  },
  // import文で読み込むモジュールの設定
  resolve: {
    extensions: [".js", ".vue"], // .js, .vue をimport可能に
    modules: ["node_modules"], // node_modulesディレクトリからも import できるようにする
    alias: {
      // vue-template-compilerに読ませてコンパイルするために必要な設定
      vue$: 'vue/dist/vue.esm.js',
    },
  },
  // VueLoaderPluginを使う
  plugins: [new VueLoaderPlugin()],
}
```

#### package.json
「Expressサーバ起動」と「Webpack監視＆バンドル」を並列実行する npm scripts を記述

```diff
  {
    ...
+   "scripts": {
+     "start": "concurrently --kill-others \"webpack --watch --watch-poll\" \"node app/app.js\""
+   }
  }
```

### 動作確認
```bash
# npm scripts: start
## => concurrently --kill-others "webpack --watch --watch-poll" "node app/app.js"
$ yarn start

# => http://localhost:3333 |> "Hello, Vue!" と表示されればOK
```
