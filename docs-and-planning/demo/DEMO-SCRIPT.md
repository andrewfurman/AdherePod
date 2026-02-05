# AdherePod Demo Script

## Scenario

**Patient:** Robert ("Bob") Johnson, 65-year-old male
**Conditions:** Type 2 Diabetes, Hypertension
**Situation:** Bob just returned from a doctor's appointment. His doctor increased one medication and prescribed a new one. He has the printed prescription in hand.

## Pre-Demo Setup

Before the demo, make sure the logged-in user has exactly **two medications** in their list:

| Medication | Times/Day | Timing | Notes |
|---|---|---|---|
| Metformin 500mg | 2 | With breakfast and dinner | Type 2 Diabetes |
| Lisinopril 10mg | 1 | Every morning | Blood pressure |

Also prepare a **printed prescription** (real or mock) on paper that says something like:

```
Dr. Sarah Chen, MD — Internal Medicine
Patient: Robert Johnson    DOB: 03/15/1961

Rx: Atorvastatin 20mg
    Take one tablet by mouth once daily at bedtime
    Qty: 30    Refills: 5

Rx: Metformin — increase to 1000mg twice daily
    (Continue with meals)

Date: [today's date]
Signature: Dr. S. Chen
```

Print this out or write it clearly on a piece of paper. The camera will read it.

---

## Demo Flow

### Part 1 — Sign In & Show Dashboard (30 seconds)

**Presenter says:**
> "This is AdherePod, a voice-first medication management app designed for elderly and low-literacy users. Let me sign in as our demo patient, Bob."

- Sign in at the login page
- Dashboard loads showing the medication list on the left and the voice assistant on the right
- Point out the two existing medications: Metformin 500mg and Lisinopril 10mg

**Presenter says:**
> "Bob has two medications he's been taking — Metformin for his diabetes and Lisinopril for his blood pressure. He just got back from a doctor visit where his doctor made some changes. Let's see how he'd use AdherePod to update his list."

---

### Part 2 — Start a Voice Conversation (15 seconds)

- Click **"Talk to AdherePod"** button
- Camera activates automatically (shows live feed on the right)
- Bot animates to listening state
- AdherePod greets the user

**Wait for the greeting.** AdherePod will say something like:
> "Hi there! I'm AdherePod, your medication assistant. I can see you through your camera — feel free to hold up any pill bottles or prescriptions and I'll read them for you. How can I help you today?"

---

### Part 3 — Review Existing Medications (30 seconds)

**Say to AdherePod:**
> "Hi, can you tell me what medications I'm currently taking?"

AdherePod will call the `list_medications` tool and read back:
> "You're currently taking two medications. First, Metformin 500mg, twice a day with breakfast and dinner for Type 2 Diabetes. Second, Lisinopril 10mg, once a day every morning for blood pressure."

**Presenter aside to audience:**
> "Notice how the bot reads back each medication clearly with the dosage and schedule. The transcript on screen also shows everything being said, so Bob can follow along visually too."

---

### Part 4 — Update an Existing Medication (45 seconds)

**Say to AdherePod:**
> "I just saw my doctor today and she said I need to increase my Metformin from 500 milligrams to 1000 milligrams. Can you update that for me?"

AdherePod will confirm and call `edit_medication`:
> "Got it — so your doctor wants to increase your Metformin from 500mg to 1000mg, still twice a day with meals. Let me update that for you... Done! Your Metformin is now updated to 1000mg twice daily. Is there anything else?"

**Point out to audience:**
- The medication list on the left side of the dashboard refreshes automatically
- Metformin now shows 1000mg instead of 500mg
- The transcript shows the full exchange

---

### Part 5 — Camera Capture: Hold Up a Prescription (60 seconds)

**Say to AdherePod:**
> "Yes, my doctor also gave me a new prescription. Let me show it to you."

**Hold the printed prescription up to the camera.** Hold it steady for about 10 seconds.

**What happens automatically:**
1. The camera captures a frame every 5 seconds
2. Gemini 3 Flash describes the image — detects it contains medication info
3. The description with all readable text is injected into the agent's context
4. A yellow "Image Detected" card appears in the transcript with the extracted info
5. AdherePod sees the extraction and responds verbally

AdherePod will say something like:
> "I can see a prescription from Dr. Chen. It looks like it says Atorvastatin 20mg, take one tablet at bedtime. It also mentions increasing your Metformin to 1000mg, which we already took care of. Would you like me to add the Atorvastatin to your medication list?"

**Say:**
> "Yes, please add that."

AdherePod calls `add_medication`:
> "Done! I've added Atorvastatin 20mg, once daily at bedtime. Your medication list now has three medications."

**Point out to audience:**
- The medication list updates again — now shows three medications
- The camera read the prescription automatically without any buttons or manual steps
- The bot confirmed what it read before making changes

---

### Part 6 — Ask About Drug Interactions (45 seconds)

**Say to AdherePod:**
> "Now that I'm taking three medications, is there anything I should be aware of? Do any of these drugs interact with each other?"

AdherePod will provide guidance (powered by GPT-4o-mini's medical knowledge):
> "Good question, Bob. Here's what you should know about your three medications together. Metformin and Lisinopril are commonly prescribed together and generally work well as a combination. Lisinopril can actually help protect your kidneys, which is beneficial since diabetes can affect kidney function. With Atorvastatin, the main thing to be aware of is to take it at bedtime since it works best overnight. Also, let your doctor know if you experience any muscle pain or weakness, as that can occasionally happen with statins. There are no major interactions between these three medications, but always take them as directed. Is there anything else you'd like to know?"

**Presenter aside to audience:**
> "AdherePod gives practical, easy-to-understand advice. It doesn't replace a doctor, but it helps patients understand their medications and know what to watch out for."

---

### Part 7 — Wrap Up (15 seconds)

**Say to AdherePod:**
> "No, that's all. Thank you!"

AdherePod will respond warmly and sign off.

Click **"End Call"** to disconnect.

**Presenter says:**
> "In under three minutes, Bob reviewed his medications, updated a dosage change from his doctor, added a brand new prescription just by holding it up to the camera, and got advice about how his medications work together — all through a natural voice conversation."

---

## Key Points to Emphasize

1. **Voice-first** — No typing required. The entire interaction was spoken.
2. **Camera reads prescriptions** — Hold up a pill bottle or prescription and it's automatically recognized. No buttons to press, no photos to take manually.
3. **Confirms before acting** — The bot always reads back what it understood and asks for confirmation before making changes.
4. **Real-time updates** — The medication list on the dashboard updates live as changes are made.
5. **Conversation history** — Everything is transcribed and saved. Bob or his caregiver can review the conversation later in the History tab.
6. **Drug interaction advice** — Patients can ask questions about their medications and get clear, simple explanations.

## Timing

The core demo (Parts 2-7) runs about 3-4 minutes. With the intro and audience commentary, budget about 5 minutes total.

## Troubleshooting

- **Camera not showing?** Make sure the browser has camera permissions. Chrome will prompt on first use.
- **Bot not responding?** Check that the microphone is allowed in the browser. The bot needs to hear you.
- **Prescription not detected?** Hold the paper steady, well-lit, and fill the camera frame. The system captures every 5 seconds, so hold it for at least 5-10 seconds.
- **Medications list not updating?** The list refreshes after each tool call. Give it a second after AdherePod confirms the action.
