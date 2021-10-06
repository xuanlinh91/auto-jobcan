const puppeteer = require('puppeteer');

(async () => {
    const devices = puppeteer.devices;
    const iPhone = devices['iPhone 7'];
    // Launch a clean browser
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
    await page.emulate(iPhone);
    // grant permission
    const context = browser.defaultBrowserContext()
    await context.overridePermissions("https://ssl.jobcan.jp/m/work/accessrecord?_m=adit", ['geolocation'])
    //set the location
    await page.setGeolocation({latitude:90, longitude:20})
    //open url
    await page.goto("https://ssl.jobcan.jp/login/mb-employee?err=1&lang_code=ja");
})();
