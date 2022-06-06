const puppeteer = require('puppeteer');
const {WebClient} = require('@slack/web-api');
const axios = require('axios');
const moment = require("moment");
const {TimeoutError} = require("puppeteer/lib/cjs/puppeteer/common/Errors");
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
        await page.waitForSelector('#tab', {timeout: 5000})
        await page.goto('https://ssl.jobcan.jp/m/work/accessrecord?_m=adit')

        return page;
    }

    const loginJobcanPC = async () => {
        let page = await browser.newPage();
        await page.goto('https://id.jobcan.jp/users/sign_in')
        await page.type('#user_email', "linh.nguyen@playnext-lab.co.jp")
        await page.type('#user_password', "Playnext@123")
        await page.click('.form__login')
        await page.waitForSelector('#jbc-app-links', {timeout: 5000})
        await page.goto('https://ssl.jobcan.jp/jbcoauth/login');

        return page;
    }

    const setWorkingStatus = async (page) => {
        console.log(`${moment().format()}: setWorkingStatus`);
        await page.waitForSelector('#adit_item_1', {timeout: 5000});
        console.log(`${moment().format()}: before click #adit_item_1`);
        await page.click('#adit_item_1');
        console.log(`${moment().format()}: after click #adit_item_1`);
        try {
            await page.waitForSelector('input[type=submit]#yes', {timeout: 5000});
        } catch (e) {
            if (e instanceof TimeoutError) {
                console.log(`${moment().format()}: Timeout error`);
                await screenShot(page);
                await page.waitForSelector('.center_btn > a', {timeout: 5000});
                await page.click('.center_btn > a');
                await page.waitForSelector('input[type=submit]#yes', {timeout: 5000});
            }
        } finally {
            console.log(`${moment().format()}: before submit`);
            await page.click('input[type=submit]#yes');
        }
        console.log(`${moment().format()}: after submit`);
    }

    const getWorkingStatus = async (page) => {
        console.log(`${moment().format()}: getWorkingStatus`);
        await page.goto('https://ssl.jobcan.jp/m/work/accessrecord?_m=adit');
        await page.waitForSelector('#form1', {timeout: 5000});
        let status = page.$eval('#form1 > div:nth-of-type(2)', el => el.innerHTML);
        return status;
    }

    const isHoliday = (day) => {
        let found = holidays.find(element => element[0] === day.getFullYear()
            && element[1] === (day.getMonth() + 1)
            && element[2] === day.getDate());

        return (day.getDay() === 0 || day.getDay() === 6 || found !== undefined);
    }

    const getHolidays = async () => {
        let pcPage = await loginJobcanPC();
        await pcPage.goto('https://ssl.jobcan.jp/employee/attendance');

        const allDatesOfMonth = await pcPage.$$('#search-result .table-responsive .table.jbc-table.text-center tbody tr');
        for (const dateEl of allDatesOfMonth) {
            // 祝日確認
            let item = await dateEl.$eval('td:nth-child(2)', el => el.innerText);
            if (item !== "") {
                let href = await dateEl.$eval('td:first-child a', el => el.href);
                let url = new URL(href.toString());
                let date = url.search.substring(1).split('&').map(day => +day.split('=')[1]);
                holidays.push(date);
            } else {
                // 有給確認
                let lastItem = await dateEl.$eval('td:last-child', el => el.innerText);
                if (lastItem !== "" && lastItem === "有") {
                    let href = await dateEl.$eval('td:first-child a', el => el.href);
                    let url = new URL(href);
                    let date = url.search.substring(1).split('&').map(day => +day.split('=')[1]);
                    holidays.push(date);
                }
            }
        }

        console.log(`${moment().format()}: Holiday lists:`);
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

    const screenShot = async (page) => {
        await page.screenshot({
            path: `./screenshot/${moment().format()}.png`,
            fullPage: true
        });
    }

    // let flagUrl = "https://docs.google.com/uc?export=download&id=173KRHfcTTGzDwSx0xvBSy_SmZSKOKO6K";
    // let result = await axios.get(flagUrl);
    // if (!result.data) {
    //     // If flag is not enable then do nothing
    //     console.log(`${moment().format()}: Disabled!`);
    //     return;
    // }

    const browser = await puppeteer.launch({
        // headless: true, args: ["--no-sandbox"]
        headless: true, executablePath: '/usr/bin/chromium-browser'
        // headless:false
    });


    try {
        await getHolidays();
        if (isHoliday(new Date())) {
            console.log(`${moment().format()}: Today is holiday`);
            await browser.close();
            return false;
        }

        let mobilePage = await loginJobcanMobile();
        const workingStatus = await getWorkingStatus(mobilePage);
        console.log(`${moment().format()}: workingStatus: `, workingStatus);
        // await screenShot(mobilePage);

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
            // await screenShot(mobilePage);
            const workingStatus = await getWorkingStatus(mobilePage);
            console.log(`${moment().format()}: Status after click: `, workingStatus);
            if (workingStatus === "勤務中") {
                await slackChat();
                await notifyMe();
            }
        }
    } catch (e) {
        if (e instanceof TimeoutError) {
            console.log(`${moment().format()}: Timeout error`);
        }
        console.log(`${moment().format()}: error`, e.toString());
    } finally {
        await browser.close();
        console.log(`${moment().format()}: Exit process.`);
        console.log("");
        process.exitCode = 0;
    }
})();
