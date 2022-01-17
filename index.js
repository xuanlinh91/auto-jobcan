const puppeteer = require('puppeteer');
const {WebClient} = require('@slack/web-api');
const axios = require('axios');
const moment = require("moment");
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
const holidays = [];

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
    const loginJobcanMobile = async () => {
        let page = await browser.newPage();
        // grant permission
        const context = browser.defaultBrowserContext()
        await context.overridePermissions("https://ssl.jobcan.jp/m/work/accessrecord?_m=adit", ['geolocation'])
        //set the location to your home
        await page.setGeolocation({latitude: 35.66204275692751, longitude: 139.86570839565226})
        const devices = puppeteer.devices;
        const iPhone = devices['iPhone 7'];
        await page.emulate(iPhone);
        await page.goto('https://ssl.jobcan.jp/login/mb-employee?err=1&lang_code=ja')
        await page.type('#client_id', "PNL")
        await page.type('#email', "linh.nguyen@playnext-lab.co.jp")
        await page.type('#password', "cZ22u5b3")
        await page.click('button[type=submit]')
        await page.waitForSelector('#tab')
        await page.goto('https://ssl.jobcan.jp/m/work/accessrecord?_m=adit')

        return page;
    }

    const loginJobcanPC = async () => {
        let page = await browser.newPage();
        await page.goto('https://id.jobcan.jp/users/sign_in')
        await page.type('#user_email', "linh.nguyen@playnext-lab.co.jp")
        await page.type('#user_password', "Playnext@123")
        await page.click('.form__login')
        await page.waitForSelector('#jbc-app-links')
        await page.goto('https://ssl.jobcan.jp/jbcoauth/login');

        return page;
    }

    const setWorkingStatus = async (page) => {
        console.log(`${moment().format()}: setWorkingStatus`);
        await page.waitForSelector('#adit_item_1');
        await page.click('#adit_item_1');
        // await page.waitFor(3000);
        await page.waitForSelector('input[type=submit]#yes');
        await page.click('input[type=submit]#yes');
        // todo click modoru
        // let statusDoubleCheck = await page.$eval('#form1 > div:nth-of-type(2)', el => el.innerHTML);
        // console.log("Status after click: ", statusDoubleCheck);

        // await page.waitForSelector('#working_status')
        // await page.waitForSelector('#adit-button-push')
        // await page.click('#adit-button-push')
        // await page.waitFor(3000)
        // let statusDoubleCheck = await page.$eval('#working_status', el => el.innerHTML);
        // console.log("Status after click: ", statusDoubleCheck);
    }

    const isHoliday = (day) => {
        let found = holidays.find(element => element[0] === day.getFullYear()
            && element[1] === (day.getMonth() + 1)
            && element[2] === day.getDate());

        return (day.getDay() !== 0 && day.getDay() !== 6 && found !== undefined);
    }

    const getHolidays = async () => {
        let pcPage = await loginJobcanPC();
        await pcPage.goto('https://ssl.jobcan.jp/employee/attendance');

        const allDatesOfMonth = await pcPage.$$('#search-result .table-responsive .table.jbc-table.text-center tbody tr');
        for (const dateEl of allDatesOfMonth) {
            let item = await dateEl.$eval('td:nth-child(2)', el => el.innerText);
            if (item !== "") {
                let href = await dateEl.$eval('td:first-child a', el => el.href);
                let url = new URL(href);
                let date = url.search.substring(1).split('&').map(day => +day.split('=')[1]);
                holidays.push(date);
            }
        }

        console.log("Holiday lists:");
        console.log(holidays);
    }

    const slackChat = async () => {
        const result = await web.chat.postMessage({
            text: 'おはようございます。本日の業務を開始いたします。',
            channel: conversationId,
        });

        console.log(`${moment().format()}: Successfully send message ${result.ts} in conversation ${conversationId}`);
    };

    const notifyMe = async () => {
        const result = await bot.chat.postMessage({
            text: '<@UUMME27NX>　おはようございます。本日の業務を開始いたします。',
            link_names: true,
            channel: mySelfChannel,
        });

        await bot.chat.postMessage({
            text: 'おはようございます。本日の業務を開始いたします。',
            // link_names: true,
            channel: me,
        });
    };


    let flagUrl = "https://docs.google.com/uc?export=download&id=173KRHfcTTGzDwSx0xvBSy_SmZSKOKO6K";
    let result = await axios.get(flagUrl);
    if (!result.data) {
        // If flag is not enable then do nothing
        console.log(`${moment().format()}: Disabled!`);
        return;
    }

    const browser = await puppeteer.launch({
        // headless: true, args: ["--no-sandbox"]})
        headless: true, executablePath: '/usr/bin/chromium-browser'
        // headless:false
    });

    await getHolidays();
    if (isHoliday(new Date())) {
        console.log(`${moment().format()}: Today is holiday`);
        return false;
    }

    let mobilePage = await loginJobcanMobile();
    // const workingStatus = await page.$eval('#working_status', el => el.innerHTML);
    const workingStatus = await mobilePage.$eval('#form1 > div:nth-of-type(2)', el => el.innerHTML);
    console.log(`${moment().format()}: workingStatus: `, workingStatus);
    if (!workingStatus) {
        console.log(`${moment().format()}: Can not get working status info`);
        await browser.close();
        return false;
    }

    if (workingStatus === "勤務中") {
        console.log(`${moment().format()}: Working status has been set already: `, workingStatus);
        await browser.close();
        return false;
    }

    if (workingStatus === "未出勤") {
        await setWorkingStatus(mobilePage);
        await browser.close();
        await slackChat();
        await notifyMe();
    }
})();
