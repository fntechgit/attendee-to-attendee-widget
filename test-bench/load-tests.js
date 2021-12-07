const playwright = require("playwright");
const attendees = require("./test_data/attendees.min.json");

//const BASE_URL = "https://a2a-stress-tests.herokuapp.com";
const BASE_URL = "https://localhost:3000/attendance";

(async () => {
  const browser = await playwright["chromium"].launch({
    headless: false,
    slowMo: 10,
  });

  const context = await browser.newContext({ ignoreHTTPSErrors: true });

  for (const a of attendees) {
    try {
      const url = `${BASE_URL}?accessToken=ACCESS_TOKEN&fullName=${a.full_name}&email=${a.email}&idpUserId=${a.idp_user_id}`;
      const page = await context.newPage();
      //await page.goto(url);
      page.goto(url);
    } catch (err) {
      console.log(err);
    }
  }

  console.log('Press any key to finish the test...');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', async () => {
    console.log('Bye');
    await browser.close();
    process.exit();
  });
})();
