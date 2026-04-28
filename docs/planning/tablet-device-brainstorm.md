# AdherePod Tablet Device Brainstorm

A standalone, branded tablet device for elderly and low-literacy patients who don't have a phone or device to access AdherePod.

---

## Hardware Options

### Recommended: Samsung Galaxy Tab A9+ (~$149-199)

- 11" display — large enough for elderly users with vision issues
- 90Hz refresh rate for smooth interaction
- Samsung Knox enterprise security built in
- Quad speakers with Dolby Atmos — important for voice assistant audio
- Good microphone array — critical for voice chat
- 3-5 years of security updates from Samsung
- Wi-Fi only model keeps cost under $200

### Alternatives

| Device | Price | Pros | Cons |
|---|---|---|---|
| Samsung Galaxy Tab A9+ (64GB) | $149-199 | Best overall: large screen, Knox, good audio | Slightly higher price |
| Samsung Galaxy Tab S6 Lite (2024) | $180-200 | Includes S-Pen for signatures | Older chipset |
| Samsung Galaxy Tab A8 | $130-170 | Cheapest option, 10.5" | Older, less software support |

**Volume pricing:** At 50+ units, negotiate directly with Samsung B2B sales for bulk discounts.

---

## Branded Case & Stand

### Option A: Full Custom Enclosure (Premium)

**Armodilo** (armodilo.com) — Full custom branding:
- Pantone color matching for AdherePod brand colors
- Laser-cut logo and custom graphics
- In-house paint booth, CAD/CAM design, 3D printing
- Tabletop and wall-mount options
- Built-in cable management and charging
- ~$50-80/unit at volume

### Option B: Healthcare-Specific Stand

**Bouncepad** (bouncepad.com) — Healthcare-focused:
- Pre-designed for healthcare environments
- Tamper-proof, cable-concealed designs
- Compatible with Samsung Galaxy Tab series
- Freestanding or wall-mount
- GDPR/health-safety compliant designs

### Option C: Branded Case (Budget)

**Brand.it** or **Custom Logo Cases** — Simple branded cases:
- Custom logo/colors on a protective case
- Minimum order ~10 units
- $6-51/case depending on customization
- 7-day sample turnaround
- Add a separate tabletop stand (~$10-20)

### Recommended Design for Home Use

- **Tabletop stand** angled like a bedside clock (not wall-mount)
- Always plugged in, always charging, always ready
- AdherePod branding on the case/bezel
- Rugged/drop-proof edges
- Large, visible screen from across the room

---

## Software Lockdown

### Approach: PWA + MDM

Lock the tablet to show only AdherePod — no app store, no settings, no confusion.

#### 1. Progressive Web App (PWA)

Add a PWA manifest to the Next.js app:
- Fullscreen display mode (no browser chrome)
- Auto-installs to home screen
- Offline capability for basic features
- Push notifications for medication reminders
- Updates happen server-side — no device interaction needed

#### 2. Samsung Knox Configure (~$1/device one-time)

- Lock device to a single app (Chrome running the PWA)
- Hide navigation bar and status bar
- Auto-launch AdherePod on boot
- Disable app store, settings, notifications from other apps
- Prevent factory reset without admin PIN

#### 3. Full MDM for Fleet Management ($1-4/device/month)

Options: Hexnode, Scalefusion, AirDroid Business, or Samsung Knox Manage

- Remote device monitoring (is it online? battery level?)
- Over-the-air (OTA) configuration updates
- Remote wipe if device is lost/stolen
- Usage analytics (how often is the patient using it?)
- Bulk provisioning for new devices

---

## Software Features Needed

### 1. PWA Manifest
Add `manifest.json` to the Next.js app with:
- `display: "fullscreen"` or `"standalone"`
- App icon and splash screen with AdherePod branding
- Theme color matching brand
- Offline service worker for basic caching

### 2. Device Provisioning Flow
- Admin screen to associate device serial number with a patient account
- Auto-login: patient never needs to enter credentials
- QR code scan or activation code for initial setup

### 3. Always-On Voice Mode
- Tablet sits on nightstand or kitchen counter
- Large "Talk to AdherePod" button always visible
- Optional: wake word detection ("Hey AdherePod")
- Screen dims but stays responsive when idle

### 4. Connectivity Monitoring
- Device heartbeat every 15 minutes
- Alert care team if device hasn't checked in (unplugged, WiFi down)
- Dashboard widget in provider view showing device status

### 5. Elderly-Optimized UI
- Extra-large text and buttons (minimum 18px, buttons 48px+ touch targets)
- High contrast mode (WCAG AAA)
- Simplified navigation (minimal screens)
- Audio feedback for all interactions
- No typing required — voice-first for all inputs

---

## Cost Estimate Per Unit

| Component | One-Time Cost | Monthly Cost |
|---|---|---|
| Samsung Galaxy Tab A9+ (64GB) | ~$150 | — |
| Branded case/stand | ~$30-80 | — |
| Knox Configure license | ~$1 | — |
| MDM license (optional) | — | ~$1-4/mo |
| Charging cable + plug | included | — |
| Shipping/packaging | ~$10-15 | — |
| **Total** | **~$190-245** | **$0-4/mo** |

At 100 units with bulk pricing: estimated ~$170-200/unit all-in.

---

## Business Model & Reimbursement

### Medicare Advantage / RPM Pathway

CMS covers Remote Patient Monitoring (RPM) for chronic conditions. If AdherePod tracks medication adherence data and shares it with providers, this can qualify for RPM billing codes:

- **CPT 99453** — Initial patient setup and education (~$19)
- **CPT 99454** — Monthly device supply and data transmission (~$55/mo)
- **CPT 99457** — First 20 min of clinical staff time reviewing data (~$50/mo)
- **CPT 99458** — Additional 20 min blocks (~$42/mo)

**Potential monthly RPM revenue per patient: ~$105-147/month**

The $200 device pays for itself in the first two months of RPM billing.

### Distribution Channels

1. **Medicare Advantage plans** — MA plans buy devices in bulk, distribute to high-risk members. A $200 tablet is far cheaper than a $15,000+ hospital readmission.

2. **Provider-prescribed** — Doctor or care team prescribes the "AdherePod device" like a blood pressure monitor. Your existing provider dashboard tracks adherence.

3. **Direct-to-patient (subsidized)** — Offer the device free or at low cost, subsidized by the health plan or pharmacy benefit manager.

4. **Pharmacy partnerships** — Pharmacies distribute devices to patients with complex medication regimens.

### Precedent

Companies already deploying tablets to elderly patients' homes:
- **Health Recovery Solutions (HRS)** — Average patient age 70-80, tablet-based RPM
- **Caring Senior Service** — Provides a tablet in every home for care coordination
- **University of Michigan Health** — Patient Monitoring at Home program with tablet kits

---

## Implementation Roadmap

### Phase 1: Prototype (Week 1-2)
- [ ] Order a Samsung Galaxy Tab A9+ for testing
- [ ] Add PWA manifest to the Next.js app
- [ ] Test Samsung Knox Configure for single-app lockdown
- [ ] Build device provisioning API (serial number → patient account)

### Phase 2: Design (Week 3-4)
- [ ] Order sample branded cases from Armodilo and Brand.it
- [ ] Design elderly-optimized UI variant (large text, high contrast)
- [ ] Build always-on voice mode landing screen
- [ ] Create device status monitoring in provider dashboard

### Phase 3: Pilot (Week 5-8)
- [ ] Deploy 5-10 devices to test patients
- [ ] Gather feedback on usability, case design, voice quality
- [ ] Iterate on UI and hardware setup
- [ ] Document setup and troubleshooting for care teams

### Phase 4: Scale (Month 3+)
- [ ] Negotiate bulk pricing with Samsung B2B
- [ ] Finalize branded case design with manufacturer
- [ ] Set up MDM for fleet management
- [ ] Pitch to Medicare Advantage plans with pilot data
- [ ] Pursue RPM billing code certification

---

## Open Questions

1. **WiFi vs. Cellular?** — WiFi-only is cheaper, but many elderly patients have unreliable WiFi. A cellular model (~$50 more) with a cheap data plan (~$5/mo) may be more reliable.
2. **Battery vs. always plugged in?** — If always plugged in, battery degradation is a concern long-term. Samsung has a "protect battery" mode that caps at 85%.
3. **Camera usage?** — The existing `check_camera` voice tool suggests camera features. Front camera could be used for video calls with providers.
4. **HIPAA compliance** — Device encryption (Knox handles this), remote wipe capability, and secure data transmission are all needed. MDM solutions address most of this.
5. **Device lifecycle** — What happens when a patient no longer needs it? Refurbishment and redeployment process needed.
