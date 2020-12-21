const puppeteer = require('puppeteer');
const { WebClient } = require('@slack/web-api');
const axios = require('axios');
const holiday = {
    "2020-11-03": "文化の日",
    "2020-11-23": "勤労感謝の日",
    "2020-12-28": "x",
    "2020-12-29": "x",
    "2020-12-30": "x",
    "2020-12-31": "x",
    "2021-01-01": "元日",
    "2021-01-11": "成人の日",
    "2021-02-11": "建国記念の日",
    "2021-02-23": "天皇誕生日",
    "2021-03-20": "春分の日",
    "2021-04-29": "昭和の日",
    "2021-05-03": "憲法記念日",
    "2021-05-04": "みどりの日",
    "2021-05-05": "こどもの日",
    "2021-07-22": "海の日",
    "2021-07-23": "体育の日",
    "2021-08-08": "山の日",
    "2021-08-09": "休日 山の日",
    "2021-09-20": "敬老の日",
    "2021-09-23": "秋分の日",
    "2021-11-03": "文化の日",
    "2021-11-23": "勤労感謝の日"
};

const token = "xoxp-69753451537-973728075779-1585639265202-a2f1402e6a167ea2bc3197c87ef4bdde";
const bot_token = "xoxb-69753451537-1589161877795-cNvXeaMWhuHLnNjWGtDV2YSS";
// Initialize
const web = new WebClient(token);
const bot = new WebClient(bot_token);
// si-kintai
const conversationId = 'GGE3NAENR';

const mySelfChannel = 'G01HPH3Q1ND';

const me = 'DUP30DHJ5';
// const conversationId = 'DUP30DHJ5';

(async () => {
    const loginJobcan = async () => {
        await page.goto('https://id.jobcan.jp/users/sign_in')
        await page.type('#user_email', "linh.nguyen@playnext-lab.co.jp")
        await page.type('#user_password', "Playnext@123")
        await page.click('.form__login')
        await page.waitForSelector('#jbc-app-links')
        await page.goto('https://ssl.jobcan.jp/jbcoauth/login')
    }

    const setWorkingStatus = async () => {
        await page.waitForSelector('#working_status')
        await page.waitForSelector('#adit-button-push')
        await page.click('#adit-button-push')
        await page.waitFor(3000)
        let statusDoubleCheck = await page.$eval('#working_status', el => el.innerHTML);
        console.log("Status after click: ", statusDoubleCheck);
        //Todo send notification
    }

    const isWorkingDay = (day) => {
        let isoDate = day.toISOString().substring(0, 10)
        if (day.getDay() !== 0 && day.getDay() !== 6 && !(isoDate in holiday)) {
            return true;
        } else return false;
    }

    const slackChat = async () => {
        const result = await web.chat.postMessage({
            text: 'おはようございます。本日の業務を開始いたします。',
            channel: conversationId,
        });

        console.log(`Successfully send message ${result.ts} in conversation ${conversationId}`);
    };

    const notifyMe = async () => {
      const result = await bot.chat.postMessage({
        text: '<@UUMME27NX>　おはようございます。本日の業務を開始いたします。',
        link_names: true,
        channel: mySelfChannel,
      });

      const result = await bot.chat.postMessage({
        text: 'おはようございます。本日の業務を開始いたします。',
        // link_names: true,
        channel: me,
      });

      // The result contains an identifier for the message, `ts`.
      console.log(`Successfully send message ${result.ts} in conversation ${conversationId}`);
    };

    let now = new Date();
    if (!isWorkingDay(now)) {
        console.log("Today is holiday");
        return false
    }

    let flagUrl = "https://docs.google.com/uc?export=download&id=173KRHfcTTGzDwSx0xvBSy_SmZSKOKO6K";
    let result = await axios.get(flagUrl);
    if (!result.data) {
        // If flag is not enable then do nothing
        console.log("Disabled!");
        return;
    }

    const browser = await puppeteer.launch({
        // headless: true, args: ["--no-sandbox"]})
        headless: true, executablePath: '/usr/bin/chromium-browser'})
    const page = await browser.newPage();

    await loginJobcan()
    const workingStatus = await page.$eval('#working_status', el => el.innerHTML);
    if (!workingStatus) {
        console.log("Can not get working status info");
        browser.close();
        return false
    }

    if (workingStatus === "勤務中") {
        console.log("Working status has been set already: ", workingStatus);
        browser.close();
        return false
    }

    if (workingStatus === "未出勤" && isWorkingDay(now)) {
        await setWorkingStatus()
        browser.close();
        await slackChat()
    }
})();
