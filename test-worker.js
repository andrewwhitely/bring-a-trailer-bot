// Test script for RSS parsing logic
// This simulates the RSS parsing that happens in the Cloudflare Worker

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

// Test with a sample RSS feed
async function testRSSParsing() {
  console.log('🧪 Testing RSS parsing logic...');

  try {
    const response = await fetch('https://bringatrailer.com/feed/');
    const xmlText = await response.text();

    const items = parseRSSFeed(xmlText);

    console.log(`✅ Successfully parsed ${items.length} items`);

    if (items.length > 0) {
      const latestItem = items[0];
      console.log('\n🚗 Latest listing:');
      console.log(`   Title: ${latestItem.title}`);
      console.log(`   Link: ${latestItem.link}`);
      console.log(`   Published: ${latestItem.pubDate}`);
      console.log(
        `   Description: ${latestItem.description?.substring(0, 100)}...`
      );

      // Check for images
      const imageMatch = latestItem.content?.match(/<img[^>]+src="([^"]+)"/);
      if (imageMatch) {
        console.log(`   Image: ${imageMatch[1]}`);
      } else {
        console.log('   Image: No image found');
      }
    }

    console.log('\n✅ RSS parsing test completed successfully!');
  } catch (error) {
    console.error('❌ RSS parsing test failed:', error.message);
  }
}

// Run the test
testRSSParsing();
