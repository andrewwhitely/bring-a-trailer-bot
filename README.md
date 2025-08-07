# Discord Bring a Trailer Bot (Cloudflare Workers)

A Discord bot that monitors Bring a Trailer's RSS feed and posts new listings to a Discord channel using Cloudflare Workers.

## Features

- 🚗 Monitors Bring a Trailer's RSS feed for new listings
- 📱 Posts beautiful Discord embeds with listing details
- ⏰ Configurable check intervals (default: every 5 minutes)
- 🔄 Prevents duplicate posts
- 🖼️ Extracts and displays listing images (multiple formats supported)
- 📊 Includes listing metadata (title, description, link, timestamp)
- 🎨 Bring a Trailer branding with orange accent color

## Setup Instructions

### 1. Create a Discord Webhook

1. Go to your Discord server
2. Right-click the channel where you want posts
3. Select "Edit Channel" → "Integrations" → "Webhooks"
4. Click "New Webhook"
5. Copy the webhook URL (you'll need this later)

### 2. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 3. Login to Cloudflare

```bash
wrangler login
```

### 4. Set Environment Variables

```bash
# Set your Discord webhook URL
wrangler secret put DISCORD_WEBHOOK_URL
# Enter your webhook URL when prompted
```

### 5. Deploy to Cloudflare Workers

```bash
# Install dependencies
npm install

# Deploy to production
npm run deploy
```

### 6. Set Up Scheduled Triggers

After deployment, go to the Cloudflare Workers dashboard:

1. Navigate to your worker
2. Go to "Triggers" tab
3. Add a new Cron Trigger:
   - **Cron Expression**: `*/5 * * * *` (every 5 minutes)
   - **Timezone**: Your preferred timezone

## Testing

### Local Development

```bash
# Run locally for testing
npm run dev

# Test the RSS parsing
curl http://localhost:8787/check
```

### Production Testing

```bash
# Check if worker is running
curl https://your-worker-name.your-subdomain.workers.dev/health

# Manually trigger a check
curl https://your-worker-name.your-subdomain.workers.dev/check
```

## Configuration Options

### RSS Feed URL

The bot uses Bring a Trailer's RSS feed by default. To change this, modify the `RSS_FEED_URL` constant in `index.js`.

### Check Interval

The worker runs every 5 minutes by default. To change this:

1. Go to Cloudflare Workers dashboard
2. Edit the Cron Trigger
3. Use standard cron syntax:
   - `*/5 * * * *` - Every 5 minutes
   - `*/10 * * * *` - Every 10 minutes
   - `0 */1 * * *` - Every hour

## How It Works

1. Cloudflare Workers runs on a schedule (every 5 minutes)
2. The worker fetches Bring a Trailer's RSS feed
3. It parses the XML and extracts the latest listing
4. It creates a Discord embed and posts it via webhook
5. The embed includes:
   - Listing title (clickable link)
   - Description snippet
   - Publication date
   - Featured image (if available)
   - Bring a Trailer branding

## Troubleshooting

### Bot not posting messages

- Check that your webhook URL is correct
- Verify the webhook has permission to post in the channel
- Test the webhook manually with a tool like Postman

### No new listings being detected

- Check the worker logs using `wrangler tail`
- Verify the RSS feed is accessible
- Test the `/check` endpoint manually

### RSS feed errors

- Check your internet connection
- Verify the RSS feed URL is accessible
- Look at worker logs for fetch errors

## Dependencies

- `wrangler` - Cloudflare Workers CLI (dev dependency)
- Built-in `fetch` API for HTTP requests
- Custom RSS parser (no external dependencies)

## License

MIT
