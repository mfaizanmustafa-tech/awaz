# Icecast Streaming Setup Guide for Awaz Pulse

## Overview

Icecast is a traditional internet radio streaming server that provides **lower latency (2-5 seconds)** compared to HLS streaming. It's perfect for live radio broadcasts where real-time interaction matters.

## Architecture

```
[Broadcasting Software] → [Icecast Server (port 8000)] → [Listeners]
        ↓                           ↓                          ↓
   (Butt, IDJC, etc)          Direct Stream              Audio Players
```

## Quick Start

### 1. Install Icecast Server

#### macOS (using Homebrew)
```bash
# Install Icecast
brew install icecast

# Start Icecast
icecast -c /usr/local/etc/icecast.xml

# Or run in background
brew services start icecast
```

#### Ubuntu/Debian Linux
```bash
# Install Icecast
sudo apt-get update
sudo apt-get install icecast2

# During installation, configure:
# - Hostname: localhost (or your domain)
# - Source password: awaz_source_2024
# - Relay password: awaz_relay_2024
# - Admin password: awaz_admin_2024

# Start Icecast
sudo systemctl start icecast2
sudo systemctl enable icecast2
```

#### Windows
1. Download Icecast from: https://icecast.org/download/
2. Install the Windows version
3. Edit `C:\Program Files\Icecast2\etc\icecast.xml` (see configuration below)
4. Start Icecast from Start Menu or Services

### 2. Configure Icecast

Edit your Icecast configuration file:

**macOS:** `/usr/local/etc/icecast.xml`  
**Linux:** `/etc/icecast2/icecast.xml`  
**Windows:** `C:\Program Files\Icecast2\etc\icecast.xml`

```xml
<icecast>
    <limits>
        <clients>100</clients>
        <sources>10</sources>
        <queue-size>524288</queue-size>
        <client-timeout>30</client-timeout>
        <header-timeout>15</header-timeout>
        <source-timeout>10</source-timeout>
        <burst-on-connect>1</burst-on-connect>
        <burst-size>65535</burst-size>
    </limits>

    <authentication>
        <!-- Source password (for broadcasters) -->
        <source-password>awaz_source_2024</source-password>
        
        <!-- Relay password -->
        <relay-password>awaz_relay_2024</relay-password>
        
        <!-- Admin password (for web interface) -->
        <admin-user>admin</admin-user>
        <admin-password>awaz_admin_2024</admin-password>
    </authentication>

    <hostname>localhost</hostname>

    <listen-socket>
        <port>8000</port>
    </listen-socket>

    <fileserve>1</fileserve>

    <paths>
        <basedir>/usr/local/share/icecast</basedir>
        <logdir>/usr/local/var/log/icecast</logdir>
        <webroot>/usr/local/share/icecast/web</webroot>
        <adminroot>/usr/local/share/icecast/admin</adminroot>
        <alias source="/" destination="/status.xsl"/>
    </paths>

    <logging>
        <accesslog>access.log</accesslog>
        <errorlog>error.log</errorlog>
        <loglevel>3</loglevel>
    </logging>

    <security>
        <chroot>0</chroot>
    </security>
</icecast>
```

### 3. Restart Icecast

```bash
# macOS
brew services restart icecast

# Linux
sudo systemctl restart icecast2

# Windows
# Restart from Services or close and reopen Icecast
```

### 4. Verify Icecast is Running

Open your browser and go to:
```
http://localhost:8000
```

You should see the Icecast status page.

## Broadcasting Software Options

### Option 1: Butt (Broadcast Using This Tool) - Recommended

**Best for:** Simple, reliable streaming

1. **Download Butt:**
   - macOS/Windows/Linux: https://danielnoethen.de/butt/

2. **Configure Butt:**
   - Click **Settings**
   - **Server** tab:
     - Type: `Icecast`
     - Address: `localhost`
     - Port: `8000`
     - Password: `awaz_source_2024`
     - Mount point: `/YOUR_CHANNEL_ID.mp3` (get from Awaz Pulse dashboard)
     - Icecast user: `source`
   
   - **Audio** tab:
     - Samplerate: `44100 Hz`
     - Bitrate: `128 kbps` (or higher for better quality)
     - Codec: `MP3` or `OGG`
   
   - **Stream Info** tab:
     - Name: Your station name
     - Description: Your station description
     - Genre: Your genre
     - URL: Your website

3. **Select Audio Input:**
   - In main window, select your microphone or audio device
   - Adjust input levels

4. **Start Broadcasting:**
   - Click the **Play** button
   - You're live!

### Option 2: IDJC (Internet DJ Console)

**Best for:** Professional DJ mixing with multiple audio sources

1. **Install IDJC:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install idjc
   
   # macOS (requires Jack audio)
   brew install jack
   brew install idjc
   ```

2. **Configure:**
   - Launch IDJC
   - Go to **Output** → **Servers**
   - Add new server with Icecast settings
   - Configure audio routing in Jack

### Option 3: Mixxx

**Best for:** DJ software with mixing capabilities

1. **Download:** https://mixxx.org/download/
2. **Configure Live Broadcasting:**
   - Preferences → Live Broadcasting
   - Enable broadcasting
   - Enter Icecast server details

### Option 4: OBS Studio (with Icecast plugin)

**Best for:** Video streaming that also outputs audio to Icecast

1. Install OBS Icecast plugin
2. Configure output to Icecast server

## Get Your Icecast Credentials from Awaz Pulse

1. **Login to Station Owner Dashboard:**
   ```
   http://localhost:4200
   ```

2. **Go to Control Panel**

3. **Switch to Icecast:**
   - Click the **Icecast** button in the streaming type selector
   - System will switch your channel to Icecast mode

4. **View Credentials:**
   - Icecast Server: `http://localhost:8000`
   - Mount Point: `/YOUR_CHANNEL_ID.mp3`
   - Source Password: `awaz_source_2024`
   - Playback URL: `http://localhost:8000/YOUR_CHANNEL_ID.mp3`

## Testing Your Stream

### 1. Start Broadcasting

Use Butt or your chosen software to start streaming.

### 2. Check Icecast Admin

Go to: `http://localhost:8000/admin/`
- Username: `admin`
- Password: `awaz_admin_2024`

You should see your mount point listed with listener count.

### 3. Listen to Your Stream

Open in any audio player or browser:
```
http://localhost:8000/YOUR_CHANNEL_ID.mp3
```

Or use VLC:
```bash
vlc http://localhost:8000/YOUR_CHANNEL_ID.mp3
```

### 4. Check in Awaz Pulse

Your listeners on the Awaz Pulse platform will automatically hear your Icecast stream when you're live.

## Production Setup

### 1. Update Passwords

Edit `/etc/icecast2/icecast.xml` and change:
- `source-password` - Use a strong password
- `relay-password` - Use a strong password  
- `admin-password` - Use a strong password

### 2. Configure Hostname

Change `<hostname>` to your domain:
```xml
<hostname>stream.yourdomain.com</hostname>
```

### 3. SSL/HTTPS (Optional but Recommended)

Use a reverse proxy (Nginx) to add HTTPS:

```nginx
server {
    listen 443 ssl;
    server_name stream.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Firewall Configuration

Open port 8000:
```bash
# Ubuntu/Debian
sudo ufw allow 8000/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

## Troubleshooting

### Icecast Won't Start

**Check if port 8000 is already in use:**
```bash
# macOS/Linux
lsof -i :8000

# Windows
netstat -ano | findstr :8000
```

**Check logs:**
```bash
# macOS
tail -f /usr/local/var/log/icecast/error.log

# Linux
tail -f /var/log/icecast2/error.log
```

### Can't Connect from Broadcasting Software

1. **Verify Icecast is running:**
   ```bash
   # macOS
   brew services list | grep icecast
   
   # Linux
   sudo systemctl status icecast2
   ```

2. **Check credentials match** in both Icecast config and broadcasting software

3. **Verify mount point format:** Should be `/channel-id.mp3` (starts with `/`)

### No Audio / Stream Not Playing

1. **Check Icecast admin page** - Is your mount point listed?
2. **Verify source is connected** - Check Icecast logs
3. **Test stream URL directly** in VLC or browser
4. **Check audio levels** in broadcasting software

### High CPU Usage

1. **Lower bitrate** in broadcasting software (try 96 or 64 kbps)
2. **Reduce number of listeners** in `<clients>` setting
3. **Use MP3 instead of OGG** (more efficient)

### Authentication Failed

1. **Double-check password** in Icecast config
2. **Restart Icecast** after config changes
3. **Check username** - Should be `source` for broadcasting

## Comparison: Icecast vs HLS

| Feature | Icecast | HLS (RTMP) |
|---------|---------|------------|
| **Latency** | 2-5 seconds | 10-30 seconds |
| **Setup Complexity** | Simple | Moderate |
| **Browser Support** | Requires plugin/player | Native HTML5 |
| **Mobile Support** | Good with apps | Excellent |
| **Bandwidth** | Lower | Higher |
| **Best For** | Live radio, talk shows | Music streaming, podcasts |

## Best Practices

1. **Use 128 kbps MP3** for good quality/bandwidth balance
2. **Monitor listener count** via Icecast admin
3. **Set stream metadata** (song titles, artist) in your broadcasting software
4. **Test your stream** before going live
5. **Have a backup** - Keep pre-recorded content ready
6. **Monitor server resources** - CPU, bandwidth, memory

## Useful Commands

```bash
# Check Icecast status
brew services list | grep icecast          # macOS
sudo systemctl status icecast2             # Linux

# View logs
tail -f /usr/local/var/log/icecast/error.log    # macOS
tail -f /var/log/icecast2/error.log             # Linux

# Restart Icecast
brew services restart icecast              # macOS
sudo systemctl restart icecast2            # Linux

# Test stream
curl -I http://localhost:8000/YOUR_CHANNEL_ID.mp3
```

## Additional Resources

- **Icecast Documentation:** https://icecast.org/docs/
- **Butt Documentation:** https://danielnoethen.de/butt/manual.html
- **IDJC Documentation:** http://idjc.sourceforge.net/
- **Icecast Forum:** https://icecast.org/forum/

## Support

If you encounter issues:
1. Check Icecast logs
2. Verify all credentials match
3. Test with VLC player first
4. Check firewall settings
5. Ensure Icecast is running

---

**Ready to go live with Icecast? Follow the Quick Start section above!**
