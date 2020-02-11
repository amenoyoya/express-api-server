/**
 * Puppeteerスクレイピング実験
 * puppeteerでよく使うであろう処理の書き方: https://qiita.com/rh_taro/items/32bb6851303cbc613124
 */
const puppeteer = require('puppeteer');

puppeteer.launch({
  headless: false, // 画面を表示させる
  slowMo: 300,     // 動作確認のためゆっくり目に動かす
}).then(async browser => {
  const page = await browser.newPage();

  await page.setViewport({width: 1200, height: 800}); // view port 設定
  await page.goto('https://www.google.co.jp/', {
    waitUntil: 'domcontentloaded' // DOM読み込みが完了するまで待機
  });
  await page.type('input[name="q"]', 'puppeteer'); // 検索窓に "puppeteer" と入力
  await page.click('input[name="btnK"]'); // 検索ボタンをクリック
  await page.waitFor(3000); // 3秒待つ
  browser.close();
});
