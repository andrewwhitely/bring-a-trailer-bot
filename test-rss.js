const Parser = require('rss-parser');

async function testRSSFeed() {
  const parser = new Parser();
  const RSS_FEED_URL = 'https://bringatrailer.com/feed/';

  console.log('🧪 Testing RSS feed connection...');
  console.log(`📡 Feed URL: ${RSS_FEED_URL}`);

  try {
    const feed = await parser.parseURL(RSS_FEED_URL);

    console.log('✅ RSS feed connection successful!');
    console.log(`📊 Feed title: ${feed.title}`);
    console.log(`📊 Feed description: ${feed.description}`);
    console.log(`📊 Number of items: ${feed.items.length}`);

    if (feed.items.length > 0) {
      const latestItem = feed.items[0];
      console.log('\n🚗 Latest listing:');
      console.log(`   Title: ${latestItem.title}`);
      console.log(`   Link: ${latestItem.link}`);
      console.log(`   Published: ${latestItem.pubDate}`);
      console.log(
        `   Description: ${latestItem.contentSnippet?.substring(0, 100)}...`
      );

      // Check for images
      const imageMatch = latestItem.content?.match(/<img[^>]+src="([^"]+)"/);
      if (imageMatch) {
        console.log(`   Image: ${imageMatch[1]}`);
      } else {
        console.log('   Image: No image found');
      }
    }

    console.log('\n✅ RSS feed test completed successfully!');
  } catch (error) {
    console.error('❌ RSS feed test failed:', error.message);
    console.error('   This could be due to:');
    console.error('   - Network connectivity issues');
    console.error('   - RSS feed URL being down');
    console.error('   - Firewall blocking the request');
  }
}

testRSSFeed();
