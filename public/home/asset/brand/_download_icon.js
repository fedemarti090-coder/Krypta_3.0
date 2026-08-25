import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

// Lista estesa dei siti più diffusi
const sites = [
    // Social & Messaging
    { domain: 'google.com', name: 'google' },
    { domain: 'github.com', name: 'github' },
    { domain: 'facebook.com', name: 'facebook' },
    { domain: 'instagram.com', name: 'instagram' },
    { domain: 'x.com', name: 'twitter' },
    { domain: 'linkedin.com', name: 'linkedin' },
    { domain: 'reddit.com', name: 'reddit' },
    { domain: 'tiktok.com', name: 'tiktok' },
    { domain: 'whatsapp.com', name: 'whatsapp' },
    { domain: 'telegram.org', name: 'telegram' },
    { domain: 'discord.com', name: 'discord' },
    { domain: 'pinterest.com', name: 'pinterest' },
    { domain: 'twitch.tv', name: 'twitch' },

    // Intrattenimento & Streaming
    { domain: 'netflix.com', name: 'netflix' },
    { domain: 'spotify.com', name: 'spotify' },
    { domain: 'youtube.com', name: 'youtube' },
    { domain: 'primevideo.com', name: 'primevideo' },
    { domain: 'disneyplus.com', name: 'disneyplus' },
    { domain: 'soundcloud.com', name: 'soundcloud' },

    // Gaming
    { domain: 'steampowered.com', name: 'steam' },
    { domain: 'epicgames.com', name: 'epicgames' },
    { domain: 'roblox.com', name: 'roblox' },
    { domain: 'playstation.com', name: 'playstation' },
    { domain: 'xbox.com', name: 'xbox' },
    { domain: 'nintendo.com', name: 'nintendo' },

    // Produttività & Dev
    { domain: 'microsoft.com', name: 'microsoft' },
    { domain: 'apple.com', name: 'apple' },
    { domain: 'dropbox.com', name: 'dropbox' },
    { domain: 'notion.so', name: 'notion' },
    { domain: 'trello.com', name: 'trello' },
    { domain: 'slack.com', name: 'slack' },
    { domain: 'zoom.us', name: 'zoom' },
    { domain: 'figma.com', name: 'figma' },
    { domain: 'gitlab.com', name: 'gitlab' },
    { domain: 'bitbucket.org', name: 'bitbucket' },
    { domain: 'canva.com', name: 'canva' },
    { domain: 'chatgpt.com', name: 'openai' },

    // E-Commerce & Pagamenti
    { domain: 'amazon.com', name: 'amazon' },
    { domain: 'ebay.com', name: 'ebay' },
    { domain: 'paypal.com', name: 'paypal' },
    { domain: 'stripe.com', name: 'stripe' },
    { domain: 'revolut.com', name: 'revolut' },
    { domain: 'aliexpress.com', name: 'aliexpress' },
    { domain: 'vinted.com', name: 'vinted' },
    { domain: 'booking.com', name: 'booking' },
    { domain: 'airbnb.com', name: 'airbnb' },
    { domain: 'ubereats.com', name: 'ubereats' }
];

const outputDir = path.join(process.cwd(), 'public', 'home', 'asset', 'brand');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function downloadIcon({ domain, name }) {
    const filePath = path.join(outputDir, `${name}.png`);
    const url = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

    try {
        const res = await fetch(url);

        if (!res.ok) {
            console.log(`❌ Errore HTTP ${res.status} per: ${name}`);
            return;
        }

        const fileStream = fs.createWriteStream(filePath);
        await pipeline(res.body, fileStream);
        console.log(`✅ Scaricata: ${name}.png`);
    } catch (err) {
        console.error(`⚠️ Errore per ${name}:`, err.message);
    }
}

async function start() {
    console.log(`🚀 Avvio download di ${sites.length} icone...\n`);
    for (const site of sites) {
        await downloadIcon(site);
    }
    console.log('\n✨ Download completato con successo!');
}

start();