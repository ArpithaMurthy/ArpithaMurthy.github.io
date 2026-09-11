# Recording guide: Ticketing and Reservation Systems

Target length: 7 to 9 minutes
Speaking pace: 125 to 140 words per minute
Format: screen recording with your narration

Text in **bold** is a production cue and should not be spoken.

## Before recording

1. Open the article and the reservation experiment in separate browser tabs.
2. Start the complete experiment from the `system-design-experiments` repository with `docker compose up --build`.
3. Open `http://localhost:3001/#reservations` and keep the runtime in API mode. Keep the agent in Mock mode; it needs no account, API key, or model.
4. Set browser zoom to 100 percent and close unrelated tabs and notifications.
5. Reload the experiment immediately before the demo so all seats are available.
6. Run `npm test` once and keep the successful result ready for the final demo section.

## Narration and screen plan

### Opening

**ON SCREEN: Article title, then the reservation system diagram.**

When I book a seat, a room, or an appointment, the experience looks simple. I search, choose an option, pay, and receive a confirmation.

But behind that short journey is a difficult system-design problem. Many people may try to claim the same limited inventory at the same time. The system has to decide who can hold it, who owns it, and what happens when payment or another dependency fails.

In this video, I will walk through the main design decisions behind a reservation system. Then I will use a small working prototype to show how an authoritative hold, a price limit, and human approval can work together.

### Define the inventory

**ON SCREEN: Highlight the article state transition: Available, Held, Confirmed, Used.**

The first question is: what exactly is the inventory?

It could be a named seat, a room, a table, an appointment slot, or a capacity bucket. Availability is not only a number. It is derived from state.

An item may begin as available. A customer can place a temporary hold on it. That hold may become a confirmed reservation, or it may expire and return the item to the available pool.

These transitions need explicit rules. Who can create a hold? How long does it last? Can a cancellation return the inventory to sale? Which state is authoritative?

Without clear answers, two parts of the system can disagree about whether the same item is still available.

### Separate discovery from commitment

**ON SCREEN: Show the reference architecture. Point to search, cache, and the authoritative inventory boundary.**

Search and purchase have different consistency needs.

Search can use a cache or an index because customers need fast browsing. A result may be slightly stale, as long as the system checks it again before making a commitment.

The final hold and confirmation must pass through one authoritative inventory boundary. This is where a database transaction, conditional write, or serialized allocation can prevent two customers from owning the same unit.

The important rule is that a cache may suggest availability, but it cannot promise ownership.

### Why temporary holds exist

**ON SCREEN: Show the implementation diagram, then return to the article section about holds.**

A temporary hold balances fairness with enough time to complete checkout.

The hold needs a stable identifier and a server-controlled expiry time. The browser can display a countdown, but the browser clock should not decide whether the hold is valid.

Retries also matter. If a request times out, the customer may send it again. An idempotency key allows the system to return the original result instead of creating a second hold or charging twice.

### Prototype: reject an impossible request

**ON SCREEN: Open `http://localhost:3001/#reservations`. Keep API runtime and Mock agent selected. Enter your name. Set Maximum total to 35.**

This prototype is deliberately small. The seat map represents authoritative inventory state. The panel on the right represents a bounded request made through an agent.

I will first set the maximum total to thirty-five dollars. Every available seat costs more than that.

**ACTION: Select Find a seat. Pause on the rejection message.**

The agent cannot simply ignore the limit and choose something more expensive. Ordinary code checks the available seats and the delegated price before showing a proposal.

This is an important boundary for AI-assisted products. A model may suggest an action, but deterministic rules should still enforce price, permission, availability, and other important constraints.

### Prototype: hold and confirm a seat

**ACTION: Change Maximum total to 50, then select Find a seat. Pause on the proposal.**

With a fifty-dollar limit, the prototype proposes the least expensive eligible seat. At this point, it is only a proposal. The inventory has not changed yet.

**ACTION: Select Approve hold. Point to the held seat and the audit event.**

Now the inventory service creates a five-minute hold using the database clock. The seat changes from available to held, and the durable action appears in the PostgreSQL-backed audit history.

The purchase still needs explicit approval.

**ACTION: Select Confirm purchase without checking the approval box. Pause on the error and audit event.**

When I try to confirm without approval, the engine blocks the action. The seat remains held. A failed action does not silently become a successful purchase.

**ACTION: Check “I approve this purchase,” then select Confirm purchase. Point to the confirmed seat and audit history.**

After explicit approval, the seat becomes confirmed. The event history records both the blocked attempt and the successful reservation.

### Verify the rules with tests

**ON SCREEN: Show the terminal and run `npm test`. Slowly highlight the four reservation tests.**

The interface demonstrates one customer journey, but concurrency and retries also need executable tests.

These tests verify four important rules: two customers cannot hold the same seat, retrying the same request returns the original hold, an expired hold returns its inventory, and an agent cannot confirm a purchase without human approval.

This prototype is not a production booking or payment system. Its purpose is to make a few architectural claims visible and testable.

### Payment and failure recovery

**ON SCREEN: Return to the article and show Browse, Select, Revalidate, Hold, Pay, Confirm.**

In a real product, payment success and reservation success are separate states.

A payment provider may approve a charge while reservation confirmation times out. The reservation may also succeed while the response is lost. The workflow needs durable states, provider references, idempotent retries, compensation, and reconciliation.

A customer should not be left with only a spinner. There should be a stable place to check the booking status and a clear recovery path when the result is uncertain.

### Traffic, fairness, and accessibility

**ON SCREEN: Scroll through the traffic and accessibility sections.**

Popular releases also attract synchronized traffic, bots, scraping, and attempts to bypass limits.

Waiting rooms, admission tokens, gradual inventory release, and account-level limits can help. But they must apply across every purchase path. A queue that can be skipped through another endpoint is not a real fairness control.

Accessibility is also part of inventory design. Accessible seats, companion places, and accommodation needs must be represented accurately. They should not disappear because the main data model treated them as an afterthought.

### Closing

**ON SCREEN: Show the article conclusion, then the GitHub repository.**

What I want to remember is that reservation systems are concurrency systems wrapped in a customer journey.

Trust comes from one authoritative inventory decision, fair access, transparent terms, and a recoverable answer when payment or confirmation becomes uncertain.

The prototype is available in my System Design Experiments repository. It runs either as a containerized API with PostgreSQL or in free offline mode, and the code and tests are available to change and explore.

## Suggested YouTube chapters

Adjust these timestamps after recording.

```text
00:00 Why reservations are difficult
00:38 Defining inventory and state
01:35 Search versus authoritative commitment
02:25 Temporary holds and idempotency
03:20 Demo: enforcing a price limit
04:08 Demo: holding and confirming a seat
05:35 Testing concurrency and retries
06:18 Payment failure and reconciliation
07:10 Traffic, fairness, and accessibility
08:00 What I want to remember
```

## Suggested video details

Title: `How Ticketing and Reservation Systems Prevent Double Booking`

Description:

```text
How does a reservation system stop two people from booking the same seat?

I explore inventory state, temporary holds, authoritative writes, idempotency, payment reconciliation, traffic fairness, and bounded AI-agent actions. The video includes a working local prototype and executable tests.

Article: https://arpithamurthy.github.io/articles/exploring-ticketing-and-reservation-systems/
Code: https://github.com/ArpithaMurthy/system-design-experiments#reservations
```

## Recording setup

Use any microphone you already own before buying equipment. A phone microphone in a quiet, soft-furnished room can sound better than an expensive microphone in an echoing room.

1. Record with free software such as Audacity or Windows Sound Recorder.
2. Place the microphone about 15 to 20 centimetres from your mouth and slightly to one side.
3. Record in mono at 48 kHz. Keep the original as WAV if available.
4. Speak slightly slower than normal conversation and pause between sections.
5. Record one section at a time. You do not need one perfect continuous take.
6. Leave two seconds of silence at the beginning for noise cleanup.
7. Keep peaks near -12 to -6 dB and avoid reaching 0 dB.
8. Export the final narration as MP3 at 160 or 192 kbps.

Suggested filename: `exploring-ticketing-and-reservation-systems.mp3`

## Final recording checklist

- Notifications are disabled.
- Browser text is readable at 1080p.
- No private information is visible.
- The prototype begins with all seats available.
- API runtime and Mock agent mode are selected.
- The failed approval and successful confirmation are both demonstrated.
- `npm test` passes before it appears on screen.
- The recording has no clipping, long silence, or distracting background noise.
- The final audio file is saved separately from the screen recording.

The article itself can be used as the accessible transcript. After the narration is recorded, create timed `.vtt` captions from the final audio rather than from these estimated chapter times.