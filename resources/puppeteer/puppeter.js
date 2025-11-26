import puppeteer from "puppeteer";

export const puppeteernaviagtion = async (navigate) => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(navigate, { waitUntil: "networkidle2" });
  return { message: "Navigation completed", url: navigate };
  // await page.setViewport({width:1080,height:1024})
  // await page.keyboard.press('/')
  // await page.locator(`.${navigate}`).click()
  // const textSelector =await page.locator('::-p-text(Customize and automate)').waitHandle();
  // const fullTitle =await textSelector?.evaluate(el=>el.textContent)
  // console.log('The title of this blog post is "%s".', fullTitle);
  // await browser.close();
};
