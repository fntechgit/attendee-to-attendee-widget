const playwright = require("playwright");
const attendees = require("./test_data/attendees.json");

const BASE_URL = "https://localhost:3000";

(async () => {
  const browser = await playwright["chromium"].launch({
    headless: false,
    slowMo: 10,
  });

  const context = await browser.newContext({ ignoreHTTPSErrors: true });

  for (const a of attendees) {
    try {
      const url = `${BASE_URL}/attendance?accessToken=qe2S-CEg~YoEW-RvWXkHAj3IMw.qpBcUOArxd~UHguE~~l9rne6OgAU6y9gHsDq5jBHjPILXkiV9Y6oukohfk1ZGw4c-mcsSryR~BpTF1paREHyPqVUdJ0.CoAifd1sm&fullName=${a.full_name}&email=${a.email}&idpUserId=${a.idp_user_id}`;
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
