# AdherePod Hardware Prototype: Tabletop Kiosk Device

## Overview

This document evaluates options for building a tabletop hardware prototype that runs the AdherePod web app as its primary interface. The device needs a screen, camera, microphone, speaker, and Wi-Fi, and should sit on a desk or kitchen counter where a patient takes their medications.

### Requirements

| Requirement | Details |
|---|---|
| **Display** | Small touchscreen (7-11 inches) to show the web app |
| **Camera** | Front-facing, for future pill bottle image capture |
| **Microphone** | For WebRTC voice chat with the AI assistant |
| **Speaker** | For audio playback from the AI assistant |
| **Connectivity** | Wi-Fi for internet access |
| **Software** | Runs the AdherePod website (HTTPS) in fullscreen/kiosk mode |
| **Form factor** | Sits on a desk or kitchen counter |
| **Budget** | $100-$200 for a single prototype unit |

### Critical Technical Constraint

AdherePod uses WebRTC for real-time voice chat. This means:
- The browser must support WebRTC (Chrome, Chromium, Firefox, or modern Android WebView).
- The site must be served over HTTPS for microphone and camera access to work.
- The device needs adequate processing power for real-time audio encoding/decoding.

---

## Option 1: Android Tablet in Kiosk Mode (RECOMMENDED)

This is the fastest, cheapest, and most reliable path to a working prototype.

### Why This Works Best

An Android tablet is a fully integrated device: screen, camera, microphone, speaker, Wi-Fi, battery, and a mature browser (Chrome) all in one package. No assembly, no driver issues, no wiring. You buy it, install one app, point it at your URL, and it works.

### Recommended Devices

#### Tier 1: Best Value -- Amazon Fire HD 8 (2024)

| Spec | Details |
|---|---|
| **Price** | $100 MSRP / $55-70 on sale (Prime Day, Black Friday) |
| **Display** | 8" HD (1280x800) |
| **Processor** | Hexa-core, 30% faster than 2022 model |
| **RAM** | 3GB (32GB model) or 4GB (64GB model) |
| **Camera** | 5MP rear, 2MP front |
| **Speakers** | Dual stereo speakers |
| **Microphone** | Yes |
| **Battery** | Up to 13 hours |
| **Wi-Fi** | Dual-band (2.4GHz + 5GHz) |
| **OS** | Fire OS (Android-based) |

**Caveat:** Fire OS uses Amazon's Appstore, not Google Play. You must sideload Google Play Store to install Chrome. This is a well-documented, 15-minute process (see setup instructions below). Alternatively, you can use the built-in Silk browser or install Fully Kiosk Browser directly from its website.

**Where to buy:** [Amazon.com](https://www.amazon.com/Amazon-responsive-designed-portable-entertainment/dp/B0CVDZ7WYW)

#### Tier 2: Best Android Experience -- Samsung Galaxy Tab A9

| Spec | Details |
|---|---|
| **Price** | $115 MSRP / as low as $99 on sale |
| **Display** | 8.7" (1340x800) |
| **Processor** | MediaTek Helio G99 (octa-core) |
| **RAM** | 4GB or 8GB |
| **Camera** | 8MP rear, 5MP front |
| **Speakers** | Dual speakers (Dolby Atmos) |
| **Microphone** | Yes |
| **Battery** | 5100 mAh |
| **Wi-Fi** | Dual-band |
| **OS** | Android with Google Play (no sideloading needed) |

**Advantage:** Ships with full Google Play Store. Chrome works out of the box. Samsung Knox provides enterprise-grade device management if you later need to deploy multiple devices. Guaranteed Android 16 update.

**Where to buy:** [Samsung.com](https://www.samsung.com/us/tablets/galaxy-tab-a9-plus/buy/) or Amazon, Best Buy, Walmart.

#### Tier 3: Cheapest Full Android -- Budget Android Tablets

| Device | Price | Display | Notes |
|---|---|---|---|
| Lenovo Tab M8 (4th Gen) | $89-110 | 8" HD | Dual speakers, 5MP rear / 2MP front camera, Google Play |
| Lenovo Tab M9 | $120-140 | 9" HD | Dolby Atmos speakers, 8MP rear / 2MP front, Helio G80 |
| URAO Android 15 Tablet | ~$80 | 8" | Android 15, 128GB storage, Wi-Fi 6 |

**Where to buy:** Amazon, Lenovo.com, Walmart.

#### Tier 4: Larger Screen -- Samsung Galaxy Tab A9+

| Spec | Details |
|---|---|
| **Price** | $179 MSRP / $149-160 on sale |
| **Display** | 11" LCD (1920x1200), 90Hz |
| **Processor** | Snapdragon 695 |
| **RAM** | 4-8GB |
| **Camera** | 8MP rear, 5MP front |
| **Speakers** | Quad speakers (Dolby Atmos) |

Best option if the 8-9" screens feel too small for elderly users.

### Setup: Kiosk Mode on Android Tablet

There are two recommended approaches:

#### Approach A: Fully Kiosk Browser (Recommended -- ~$8 one-time)

Fully Kiosk Browser is the standard tool for turning Android tablets into single-purpose web kiosks. It is widely used in the Home Assistant community for wall-mounted dashboards and in commercial kiosk deployments.

**Key features for AdherePod:**
- Locks the device to a single URL in fullscreen
- Supports HTML5 webcam and microphone access (WebRTC) on HTTPS sites
- Auto-launches on boot
- Hides the status bar, navigation bar, and system UI
- Prevents users from exiting to the home screen
- Motion detection (wakes screen when someone approaches)
- Remote administration via local network
- One-time license fee of ~$8 per device (no subscription)

**Setup steps:**

1. **Initial tablet setup:** Connect to Wi-Fi, skip unnecessary sign-in steps.
2. **Enable unknown sources:** Settings > Security & Privacy > Apps from Unknown Sources > enable for Silk (Fire) or Chrome (Android).
3. **(Fire tablets only) Sideload Google Play Store:**
   - Download four APK files from APKMirror in order: Google Account Manager, Google Services Framework, Google Play Services, Google Play Store.
   - Install each one, tapping "Done" (not "Open") after each.
   - Restart the tablet. Sign into Google Play Store.
4. **Install Fully Kiosk Browser:** Visit [fully-kiosk.com](https://www.fully-kiosk.com) on the tablet's browser and download the APK, or install from Google Play Store.
5. **Configure Fully Kiosk:**
   - Set the Start URL to your AdherePod instance (e.g., `https://adherepod.com`).
   - Enable Kiosk Mode (prevents exiting).
   - Enable "Webcam Access" and "Microphone Access" under Web Content Settings.
   - Enable "Autostart on Boot."
   - Enable "Keep Screen On" or configure screen timeout/motion detection.
   - Set an admin PIN for exiting kiosk mode.
6. **Purchase license:** One-time ~$8 to remove watermark and unlock all features.
7. **Done.** The tablet now boots directly into AdherePod.

#### Approach B: Free Alternative -- Webview Kiosk (F-Droid)

Webview Kiosk is a free, open-source Android app that locks the device to a single web page in fullscreen. It supports Lock Task Mode (screen pinning), URL filtering, and biometric/password-protected settings. Available on F-Droid. Less polished than Fully Kiosk but completely free.

### Desk/Counter Stand

A simple tablet stand completes the hardware setup:

| Stand | Price | Notes |
|---|---|---|
| Lamicall Adjustable Tablet Stand | $10 | Most popular budget option, supports 4-13" tablets, foldable |
| OMOTON T2 Tablet Stand | $13 | Aluminum, adjustable angle |
| ARKON Countertop Stand | $20-30 | Weighted base, adjustable arm, professional look |
| 3D-printed stand | $0-5 | Free STL files on Thingiverse/MakerWorld, requires 3D printer |

### Total Cost Estimate (Android Tablet Path)

| Component | Budget Option | Mid-Range Option |
|---|---|---|
| Tablet | $55 (Fire HD 8 on sale) | $149 (Galaxy Tab A9+ on sale) |
| Kiosk software | $0 (Webview Kiosk) | $8 (Fully Kiosk Browser) |
| Tablet stand | $10 (Lamicall) | $20 (ARKON) |
| **Total** | **$65** | **$177** |

### Pros and Cons

**Pros:**
- Fastest path to a working prototype (under 1 hour from unboxing to running)
- Everything integrated: screen, camera, mic, speaker, Wi-Fi, battery
- Chrome/Chromium WebRTC support is battle-tested
- Battery means it works during power outages
- Touchscreen for future UI interactions
- Huge ecosystem of tablet stands and mounts
- No soldering, no wiring, no driver debugging
- Easy to update software remotely

**Cons:**
- Looks like "a tablet on a stand" rather than a purpose-built medical device
- Fire tablets require sideloading Google Play for Chrome
- Budget tablets may slow down over 2-3 years
- Not a custom form factor (cannot brand the hardware easily)

---

## Option 2: Raspberry Pi with Touchscreen

A Raspberry Pi with an attached touchscreen, camera, and audio hardware. More customizable but requires assembly and configuration.

### Hardware Bill of Materials

**Note on Pi 5 pricing (February 2026):** Raspberry Pi 5 prices have increased significantly due to DRAM shortages driven by AI infrastructure demand. The 4GB model is now $85 (up from $60 at launch). Prices may decrease once the memory shortage abates.

#### Budget Build (Pi 5 1GB)

| Component | Price | Notes |
|---|---|---|
| Raspberry Pi 5 (1GB) | $45 | Sufficient for running Chromium with a single tab |
| Raspberry Pi Touch Display 2 (7") | $60 | 720x1280, capacitive 5-finger touch, DSI connection |
| Waveshare PI5-CASE-TD2 | $9-17 | Protective case with desk stand and tripod mount |
| USB webcam (generic 1080p) | $10-15 | Any UVC-compatible USB webcam |
| USB speakerphone or audio combo | $15-25 | e.g., Waveshare USB Sound Card with speaker + mic header |
| MicroSD card (32GB) | $8 | For Raspberry Pi OS |
| USB-C power supply (27W PD) | $12 | Official Raspberry Pi 5 power supply recommended |
| **Total** | **$159-182** | |

#### Mid-Range Build (Pi 5 4GB)

| Component | Price | Notes |
|---|---|---|
| Raspberry Pi 5 (4GB) | $85 | More headroom for Chromium |
| Raspberry Pi Touch Display 2 (7") | $60 | Official display |
| KKSB Desktop Case | $40 | Premium aluminum case with desk stand |
| Raspberry Pi Camera Module 3 | $25 | 12MP, autofocus, connects via CSI ribbon cable |
| Adafruit Voice Bonnet | $20 | I2S codec with 2 mics + 2 speaker outputs, mounts on GPIO |
| MicroSD card (32GB) | $8 | |
| USB-C power supply (27W PD) | $12 | |
| **Total** | **$250** | Exceeds $200 budget |

#### Alternative Audio Solutions

| Audio Device | Price | Type | Notes |
|---|---|---|---|
| Waveshare USB Sound Card + Speaker | $15-20 | USB | Onboard mic + speaker header, plug-and-play |
| Adafruit Voice Bonnet | $20 | I2S (GPIO) | 2 mics, 2 speaker outputs, requires installer script |
| RASPIAUDIO MIC+ V3 DAC Hat | $25-30 | I2S (GPIO) | Speaker + mic, sits on GPIO header |
| SuziePi USB Mini Mic (2-pack) + USB speaker | $8 + $10 | USB | Separate mic and speaker, cheapest combo |

### Setup: Chromium Kiosk Mode on Raspberry Pi OS

Raspberry Pi OS (based on Debian) now uses Wayland by default. The kiosk setup process has changed from older X11-based guides.

**Setup steps (Raspberry Pi OS Trixie / Bookworm, 2025+):**

1. **Flash Raspberry Pi OS** to the MicroSD card using Raspberry Pi Imager. Choose the Desktop version (not Lite).
2. **Boot and complete initial setup:** Set locale, connect to Wi-Fi, update packages.
3. **Connect hardware:** Attach the touchscreen via DSI cable, connect USB camera and audio devices.
4. **Create kiosk autostart script:**

```bash
# Create the kiosk launch script
mkdir -p /home/$USER/scripts
cat > /home/$USER/scripts/kiosk.sh << 'SCRIPT'
#!/bin/bash
sleep 4
/usr/bin/chromium-browser \
  --kiosk \
  --ozone-platform=wayland \
  --start-maximized \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --password-store=basic \
  --use-fake-ui-for-media-stream \
  https://adherepod.com
SCRIPT
chmod +x /home/$USER/scripts/kiosk.sh
```

5. **Add to autostart** (for labwc on Trixie, or wayfire on Bookworm):

```bash
# For Trixie (labwc):
mkdir -p ~/.config/labwc
echo "/home/$USER/scripts/kiosk.sh &" >> ~/.config/labwc/autostart

# For Bookworm (wayfire):
# Add under [autostart] section in ~/.config/wayfire.ini:
# kiosk = /home/$USER/scripts/kiosk.sh
```

6. **Hide the mouse cursor** (optional): Install `ydotool` and add a line to the autostart that moves the cursor off-screen.

7. **Reboot.** Chromium should launch fullscreen, pointing at AdherePod.

**Automated alternative:** Ben Swift published a fully automated kiosk setup script for Pi 5 (July 2025) that handles all of the above: [benswift.me/blog/2025/07/16/automated-rpi-web-kiosk-setup-in-2025](https://benswift.me/blog/2025/07/16/automated-rpi-web-kiosk-setup-in-2025)

### WebRTC Considerations on Raspberry Pi

- Chromium on Raspberry Pi supports WebRTC, but performance depends on the Pi model and RAM.
- The Pi 5 (even 1GB) has a quad-core Cortex-A76 processor capable of handling WebRTC audio.
- Use the `--use-fake-ui-for-media-stream` flag to auto-grant microphone/camera permissions in kiosk mode, or manually grant permissions on first run.
- USB audio devices are generally well-supported. The ALSA audio system recognizes most USB microphones and speakers automatically.
- For best results, test with a USB speakerphone (combined mic + speaker) to avoid echo/feedback issues.

### Pros and Cons

**Pros:**
- Looks more like a purpose-built device than a tablet on a stand
- Highly customizable form factor (3D print a custom enclosure)
- Full Linux OS -- can run background services, cron jobs, local scripts
- GPIO pins available for future hardware add-ons (LED indicators, buttons, sensors)
- Community support for kiosk and IoT projects is extensive
- Can be managed remotely via SSH
- Open-source stack top to bottom

**Cons:**
- Requires assembly: board + screen + camera + audio + case + cables
- Pi 5 prices are currently inflated due to RAM shortage ($85 for 4GB)
- Audio setup can be finicky (ALSA configuration, USB device detection)
- No built-in battery (must be plugged in)
- Chromium on Pi can be slower than Chrome on a tablet with equivalent specs
- More points of failure (loose ribbon cables, USB connections, power supply issues)
- Total cost often exceeds $200 for a complete, polished setup
- Wayland transition has broken many older kiosk tutorials (use 2025+ guides only)

---

## Option 3: Purpose-Built Android Kiosk Devices

Commercial kiosk tablets designed for countertop deployment in retail, restaurants, and healthcare.

### Available Products

#### Amazon Echo Show (with Fully Kiosk Browser)

| Spec | Details |
|---|---|
| **Echo Show 8 (2025)** | $160 MSRP, 8" HD screen, camera, mic array, speaker |
| **Echo Show 5** | $90 MSRP, 5.5" screen |
| **Setup** | Install Fully Kiosk Browser via ADB sideloading |
| **License** | ~$8 one-time for Fully Kiosk |

The Echo Show runs Fire OS and can be converted into a kiosk by sideloading Fully Kiosk Browser via ADB commands. This approach is well-documented in the Home Assistant community. The Echo Show has better speakers and microphone arrays than most budget tablets, making it potentially superior for voice interactions.

**Limitation:** Requires ADB setup on a computer. The Echo Show periodically tries to revert to its home screen; Fully Kiosk Browser prevents this but it adds a layer of hackiness.

#### Commercial Kiosk Enclosures + Tablet

Companies like Kiosk Group, Armodilo, and Bosstab sell professional countertop enclosures that hold consumer tablets:

| Product | Price | Notes |
|---|---|---|
| Kiosk Group Countertop Stand | $150-300 | Supports iPad, Android, and Windows tablets |
| Armodilo Tablet Kiosk | $200-500 | Modular, upgradeable, premium build |
| Pyle Anti-Theft Kiosk Stand | $50-80 | Budget metal stand with lock, Amazon |

These are designed for public-facing deployments (restaurants, lobbies, check-in desks). For a prototype, they are overkill and expensive ($300-800 total with tablet + enclosure + software subscription).

#### Dedicated Android Kiosk Tablets (Bulk/Enterprise)

Vendors like Elo Touch, ProDVX, and Mimo Monitors sell purpose-built Android kiosk tablets. These are designed for 24/7 commercial operation with features like pass-through charging, tamper-proof enclosures, and enterprise MDM support.

| Vendor | Starting Price | Notes |
|---|---|---|
| Elo Touch I-Series | $400+ | Commercial grade, 10-15" screens |
| ProDVX Android Displays | $300+ | Built for digital signage and kiosks |
| Mimo Monitors | $200+ | Small-format USB/Android displays |

**These are not recommended for prototyping** due to high cost, long lead times, and minimum order quantities. They become relevant if AdherePod scales to hundreds or thousands of deployed devices.

### Pros and Cons

**Pros:**
- Professional appearance
- Designed for 24/7 operation
- Tamper-resistant enclosures
- Enterprise device management (MDM, Knox, Zero-Touch Enrollment)

**Cons:**
- Expensive ($300-800+ per unit for a complete setup)
- Overkill for a prototype
- Long procurement lead times for commercial hardware
- Monthly software subscriptions for MDM platforms ($5-75/month)
- Not cost-effective until deploying 10+ units

---

## Option 4: Other Approaches

### Repurposed Old Android Phone

If you have an old Android phone (Android 8+), you can turn it into a free kiosk device:

- Install Fully Kiosk Browser or Webview Kiosk (F-Droid, free).
- Set AdherePod URL as the start page.
- Put the phone in a desk stand ($5-10).
- Total cost: $0-10 (assuming you have the phone).

**Best for:** Quick proof-of-concept testing before buying dedicated hardware. Not suitable as a product prototype due to small screen size (5-6"), aging hardware, and inconsistent camera/mic quality.

**Setup:** Install Fully Kiosk Browser > set URL > enable kiosk mode > enable webcam/mic access > set auto-start on boot. Takes about 10 minutes.

### ChromeOS / Chromebook

ChromeOS has built-in kiosk mode support via Google Admin Console. A cheap Chromebook ($100-150) with its screen, camera, mic, and speaker could work, but the laptop form factor is not ideal for a countertop device. ChromeOS kiosk mode also typically requires a Google Workspace subscription for managed devices.

**Not recommended** for this use case due to form factor and management overhead.

### Old iPad with Guided Access

Apple's Guided Access mode locks an iPad to a single app. An old iPad running Safari could display AdherePod. However, Safari's WebRTC support has historically been less reliable than Chrome's, and iPads hold their resale value (even old ones cost $100+), making this a poor value proposition compared to a $70 Fire tablet.

---

## Recommendation

### For Immediate Prototyping: Samsung Galaxy Tab A9 ($115)

**Total cost: ~$125 (tablet + stand + Fully Kiosk license)**

This is the recommended path for the following reasons:

1. **No sideloading required.** Google Play Store and Chrome work out of the box. This eliminates the biggest friction point of the Fire HD 8 path.

2. **WebRTC just works.** Chrome on Android has the most reliable WebRTC implementation. Microphone and camera permissions are straightforward.

3. **Adequate hardware.** The MediaTek Helio G99 processor, 4GB RAM, 8MP rear camera, 5MP front camera, and Dolby Atmos dual speakers are more than sufficient.

4. **One hour to a working prototype.** Unbox, connect to Wi-Fi, install Fully Kiosk Browser from the Play Store, enter the AdherePod URL, enable kiosk mode, done.

5. **Upgradeable.** If the 8.7" screen is too small, the Galaxy Tab A9+ (11", ~$150 on sale) is the same setup process with a larger display.

6. **Future-proof.** Samsung guarantees Android 16 updates. Samsung Knox provides enterprise MDM capabilities if you later need to manage a fleet of devices.

### For Testing on a Budget: Amazon Fire HD 8 ($55-70 on sale)

If budget is the primary constraint, the Fire HD 8 works well but requires 15-20 minutes of sideloading Google Play. Alternatively, Fully Kiosk Browser can be installed directly (it does not require Google Play) and uses its own built-in browser engine, which supports WebRTC on HTTPS sites.

### When to Consider Raspberry Pi

The Raspberry Pi path makes sense when:
- You want a device that looks purpose-built rather than "a tablet on a stand."
- You need GPIO access for physical buttons, LEDs, or sensors.
- You want to run background services on the device (e.g., local medication schedule processing).
- You are building toward a custom hardware product and need to understand the embedded systems path.

The Pi path does not make sense for initial prototyping because it costs more, takes longer to set up, and introduces multiple points of failure without providing meaningful benefits for validating the core AdherePod experience.

### Prototype-to-Product Path

| Phase | Hardware | Cost | Purpose |
|---|---|---|---|
| **Phase 1: Validate** | Galaxy Tab A9 + Fully Kiosk + stand | ~$125 | Prove the concept works with real users |
| **Phase 2: Refine** | Galaxy Tab A9+ (larger screen) or Fire HD 10 | ~$150-180 | Test with different screen sizes, gather feedback |
| **Phase 3: Custom** | Raspberry Pi 5 + custom 3D-printed enclosure | ~$200-250 | Build a branded, purpose-built device |
| **Phase 4: Scale** | Custom Android tablet (ODM from Shenzhen) or commercial kiosk | $50-100/unit at volume | Mass production |

---

## Quick-Start Checklist (Galaxy Tab A9 Path)

- [ ] Buy Samsung Galaxy Tab A9 (Wi-Fi, 64GB) -- $115 on Samsung.com or Amazon
- [ ] Buy Lamicall Adjustable Tablet Stand -- $10 on Amazon
- [ ] Unbox tablet, connect to Wi-Fi, complete initial setup
- [ ] Open Google Play Store, install "Fully Kiosk Browser & App Lockdown"
- [ ] Open Fully Kiosk Browser, set Start URL to `https://adherepod.com` (or your staging URL)
- [ ] Go to Fully Kiosk Settings > Web Content Settings:
  - [ ] Enable "Webcam Access (PLUS)"
  - [ ] Enable "Microphone Access (PLUS)"
- [ ] Go to Fully Kiosk Settings > Device Management:
  - [ ] Enable "Kiosk Mode"
  - [ ] Enable "Keep Screen On" (or set desired timeout)
  - [ ] Enable "Autostart on Boot"
- [ ] Go to Fully Kiosk Settings > set admin PIN
- [ ] Purchase Fully Kiosk PLUS license (~$8 one-time) to remove watermark and enable WebRTC features
- [ ] Test: open AdherePod, start a voice chat session, verify audio works both ways
- [ ] Place tablet in stand on desk/counter
- [ ] Prototype complete

---

## Appendix: Key Vendor Links

| Resource | URL |
|---|---|
| Fully Kiosk Browser | [fully-kiosk.com](https://www.fully-kiosk.com) |
| Webview Kiosk (free, open-source) | [F-Droid](https://f-droid.org/en/packages/uk.nktnet.webviewkiosk/) |
| Samsung Galaxy Tab A9 | [samsung.com](https://www.samsung.com/us/tablets/galaxy-tab-a9-plus/buy/) |
| Amazon Fire HD 8 | [amazon.com](https://www.amazon.com/Amazon-responsive-designed-portable-entertainment/dp/B0CVDZ7WYW) |
| Raspberry Pi 5 | [raspberrypi.com](https://www.raspberrypi.com/products/raspberry-pi-5/) |
| Raspberry Pi Touch Display 2 | [raspberrypi.com](https://www.raspberrypi.com/products/touch-display-2/) |
| Pi Kiosk Automated Script (2025) | [benswift.me](https://benswift.me/blog/2025/07/16/automated-rpi-web-kiosk-setup-in-2025) |
| KKSB Pi 5 + Touchscreen Case | [kksb-cases.com](https://kksb-cases.com/products/kksb-case-for-raspberry-pi-5-touch-display-2-desktop-orientation) |
| Waveshare Pi 5 Case | [waveshare.com](https://www.waveshare.com/pi5-case-td2.htm) |
| Lamicall Tablet Stand | [amazon.com](https://www.amazon.com/Tablet-Stand-Adjustable-Lamicall-Reader/dp/B01DBV1OKY) |
| Thingiverse (3D-printed stands) | [thingiverse.com](https://www.thingiverse.com/tag:tablet_holder) |

---

*Last updated: February 4, 2026. Prices reflect current market conditions, including Raspberry Pi price increases due to the global DRAM shortage.*
