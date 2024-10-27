import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

puppeteer.use(StealthPlugin());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://tolkiengateway.net/wiki/Portal:Characters';
const outputDir = path.join(__dirname, 'titles');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Custom delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getTitles() {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--window-size=1920,1080',
            '--disable-infobars',
        ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.' +
        Math.floor(Math.random() * 1000) +
        ' Safari/537.36'
    );
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

    await page.goto(baseUrl, { waitUntil: 'networkidle2' });

    // Function to click all collapsible sections
    const clickAllBullets = async () => {
        const bullets = await page.$$('.CategoryTreeBullet, .CategoryTreeToggle');
        console.log(`Found ${bullets.length} bullets to click.`); // Log how many bullets were found

        for (const bullet of bullets) {
            await bullet.click(); // Click to expand
            await delay(500); // Wait for 500ms for the content to load
        }

        // Wait for a moment to allow all clicks to resolve
        await delay(1000);
    };

    // Invoke the function to click through all bullets
    await clickAllBullets();

    // Extract links inside the expanded sections
    const characterTitles = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('.CategoryTreePageBullet a'));
        const hrefs = links.map(link => link.getAttribute('href'));

        // Debugging output to see found hrefs
        console.log('Found hrefs:', hrefs); // Log the raw hrefs
        return hrefs
            .map(href => href ? href.replace('/wiki/', '').replace(/_/g, ' ') : null)
            .filter(Boolean);
    });

    // Log character titles for debugging
    console.log('Character Titles:', characterTitles);

    console.log(`Extracted ${characterTitles.length} titles`);
    await browser.close();

    if (characterTitles.length === 0) {
        console.error('No titles were extracted. Please verify the page structure or selectors.');
        return;
    }

    // Save titles to files in batches of 500
    const chunkSize = 500;
    for (let i = 0; i < characterTitles.length; i += chunkSize) {
        const chunk = characterTitles.slice(i, i + chunkSize);
        const filePath = path.join(outputDir, `titles_${Math.floor(i / chunkSize) + 1}.txt`);
        fs.writeFileSync(filePath, chunk.join('\n'), 'utf-8');
        console.log(`Saved ${filePath}`);
    }
}

getTitles().catch(console.error);
