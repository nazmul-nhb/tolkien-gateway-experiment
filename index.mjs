import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://tolkiengateway.net/wiki/';
const pages = ['Bilbo_Baggins', 'Frodo_Baggins', 'Gandalf', 'Legolas'];
const outputDir = path.join(__dirname, 'jsons');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function saveData() {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--window-size=1920,1080',
            '--disable-infobars',
        ],
    });

    for (const page of pages) {
        const pageUrl = `${baseUrl}${page}`;
        console.log(`Navigating to ${pageUrl}`);
        const pageFileName = path.join(outputDir, `${page}.json`);

        const pageInstance = await browser.newPage();
        await pageInstance.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.' + Math.floor(Math.random() * 1000) + ' Safari/537.36');
        await pageInstance.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

        try {
            await pageInstance.goto(pageUrl, { waitUntil: 'networkidle2' });
            await pageInstance.waitForSelector('.mw-parser-output', { timeout: 30000 });

            const content = await pageInstance.evaluate(() => {
                const sections = document.querySelectorAll('section.citizen-section');
                const headings = document.querySelectorAll('h2.citizen-section-heading');

                const results = [];
                if (sections.length > 0) {
                    results.push({
                        title: 'intro',
                        content: sections[0].innerText.trim()
                    });
                }

                headings.forEach((heading, index) => {
                    const sectionContent = sections[index + 1];
                    if (sectionContent) {
                        results.push({
                            title: heading.innerText.trim(),
                            content: sectionContent.innerText.trim()
                        });
                    }
                });

                return results;
            });

            fs.writeFileSync(pageFileName, JSON.stringify(content, null, 2));
            console.log(`Saved: ${pageFileName}`);
        } catch (error) {
            console.error(`Error scraping ${page}:`, error?.message);
        } finally {
            await pageInstance.close();
            await delay(3000); // Wait 3 seconds before the next request
        }
    }

    await browser.close();
}

saveData();
