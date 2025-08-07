# Discord Bring a Trailer Bot

A Discord bot that monitors Bring a Trailer's RSS feed and posts new listings to a Discord channel.

## Features

- 🚗 Monitors Bring a Trailer's RSS feed for new listings
- 📱 Posts beautiful Discord embeds with listing details
- ⏰ Configurable check intervals (default: every 5 minutes)
- 🔄 Prevents duplicate posts
- 🖼️ Extracts and displays listing images
- 📊 Includes listing metadata (title, description, link, timestamp)

## Setup Instructions

### 1. Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Copy the bot token (you'll need this later)
5. Go to "OAuth2" > "URL Generator"
6. Select "bot" under scopes
7. Select the following permissions:
   - Send Messages
   - Embed Links
   - Attach Files
   - Read Message History
8. Copy the generated URL and invite the bot to your server

### 2. Get Your Channel ID

1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click on the channel where you want the bot to post
3. Click "Copy ID"

### 3. Configure Environment Variables

1. Copy `env.example` to `.env`:

   ```bash
   cp env.example .env
   ```

2. Edit `.env` and fill in your values:
   ```
   DISCORD_TOKEN=your_actual_bot_token_here
   DISCORD_CHANNEL_ID=your_actual_channel_id_here
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Bot

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

## Configuration Options

### RSS Feed URL

By default, the bot uses Bring a Trailer's RSS feed. You can change this in the `.env` file:

```
RSS_FEED_URL=https://bringatrailer.com/feed/
```

### Check Interval

The bot checks for new listings every 5 minutes by default. You can customize this using cron syntax:

```
CHECK_INTERVAL=*/5 * * * *  # Every 5 minutes
CHECK_INTERVAL=*/10 * * * * # Every 10 minutes
CHECK_INTERVAL=0 */1 * * *  # Every hour
```

## How It Works

1. The bot connects to Discord using your bot token
2. Every 5 minutes (or your configured interval), it fetches the RSS feed
3. It compares the latest item with the previously processed item
4. If a new listing is found, it creates a Discord embed and posts it to your channel
5. The embed includes:
   - Listing title (clickable link)
   - Description snippet
   - Publication date
   - Featured image (if available)
   - Bring a Trailer branding

## Troubleshooting

### Bot not posting messages

- Check that your bot token is correct
- Verify the channel ID is correct
- Ensure the bot has permission to send messages in the channel

### No new listings being detected

- The bot only posts new listings to avoid spam
- Check the console logs for debugging information
- The first run will post the latest listing immediately

### RSS feed errors

- Check your internet connection
- Verify the RSS feed URL is accessible
- The bot will continue running and retry on the next check interval

## Dependencies

- `discord.js` - Discord bot framework
- `rss-parser` - RSS feed parsing
- `node-cron` - Scheduled task execution
- `dotenv` - Environment variable management

## License

MIT
