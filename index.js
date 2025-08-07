// Cloudflare Workers Discord Bot for Bring a Trailer RSS
// This runs as a scheduled worker that checks RSS and posts to Discord

// Configuration
const RSS_FEED_URL = 'https://bringatrailer.com/feed/';

// Store the last processed item to avoid duplicates
let lastProcessedItem = null;

// Function to fetch and parse RSS feed
async function fetchRSSFeed() {
  try {
    console.log('📡 Fetching RSS feed...');
    const response = await fetch(RSS_FEED_URL);
    const text = await response.text();

    // Simple RSS parsing (since we can't use rss-parser in Workers)
    const items = parseRSSFeed(text);
    console.log(`✅ Found ${items.length} items in RSS feed`);
    return items;
  } catch (error) {
    console.error('❌ Error fetching RSS feed:', error.message);
    return [];
  }
}

// Simple RSS parser for Cloudflare Workers
function parseRSSFeed(xmlText) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];

    const title = extractTag(itemContent, 'title');
    const link = extractTag(itemContent, 'link');
    const description = extractTag(itemContent, 'description');
    const pubDate = extractTag(itemContent, 'pubDate');
    const content = extractTag(itemContent, 'content:encoded') || description;

    if (title && link) {
      items.push({
        title: decodeXMLEntities(title),
        link: decodeXMLEntities(link),
        description: decodeXMLEntities(description),
        content: decodeXMLEntities(content),
        pubDate: pubDate,
      });
    }
  }

  return items;
}

function extractTag(content, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

function decodeXMLEntities(text) {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

// Function to create Discord embed for a listing
function createListingEmbed(item) {
  const embed = {
    color: 0xff6b35,
    title: item.title,
    url: item.link,
    description: item.description
      ? item.description.substring(0, 2000)
      : 'No description available',
    timestamp: new Date(item.pubDate).toISOString(),
    footer: {
      text: 'Bring a Trailer',
      icon_url: 'https://bringatrailer.com/favicon.ico',
    },
  };

  // Try to extract image from content
  if (item.content) {
    // Look for various image patterns
    const imagePatterns = [
      /<img[^>]+src="([^"]+)"/i,
      /<img[^>]+src='([^']+)'/i,
      /background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/i,
      /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i,
      /<meta[^>]+name="twitter:image"[^>]+content="([^"]+)"/i,
    ];

    let imageUrl = null;
    for (const pattern of imagePatterns) {
      const match = item.content.match(pattern);
      if (match && match[1]) {
        imageUrl = match[1];
        break;
      }
    }

    if (imageUrl) {
      // Clean up the URL (remove query parameters that might cause issues)
      imageUrl = imageUrl.split('?')[0];

      // Validate the URL
      try {
        new URL(imageUrl);
        embed.image = { url: imageUrl };
      } catch (error) {
        console.log('⚠️ Invalid image URL, skipping:', imageUrl);
      }
    }
  }

  return embed;
}

// Function to post to Discord webhook
async function postToDiscord(embed) {
  try {
    const webhookUrl = DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('❌ DISCORD_WEBHOOK_URL not configured');
      return false;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (response.ok) {
      console.log('✅ Posted new listing to Discord');
      return true;
    } else {
      console.error(
        '❌ Failed to post to Discord:',
        response.status,
        response.statusText
      );
      return false;
    }
  } catch (error) {
    console.error('❌ Error posting to Discord:', error.message);
    return false;
  }
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

      const embed = createListingEmbed(latestItem);
      const success = await postToDiscord(embed);

      if (success) {
        // Update last processed item
        lastProcessedItem = latestItem;
      }
    } else {
      console.log('ℹ️ No new listings found');
    }
  } catch (error) {
    console.error('❌ Error checking for new listings:', error.message);
  }
}

// Cloudflare Workers event handler
export default {
  // Scheduled event (runs every 5 minutes)
  async scheduled(event, env, ctx) {
    console.log('⏰ Scheduled RSS feed check triggered');
    await checkForNewListings();
  },

  // HTTP request handler (for testing)
  async fetch(request, env, ctx) {
    // Validate webhook URL
    if (!env.DISCORD_WEBHOOK_URL) {
      return new Response('❌ DISCORD_WEBHOOK_URL not configured', {
        status: 500,
      });
    }

    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'OK',
          timestamp: new Date().toISOString(),
          rss_feed: RSS_FEED_URL,
          webhook_configured: !!DISCORD_WEBHOOK_URL,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (url.pathname === '/check') {
      await checkForNewListings();
      return new Response('Check completed', { status: 200 });
    }

    return new Response('Discord BAT Bot is running!', { status: 200 });
  },
};
