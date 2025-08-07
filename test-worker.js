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
    const content = extractTag(itemContent, 'content:encoded') || description;

    if (title && link) {
      items.push({
        title: decodeXMLEntities(title),
        link: decodeXMLEntities(link),
        description: decodeXMLEntities(description),
        content: decodeXMLEntitiesForImages(content),
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
    .replace(/&apos;/g, "'")
    .replace(/<!\[CDATA\[/g, '') // Remove CDATA start
    .replace(/\]\]>/g, '') // Remove CDATA end
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim(); // Remove leading/trailing whitespace
}

function decodeXMLEntitiesForImages(text) {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/<!\[CDATA\[/g, '') // Remove CDATA start
    .replace(/\]\]>/g, ''); // Remove CDATA end but keep HTML tags
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
      if (latestItem.content) {
        const imagePatterns = [
          /<img[^>]+src="([^"]+)"/i,
          /<img[^>]+src='([^']+)'/i,
          /background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/i,
          /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i,
          /<meta[^>]+name="twitter:image"[^>]+content="([^"]+)"/i,
        ];
        
        let imageUrl = null;
        for (const pattern of imagePatterns) {
          const match = latestItem.content.match(pattern);
          if (match && match[1]) {
            imageUrl = match[1];
            break;
          }
        }
        
        if (imageUrl) {
          // Clean up the URL
          imageUrl = imageUrl
            .replace(/&#038;/g, '&')  // Fix encoded ampersands
            .replace(/&amp;/g, '&')   // Fix HTML entities
            .split('?')[0];           // Remove query parameters
          console.log(`   Image: ${imageUrl}`);
        } else {
          console.log('   Image: No image found');
        }
      } else {
        console.log('   Image: No content to search');
      }
    }

    console.log('\n✅ RSS parsing test completed successfully!');
  } catch (error) {
    console.error('❌ RSS parsing test failed:', error.message);
  }
}

// Run the test
testRSSParsing();
