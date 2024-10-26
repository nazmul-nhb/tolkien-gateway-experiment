import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://tolkiengateway.net/wiki/';
const pages = ['Bilbo_Baggins', 'Frodo_Baggins', 'Gandalf', 'Legolas']; // Add more page titles as needed
const outputDir = path.join(__dirname, 'html'); // Directory to save HTML files

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

async function savePages() {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: 'C:/Users/HP/.cache/puppeteer/chrome/win64-130.0.6723.58/chrome-win64/chrome.exe',
    });

    for (const page of pages) {
        const pageUrl = `${baseUrl}${page}`;
        const pageFileName = path.join(outputDir, `${page}.html`); // Set the file name for each page

        const pageInstance = await browser.newPage();
        await pageInstance.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36');

        try {
            await pageInstance.goto(pageUrl, { waitUntil: 'networkidle2' });
            await pageInstance.waitForSelector('.citizen-body-container', { timeout: 0 });

            // Scrape the content
            const content = await pageInstance.evaluate(() => {
                const element = document.querySelector('.citizen-body-container');
                return element ? element.innerHTML : '';
            });

            // Save content to HTML file
            fs.writeFileSync(pageFileName, content);
            console.log(`Saved: ${pageFileName}`);
        } catch (error) {
            console.error(`Error scraping ${page}:`, error);
        } finally {
            await pageInstance.close(); // Close the current page
        }
    }

    await browser.close(); // Close the browser after all pages are processed
}

// Execute the function
savePages();
