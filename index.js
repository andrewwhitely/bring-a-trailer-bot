const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const Parser = require('rss-parser');
const cron = require('node-cron');
require('dotenv').config();

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Initialize RSS parser
const parser = new Parser();

// Store the last processed item to avoid duplicates
let lastProcessedItem = null;

// Configuration
const RSS_FEED_URL = process.env.RSS_FEED_URL;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const CHECK_INTERVAL = process.env.CHECK_INTERVAL;

// Validate required environment variables
if (!process.env.DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN is required in .env file');
  process.exit(1);
}

if (!CHANNEL_ID) {
  console.error('❌ DISCORD_CHANNEL_ID is required in .env file');
  process.exit(1);
}

// Function to fetch and parse RSS feed
async function fetchRSSFeed() {
  try {
    const feed = await parser.parseURL(RSS_FEED_URL);
    return feed.items;
  } catch (error) {
    console.error('❌ Error fetching RSS feed:', error.message);
    return [];
  }
}

// Function to create Discord embed for a listing
function createListingEmbed(item) {
  const embed = new EmbedBuilder()
    .setColor('#FF6B35')
    .setTitle(item.title)
    .setURL(item.link)
    .setDescription(item.contentSnippet || 'No description available')
    .setTimestamp(new Date(item.pubDate))
    .setFooter({
      text: 'Bring a Trailer',
      iconURL: 'https://bringatrailer.com/favicon.ico',
    });

  // Try to extract image from content
  const imageMatch = item.content.match(/<img[^>]+src="([^"]+)"/);
  if (imageMatch) {
    embed.setImage(imageMatch[1]);
  }

  // Add author if available
  if (item.creator) {
    embed.setAuthor({ name: item.creator });
  }

  return embed;
}

// Function to check for new listings and post them
async function checkForNewListings() {
  try {
    const items = await fetchRSSFeed();

    if (items.length === 0) {
      console.log('⚠️ No items found in RSS feed');
      return;
    }

    const latestItem = items[0];

    // Check if this is a new item (not processed before)
    if (!lastProcessedItem || latestItem.link !== lastProcessedItem.link) {
      console.log(`🚗 New listing found: ${latestItem.title}`);

      // Post to Discord channel
      const channel = client.channels.cache.get(CHANNEL_ID);
      if (channel) {
        try {
          const embed = createListingEmbed(latestItem);
          await channel.send({ embeds: [embed] });
          console.log('✅ Posted new listing to Discord');
        } catch (error) {
          console.error('❌ Error posting to Discord:', error.message);
        }
      } else {
        console.error(
          `❌ Could not find Discord channel with ID: ${CHANNEL_ID}`
        );
      }

      // Update last processed item
      lastProcessedItem = latestItem;
    } else {
      console.log('ℹ️ No new listings found');
    }
  } catch (error) {
    console.error('❌ Error checking for new listings:', error.message);
  }
}

// Bot ready event
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log('🤖 Bot is ready to monitor Bring a Trailer RSS feed');

  // Start the cron job to check for new listings
  cron.schedule(CHECK_INTERVAL, () => {
    console.log('⏰ Checking for new listings...');
    checkForNewListings();
  });

  console.log(`⏰ Scheduled RSS feed checks every ${CHECK_INTERVAL}`);

  // Initial check
  console.log('🚀 Performing initial RSS feed check...');
  checkForNewListings();
});

// Error handling
client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down bot...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down bot...');
  client.destroy();
  process.exit(0);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN).catch((error) => {
  console.error('❌ Failed to login to Discord:', error.message);
  process.exit(1);
});
