"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.externalAPIService = void 0;
const axios_1 = __importDefault(require("axios"));
// External API URLs from problem statement
const COUNTRIES_API = 'https://restcountries.com/v3.1/all?fields=name,currencies';
const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest';
class ExternalAPIService {
    constructor() {
        this.countriesCache = null;
        this.exchangeRateCache = new Map();
        this.CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
    }
    /**
     * Get all countries and their currencies
     * Cache result for 1 hour
     */
    async getCountriesAndCurrencies() {
        try {
            if (this.countriesCache) {
                return this.countriesCache;
            }
            console.log('Fetching countries and currencies from external API...');
            const response = await axios_1.default.get(COUNTRIES_API, {
                timeout: 10000 // 10 second timeout
            });
            this.countriesCache = response.data;
            // Clear cache after 1 hour
            setTimeout(() => {
                this.countriesCache = null;
            }, this.CACHE_DURATION);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching countries:', error);
            // Return fallback data for India and major currencies
            return this.getFallbackCountries();
        }
    }
    /**
     * Get exchange rates for a base currency
     * Cache result for 1 hour
     */
    async getExchangeRates(baseCurrency) {
        try {
            const cacheKey = baseCurrency.toUpperCase();
            const cached = this.exchangeRateCache.get(cacheKey);
            // Return cached data if valid
            if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
                return cached.data;
            }
            console.log(`Fetching exchange rates for ${baseCurrency}...`);
            const response = await axios_1.default.get(`${EXCHANGE_RATE_API}/${baseCurrency}`, {
                timeout: 10000 // 10 second timeout
            });
            // Cache the result
            this.exchangeRateCache.set(cacheKey, {
                data: response.data,
                timestamp: Date.now()
            });
            return response.data;
        }
        catch (error) {
            console.error(`Error fetching exchange rates for ${baseCurrency}:`, error);
            // Return fallback INR rates if available
            if (baseCurrency.toUpperCase() === 'INR') {
                return this.getFallbackINRRates();
            }
            return null;
        }
    }
    /**
     * Convert amount between currencies
     */
    async convertCurrency(amount, fromCurrency, toCurrency) {
        try {
            const from = fromCurrency.toUpperCase();
            const to = toCurrency.toUpperCase();
            // Same currency conversion
            if (from === to) {
                return {
                    convertedAmount: amount,
                    exchangeRate: 1,
                    success: true
                };
            }
            // Get exchange rates
            const rates = await this.getExchangeRates(from);
            if (!rates || !rates.rates[to]) {
                throw new Error(`Exchange rate not found for ${from} to ${to}`);
            }
            const exchangeRate = rates.rates[to];
            const convertedAmount = amount * exchangeRate;
            return {
                convertedAmount: parseFloat(convertedAmount.toFixed(2)),
                exchangeRate,
                success: true
            };
        }
        catch (error) {
            console.error('Currency conversion error:', error);
            return {
                convertedAmount: amount,
                exchangeRate: 1,
                success: false
            };
        }
    }
    /**
     * Get supported currencies with their symbols
     */
    async getSupportedCurrencies() {
        try {
            const countries = await this.getCountriesAndCurrencies();
            const currencies = new Map();
            countries.forEach(country => {
                if (country.currencies) {
                    Object.entries(country.currencies).forEach(([code, currency]) => {
                        currencies.set(code, currency);
                    });
                }
            });
            return Array.from(currencies.entries()).map(([code, currency]) => ({
                code,
                name: currency.name,
                symbol: currency.symbol
            })).sort((a, b) => a.code.localeCompare(b.code));
        }
        catch (error) {
            console.error('Error getting supported currencies:', error);
            return this.getFallbackCurrencies();
        }
    }
    /**
     * Fallback countries data (India + major economies)
     */
    getFallbackCountries() {
        return [
            {
                name: { common: 'India', official: 'Republic of India' },
                currencies: { INR: { name: 'Indian rupee', symbol: '₹' } }
            },
            {
                name: { common: 'United States', official: 'United States of America' },
                currencies: { USD: { name: 'United States dollar', symbol: '$' } }
            },
            {
                name: { common: 'United Kingdom', official: 'United Kingdom of Great Britain and Northern Ireland' },
                currencies: { GBP: { name: 'British pound', symbol: '£' } }
            },
            {
                name: { common: 'European Union', official: 'European Union' },
                currencies: { EUR: { name: 'Euro', symbol: '€' } }
            }
        ];
    }
    /**
     * Fallback INR exchange rates
     */
    getFallbackINRRates() {
        return {
            base: 'INR',
            date: new Date().toISOString().split('T')[0],
            rates: {
                USD: 0.012, // 1 INR = 0.012 USD (approx)
                EUR: 0.011, // 1 INR = 0.011 EUR (approx)
                GBP: 0.0095, // 1 INR = 0.0095 GBP (approx)
                INR: 1
            }
        };
    }
    /**
     * Fallback currencies list
     */
    getFallbackCurrencies() {
        return [
            { code: 'INR', name: 'Indian rupee', symbol: '₹' },
            { code: 'USD', name: 'United States dollar', symbol: '$' },
            { code: 'EUR', name: 'Euro', symbol: '€' },
            { code: 'GBP', name: 'British pound', symbol: '£' },
            { code: 'AUD', name: 'Australian dollar', symbol: 'A$' },
            { code: 'CAD', name: 'Canadian dollar', symbol: 'C$' },
            { code: 'JPY', name: 'Japanese yen', symbol: '¥' },
            { code: 'SGD', name: 'Singapore dollar', symbol: 'S$' }
        ];
    }
}
exports.externalAPIService = new ExternalAPIService();
