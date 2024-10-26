const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://tolkiengateway.net/wiki/Bilbo_Baggins';

async function scrapeData() {
    try {
        // Fetch the HTML
        const { data } = await axios.get(url);

        // Load the HTML into cheerio
        const $ = cheerio.load(data);

        // Example: Extract the main headings from the page
        const headings = [];
        $('h2').each((index, element) => {
            headings.push($(element).text());
        });

        console.log('Headings:', headings);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Execute the scraping function
scrapeData();
