Disclaimer
This trading bot is for educational purposes only. Trading cryptocurrencies involves significant risk, and you should not trade with money you cannot afford to lose.
Always do your own research before making any investment decisions. The author is not responsible for any financial losses you may incur.


Solana Trading Bot
This is a Node.js-based trading bot script designed to automate the process of buying Solana (SOL) on the Binance cryptocurrency exchange based on specific conditions.

Features
Fetch Historical Price Data: Retrieves the past 7 days of Solana price data from the CoinGecko API.
Calculate Moving Average: Computes the 7-day moving average (MA) of Solana's price.
Make Trading Decisions: Places a buy order if the current price is above the moving average.
Execute Trades: Places a limit buy order on Binance with predefined stop-loss and take-profit parameters.


Prerequisites
Node.js installed
npm (Node Package Manager) installed
Binance account with API key and secret
CoinGecko API key

Installation
Clone the repository:
</>git clone https://github.com/TotalingArc/Solana-Trading-Bot.git</>
</>cd solana-trading-bot</>

Install the required dependencies:
</>npm install ccxt dotenv node-fetch winston</>

Create a .env file in the root directory and add your API keys:
BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_api_secret
COINGECKO_API_KEY=your_coingecko_api_key
