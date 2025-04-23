import axios from "axios";
import Binance from "node-binance-api";
import ChatModel from "../models/ChatModel.js";
import dotenv from "dotenv";
import Sentiment from "sentiment";

dotenv.config();
const sentiment = new Sentiment();

// **Initialize Binance API**
const binance = new Binance().options({
  APIKEY: process.env.BINANCE_API_KEY,
  APISECRET: process.env.BINANCE_SECRET_KEY,
});

// **Financial Tips**
const financialTips = [
  "💰 Save at least 20% of your income each month.",
  "📉 Avoid impulse buying by waiting 24 hours before making a purchase.",
  "📊 Invest in diversified assets to reduce risk.",
  "🏦 Use high-yield savings accounts for emergency funds.",
  "💳 Pay off high-interest debt as soon as possible to avoid extra fees.",
];

// **FAQs**
const faqs = {
  "how to save money":
    "💰 Save at least 20% of your income each month and avoid impulse purchases.",
  "best way to invest":
    "📊 Diversify your investments and consider low-cost index funds.",
  "how to improve credit score":
    "✅ Pay bills on time and keep credit utilization below 30%.",
  "how to start budgeting":
    "📋 Track your expenses and allocate your income into savings, needs, and wants.",
};

// **Add more human-like response templates**
const personalityTraits = {
  friendly: [
    "I'm happy to help you with that!",
    "Great question! Let me find that information for you.",
    "I'd be delighted to assist with your financial query.",
    "That's something I can definitely help with.",
    "Thanks for asking! Here's what I found:",
  ],
  thoughtful: [
    "Let me think about that for a moment...",
    "That's an interesting financial question. Here's my analysis:",
    "I need to consider a few factors before answering that...",
    "From a financial perspective, here's what I think:",
    "After analyzing your question carefully...",
  ],
  empathetic: [
    "I understand financial matters can be stressful. Here's some helpful information:",
    "Many people have similar financial concerns. Let me help clarify this for you:",
    "It's normal to have questions about this. Here's what you should know:",
    "I appreciate you sharing your financial concerns with me.",
    "That's a common financial challenge. Here's my advice:",
  ],
};

// **Context memory for recent conversations**
const conversationMemory = new Map();
const MAX_MEMORY_SIZE = 5;

// **Get a random response template based on sentiment and message content**
const getPersonalizedIntro = (message, sentimentScore) => {
  if (sentimentScore < -1) {
    // Negative sentiment
    return personalityTraits.empathetic[
      Math.floor(Math.random() * personalityTraits.empathetic.length)
    ];
  } else if (/how|what|why|when|which|where/i.test(message)) {
    // Question
    return personalityTraits.thoughtful[
      Math.floor(Math.random() * personalityTraits.thoughtful.length)
    ];
  } else {
    // Neutral or positive
    return personalityTraits.friendly[
      Math.floor(Math.random() * personalityTraits.friendly.length)
    ];
  }
};

// **Add follow-up suggestions based on the conversation topic**
const getFollowUpSuggestions = (message) => {
  if (/stock|invest|market|portfolio/i.test(message)) {
    return "\n\n💡 You might also want to ask about:\n• Portfolio diversification strategies\n• Market trends for specific sectors\n• How to evaluate stock performance";
  } else if (/save|saving|budget|spend/i.test(message)) {
    return "\n\n💡 You might also want to ask about:\n• The 50/30/20 budgeting rule\n• High-yield savings options\n• Automating your savings";
  } else if (/retire|retirement|401k|pension/i.test(message)) {
    return "\n\n💡 You might also want to ask about:\n• Retirement account types\n• When to start saving for retirement\n• Retirement withdrawal strategies";
  } else if (/debt|loan|credit|mortgage/i.test(message)) {
    return "\n\n💡 You might also want to ask about:\n• Debt consolidation options\n• Strategies to improve credit score\n• Comparing loan interest rates";
  }
  return "";
};

// **Fetch Crypto Price from Binance**
const fetchCryptoPrice = async (symbol) => {
  try {
    const cleanSymbol = symbol.replace(/\W/g, "").toUpperCase() + "USDT";
    console.log(`Fetching Binance price for: ${cleanSymbol}`);

    const { data } = await axios.get(
      `https://api.binance.com/api/v3/ticker/price?symbol=${cleanSymbol}`
    );

    return data.price
      ? `🚀 **${symbol.toUpperCase()} Price**: **$${data.price}**`
      : `❌ No price data found for ${symbol}`;
  } catch (error) {
    console.error(`Error fetching ${symbol} price:`, error.message);
    return "❌ Unable to fetch crypto price.";
  }
};

// **Fetch Stock Price from MarketStack**
const fetchStockPrice = async (symbol) => {
  try {
    const response = await axios.get(`http://api.marketstack.com/v1/eod`, {
      params: {
        access_key: process.env.MARKETSTACK_API_KEY,
        symbols: symbol,
        limit: 1,
      },
    });

    const stockData = response.data.data[0];
    if (!stockData) return `❌ No stock data found for ${symbol}`;

    return `📈 **Stock Price for ${symbol}**: **$${stockData.close}** (as of ${stockData.date})`;
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error.message);
    return "❌ Unable to fetch stock market data.";
  }
};

// **Fetch Currency Exchange Rates**
const fetchCurrencyRates = async (base = "USD", target = "EUR") => {
  try {
    const { data } = await axios.get(
      `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${base}&to_currency=${target}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );

    const rate = data["Realtime Currency Exchange Rate"]["5. Exchange Rate"];
    return `💱 **Exchange Rate**: **1 ${base} = ${rate} ${target}**`;
  } catch (error) {
    console.error("Error fetching currency rates:", error);
    return "❌ Unable to fetch currency exchange rates.";
  }
};

// **Fetch Metal Prices (Gold & Silver)**
const fetchMetalPrices = async (metal) => {
  const metalSymbols = { GOLD: "GC1!", SILVER: "SI1!" };

  if (!metalSymbols[metal]) return `❌ No data available for ${metal}`;

  try {
    const { data } = await axios.get(`https://finnhub.io/api/v1/quote`, {
      params: {
        symbol: metalSymbols[metal],
        token: process.env.FINNHUB_API_KEY,
      },
    });

    return data.c
      ? `🥇 **${metal} Price**: **$${data.c} per ounce**`
      : `❌ No price data found for ${metal}`;
  } catch (error) {
    console.error(`Error fetching ${metal} price:`, error.message);
    return "❌ Unable to fetch metal prices.";
  }
};

// **Fetch Global Finance News from Mediastack**
const fetchFinanceNews = async () => {
  try {
    const response = await axios.get(`http://api.mediastack.com/v1/news`, {
      params: {
        access_key: process.env.MEDIASTACK_API_KEY,
        categories: "business",
        languages: "en",
        limit: 20,
      },
    });

    const financeKeywords = [
      "finance",
      "investment",
      "stock",
      "market",
      "economy",
      "cryptocurrency",
      "banking",
      "trading",
      "money",
      "debt",
      "recession",
      "inflation",
      "interest rates",
      "exchange rates",
      "bonds",
      "financial crisis",
      "Wall Street",
      "Federal Reserve",
      "gold prices",
      "forex",
    ];

    const filteredArticles = response.data.data.filter((article) =>
      financeKeywords.some(
        (keyword) =>
          (article.title && article.title.toLowerCase().includes(keyword)) ||
          (article.description &&
            article.description.toLowerCase().includes(keyword))
      )
    );

    if (filteredArticles.length === 0)
      return "❌ No relevant finance news found.";

    return (
      `📢 **Latest Finance News:**\n\n` +
      filteredArticles
        .map(
          (article) =>
            `🔹 **${article.title}**\n📰 ${
              article.description || "No description available"
            }\n🔗 [Read more](${article.url})`
        )
        .join("\n\n")
    );
  } catch (error) {
    console.error("Error fetching finance news:", error.message);
    return "❌ Unable to fetch finance news.";
  }
};

// **Chatbot Handler with improved human-like interaction**
export const handleChatRequest = async (req, res) => {
  const { message } = req.body;
  const userId = req.user ? req.user._id : null;

  if (!message) {
    return res.status(400).json({ message: "Message cannot be empty." });
  }

  const lowerMessage = message.toLowerCase().trim();

  // Check for exact FAQ matches
  if (faqs[lowerMessage]) {
    const response = faqs[lowerMessage];

    // Store in conversation memory
    if (userId) {
      if (!conversationMemory.has(userId)) {
        conversationMemory.set(userId, []);
      }
      const userMemory = conversationMemory.get(userId);
      userMemory.push({ message, response });
      if (userMemory.length > MAX_MEMORY_SIZE) userMemory.shift();
    }

    return res.json({ response });
  }

  try {
    // Get conversation context if available
    let contextAwareness = "";
    if (userId && conversationMemory.has(userId)) {
      const userMemory = conversationMemory.get(userId);
      if (userMemory.length > 0) {
        // Reference previous conversation if relevant
        const lastExchange = userMemory[userMemory.length - 1];
        if (
          message.includes("that") ||
          message.includes("it") ||
          message.length < 15
        ) {
          contextAwareness = `I see you're following up on our conversation about ${lastExchange.message.substring(
            0,
            30
          )}... `;
        }
      }
    }

    const sentimentResult = sentiment.analyze(message);

    // Start with personalized intro based on message sentiment and content
    const personalizedIntro = getPersonalizedIntro(
      message,
      sentimentResult.score
    );

    let responseText = `${contextAwareness}${personalizedIntro}\n\n`;
    let foundRelevantData = false;

    // Only include sentiment analysis for certain types of messages
    if (
      /feeling|think|opinion|market outlook|future|predict/i.test(lowerMessage)
    ) {
      const sentimentLabel =
        sentimentResult.score > 0
          ? "😊 positive"
          : sentimentResult.score < 0
          ? "😞 negative"
          : "😐 neutral";
      responseText += `I'm sensing a ${sentimentLabel} tone in your message. `;
    }

    if (/btc|eth|crypto price/i.test(lowerMessage)) {
      const cryptoSymbol =
        lowerMessage.match(/(?:btc|eth|crypto price of )(\w+)/)?.[1] || "BTC";
      responseText += `\n${await fetchCryptoPrice(cryptoSymbol)}`;
      foundRelevantData = true;
    }

    if (/stock price/i.test(lowerMessage)) {
      const stockSymbol =
        lowerMessage.match(/stock price of (\w+)/)?.[1]?.toUpperCase() ||
        "AAPL";
      responseText += `\n${await fetchStockPrice(stockSymbol)}`;
      foundRelevantData = true;
    }

    if (/exchange rate|currency/i.test(lowerMessage)) {
      responseText += `\n${await fetchCurrencyRates()}`;
      foundRelevantData = true;
    }

    if (/gold|silver|metal prices/i.test(lowerMessage)) {
      responseText += `\n${await fetchMetalPrices(lowerMessage.toUpperCase())}`;
      foundRelevantData = true;
    }

    if (/finance news|business news/i.test(lowerMessage)) {
      responseText += `\n${await fetchFinanceNews()}`;
      foundRelevantData = true;
    }

    if (!foundRelevantData) {
      // Add a conversational element when giving general advice
      const randomIntro = [
        "Based on my financial expertise, ",
        "As your financial advisor, I'd suggest that ",
        "Many of my clients find it helpful to know that ",
        "Here's a valuable financial insight: ",
        "From what I understand about your situation, ",
      ][Math.floor(Math.random() * 5)];

      responseText += `${randomIntro}${
        financialTips[Math.floor(Math.random() * financialTips.length)]
      }`;
    }

    // Add follow-up suggestions based on the topic
    responseText += getFollowUpSuggestions(message);

    // Store in conversation memory
    if (userId) {
      if (!conversationMemory.has(userId)) {
        conversationMemory.set(userId, []);
      }
      const userMemory = conversationMemory.get(userId);
      userMemory.push({ message, response: responseText });
      if (userMemory.length > MAX_MEMORY_SIZE) userMemory.shift();
    }

    // Save chat to MongoDB
    const chatEntry = new ChatModel({
      userId: userId,
      message,
      response: responseText,
    });

    await chatEntry.save();
    res.json({ response: responseText });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      response:
        "I'm sorry, but I'm having trouble retrieving the financial data you need right now. Could we try again in a moment?",
    });
  }
};

// **✅ Get Chat History by User ID**
export const getChatByID = async (req, res) => {
  try {
    const userId = req.user._id; // Extract user ID from token

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // **Find chats by user ID and sort by timestamp (latest first)**
    const chats = await ChatModel.find({ userId }).sort({ timestamp: -1 });

    if (chats.length === 0) {
      return res
        .status(404)
        .json({ message: "No chat history found for this user." });
    }

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Error retrieving chat history." });
  }
};

export const getChatsByUser = async (req, res) => {
  try {
    const chats = await AIChat.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Error fetching chat logs" });
  }
};

// **Export getChatContextByUser to retrieve conversation context**
export const getChatContextByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Get recent chats for context
    const recentChats = await ChatModel.find({ userId })
      .sort({ timestamp: -1 })
      .limit(5)
      .select("message response timestamp")
      .lean();

    if (!recentChats || recentChats.length === 0) {
      return res.json({
        context: [],
        contextSummary: "No previous conversation context available.",
      });
    }

    // Create a summary of previous conversations
    const contextSummary =
      recentChats.length > 0
        ? `Previous discussions include: ${recentChats
            .map(
              (chat) =>
                chat.message.substring(0, 30) +
                (chat.message.length > 30 ? "..." : "")
            )
            .join(", ")}`
        : "No previous conversation context available.";

    // Return both structured context data and a natural language summary
    return res.json({
      context: recentChats.reverse(), // Chronological order
      contextSummary,
    });
  } catch (error) {
    console.error("Error retrieving chat context:", error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve chat context." });
  }
};
