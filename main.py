import requests
from bs4 import BeautifulSoup
import pandas as pd

# def get_wiki_data(entry):
#     url = f"https://tolkiengateway.net/wiki/{entry}"
#     return url

# def fetch_html(url):
#     headers = {
#         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
#     }

#     response = requests.get(url, headers=headers)
#     if response.status_code == 200:
#         return response.text
#     else:
#         raise Exception(f"Failed to load page, status code: {
#                         response.status_code}")

# def parse_html(html):
#     soup = BeautifulSoup(html, 'html.parser')
#     return soup

# def extract_data(soup):
#     title = soup.find('h1').text  # Assuming the title is in an <h1> tag
#     # The main content area
#     content = soup.find('div', class_='mw-parser-output').text
#     return {
#         'title': title,
#         'content': content.strip()  # Remove extra whitespace
#     }

# def scrape_wiki_entry(entry):
#     url = get_wiki_data(entry)
#     html = fetch_html(url)
#     soup = parse_html(html)
#     data = extract_data(soup)
#     return data

# def save_to_dataframe(data):
#     df = pd.DataFrame([data])  # Wrap data in a list
#     return df

# if __name__ == "__main__":
#     entry = "A-affection"  # Example entry
#     data = scrape_wiki_entry(entry)
#     df = save_to_dataframe(data)

#     print(df)  # Display the DataFrame


url = "https://tolkiengateway.net/wiki/A-affection"

page = requests.get(url)

print(page.text)