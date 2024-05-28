require('dotenv').config();
const ccxt = require("ccxt");
const fetch = require('node-fetch');
const winston = require('winston');

// Setup logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'trading-bot.log' })
    ]
});

// Validate environment variables
const requiredEnvVars = ['BINANCE_API_KEY', 'BINANCE_API_SECRET', 'COINGECKO_API_KEY'];
requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
        logger.error(`Environment variable ${envVar} is not set.`);
        process.exit(1);
    }
});

const exchange = new ccxt.binance({
    apiKey: process.env.BINANCE_API_KEY,
    secret: process.env.BINANCE_API_SECRET
});

const config = {
    symbol: "SOL/USDT",
    orderType: "limit",
    orderSide: "buy",
    amount: 5, // SOL amount to buy
    apiUrlHist: `https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&interval=daily&days=7&x_cg_demo_api_key=${process.env.COINGECKO_API_KEY}`,
    apiUrlPrice: `https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&x_cg_demo_api_key=${process.env.COINGECKO_API_KEY}`,
    interval: 86400 * 1000 // 24 hours in milliseconds
};

const fetchHistoricalData = async () => {
    try {
        const res = await fetch(config.apiUrlHist, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        const data = await res.json();
        data.prices.pop(); // Remove the latest incomplete data point
        return data.prices;
    } catch (error) {
        logger.error('Error fetching historical data:', error);
        throw error;
    }
};

const fetchCurrentPrice = async () => {
    try {
        const res = await fetch(config.apiUrlPrice, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        const data = await res.json();
        return data.solana.usd;
    } catch (error) {
        logger.error('Error fetching current price:', error);
        throw error;
    }
};

const calculateMovingAverage = (prices) => {
    const average = prices.reduce((sum, el) => sum + el[1], 0) / prices.length;
    return average;
};

const placeOrder = async (currentPrice, averagePrice) => {
    if (currentPrice > averagePrice) {
        const limitPrice = currentPrice * 1.02;
        const params = {
            stopLoss: {
                triggerPrice: currentPrice * 0.9
            },
            takeProfit: {
                triggerPrice: currentPrice * 1.3
            }
        };
        try {
            const order = await exchange.createOrder(config.symbol, config.orderType, config.orderSide, config.amount, limitPrice, params);
            logger.info(`Buy order created: ${config.amount} ${config.symbol} - Limit @ ${limitPrice} - Take profit @ ${params.takeProfit.triggerPrice} - Stop loss @ ${params.stopLoss.triggerPrice}`);
            logger.info(order);
        } catch (error) {
            logger.error('Error placing order:', error);
        }
    } else {
        logger.info('Current price is not above the moving average. No order placed.');
    }
};

const run = async () => {
    try {
        const prices = await fetchHistoricalData();
        const averagePrice = calculateMovingAverage(prices);
        logger.info('7-day Moving Average:', averagePrice);

        const currentPrice = await fetchCurrentPrice();
        logger.info('Current Price:', currentPrice);

        await placeOrder(currentPrice, averagePrice);
    } catch (error) {
        logger.error('Error in run execution:', error);
    }
};

// Run the bot at the specified interval
setInterval(run, config.interval);
run(); // Initial run
