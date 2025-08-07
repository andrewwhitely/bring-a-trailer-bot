# 🚀 Cloudflare Workers Deployment Guide

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Install the Cloudflare Workers CLI
3. **Discord Webhook**: Create a webhook in your Discord channel

## Setup Instructions

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Create Discord Webhook

1. Go to your Discord server
2. Right-click the channel where you want posts
3. Select "Edit Channel" → "Integrations" → "Webhooks"
4. Click "New Webhook"
5. Copy the webhook URL

### 4. Set Environment Variables

```bash
# Set your Discord webhook URL
wrangler secret put DISCORD_WEBHOOK_URL
# Enter your webhook URL when prompted
```

### 5. Deploy to Cloudflare Workers

```bash
# Deploy to production
npm run deploy

# Or use wrangler directly
wrangler deploy
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

## Configuration

### Environment Variables

- `DISCORD_WEBHOOK_URL`: Your Discord webhook URL (set via wrangler secret)

### Cron Schedule

The worker runs every 5 minutes by default. To change this:

1. Go to Cloudflare Workers dashboard
2. Edit the Cron Trigger
3. Use standard cron syntax:
   - `*/5 * * * *` - Every 5 minutes
   - `*/10 * * * *` - Every 10 minutes
   - `0 */1 * * *` - Every hour

## Monitoring

### View Logs

```bash
# View real-time logs
wrangler tail

# View specific worker logs
wrangler tail --format=pretty
```

### Check Status

- **Cloudflare Dashboard**: Monitor requests, errors, and performance
- **Discord Channel**: Verify posts are appearing
- **Worker Logs**: Check for any errors

## Troubleshooting

### Bot not posting to Discord

1. **Verify webhook URL**: Check that the webhook URL is correct
2. **Test webhook manually**: Use a tool like Postman to test the webhook
3. **Check worker logs**: Use `wrangler tail` to see error messages
4. **Verify permissions**: Ensure the webhook has permission to post

### RSS feed issues

1. **Test RSS feed**: Visit `https://bringatrailer.com/feed/` directly
2. **Check worker logs**: Look for fetch errors
3. **Verify network**: Ensure the worker can access external URLs

### Scheduled triggers not working

1. **Check cron expression**: Verify the cron syntax is correct
2. **Timezone issues**: Ensure the timezone is set correctly
3. **Worker status**: Verify the worker is deployed and running

## Cost & Limits

### Free Tier Limits

- **Requests**: 100,000 requests/day
- **CPU Time**: 10ms per request
- **Memory**: 128MB per request
- **Scheduled Triggers**: Unlimited

### Pricing (if you exceed free tier)

- **Additional Requests**: $0.50 per million requests
- **Additional CPU Time**: $0.50 per million GB-seconds

## Advantages of Cloudflare Workers

✅ **Serverless**: No server management required
✅ **Global Edge**: Runs close to your users
✅ **Free Tier**: Generous free limits
✅ **Automatic Scaling**: Handles traffic spikes
✅ **Built-in Scheduling**: Cron triggers included
✅ **Fast Deployments**: Updates in seconds

## Migration from Node.js

If you're migrating from the Node.js version:

1. **Remove Node.js dependencies**: No more `discord.js`, `rss-parser`, etc.
2. **Use webhooks instead of bot tokens**: Simpler authentication
3. **Built-in scheduling**: No need for `node-cron`
4. **No environment files**: Use `wrangler secret` instead of `.env`

## Example Webhook Response

The worker posts embeds like this to Discord:

```json
{
  "embeds": [
    {
      "color": 16737717,
      "title": "1973 BMW R75/5 LWB w/Cozy Rocket Sidecar",
      "url": "https://bringatrailer.com/listing/1973-bmw-r75-5-39/",
      "description": "This 1973 BMW R75/5 is a long wheelbase example...",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "footer": {
        "text": "Bring a Trailer",
        "icon_url": "https://bringatrailer.com/favicon.ico"
      },
      "image": {
        "url": "https://example.com/car-image.jpg"
      }
    }
  ]
}
```
