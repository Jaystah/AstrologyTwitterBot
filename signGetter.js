const puppeteer = require("puppeteer");

const dateComposer = (data) => {
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let result = [];
  let month;
  if (+data.substring(3, 5) < 10) {
    const format = data.substring(3, 5).replace("0", "");
    month = parseInt(format);
  } else {
    month = parseInt(data.substring(3, 5));
  }

  let day = data.substring(0, 2);
  if (+day < 10) {
    day = day.replace("0", "");
  }
  let year = data.substring(6, data.length);
  return [day, months[month - 1], year];
};

const timeComposer = (data) => {
  const parts = data.split(":");
  if (parts.length < 2) {
    return "Unknown";
  }
  let first = parts[0];
  let firstFormat;
  if (parseInt(first) == 0) {
    return ["0 midnight", parts[1]];
  }
  if (parseInt(first) > 12) {
    firstFormat = parseInt(first) - 12 + " pm";
  } else if (parseInt(first) < 12) {
    firstFormat = parseInt(first) + " am";
  } else {
    firstFormat = "12 noon";
  }
  return [firstFormat, parts[1]];
};

const getSigns = async (name, date, time, location) => {
  console.log("Reversing...");
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-zygote", "--single-process",'--no-sandbox','--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto("https://justastrologythings.com/pages/chart/");
    await page.waitForSelector('input[name="name"]');
    await page.type('input[name="name"]', name);
    const dateOfBirth = dateComposer(date);
    await page.type('select[name="month"]', dateOfBirth[1]);
    await page.type('select[name="day"]', dateOfBirth[0]);
    await page.type('select[name="year"]', dateOfBirth[2]);
    const formattedTime = timeComposer(time);
    if (formattedTime == "Unknown") {
      await page.click('input[name="timeUnknown"]');
    } else {
      await page.type('select[name="hour"]', formattedTime[0]);
      await page.type('select[name="minute"]', formattedTime[1])
    }
    await page.type("#search", location);
    await page.waitForTimeout(3_500);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    await page.click('[type="submit"]');
    const sun = await page.waitForSelector('a[href*="planets/Moon"].chartLink');
    const sunText = await page.$$eval(
      'a[href*="planets/Sun"].chartLink',
      (elements) => {
        return elements[elements.length - 1].innerHTML;
      }
    );
    const moonText = await page.$$eval(
      'a[href*="planets/Moon"].chartLink',
      (elements) => {
        return elements[elements.length - 1].innerHTML;
      }
    );
    const risingText =
      formattedTime != "Unknown"
        ? await page.$$eval('a[href*="pages/rising"].chartLink', (elements) => {
            return elements[elements.length - 1].innerHTML;
          })
        : null;
    await browser.close();
    return { sun: sunText, moon: moonText, rising: risingText };
  } catch (e) {
    console.log("Error: ", e);
    await browser.close();
    return undefined;
  }
};

module.exports = {
  getSigns,
  dateComposer,
};
