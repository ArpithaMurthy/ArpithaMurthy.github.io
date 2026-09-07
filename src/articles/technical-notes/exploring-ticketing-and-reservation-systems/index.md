# Exploring Ticketing and Reservation Systems

Ticketing and reservation products sell access to something scarce: a seat, room, table, appointment, permit, or time slot. The central design problem is deciding who may hold or own inventory while many people compete for it.

## Define the inventory precisely

Inventory may be a named seat, a capacity bucket, a provider's time, or a resource with several constraints. Availability is derived from state, not a static number.

```text
Available → Held → Confirmed → Used
              ↓         ↓
           Expired   Cancelled → Available or blocked
```

The rules should explain when inventory enters and leaves each state, who may change it, and whether a cancellation can return it to sale.

## A reference architecture

Reservation systems vary by inventory type and provider. Common boundaries include:

<div class="article-diagram">
  <img src="/images/diagrams/ticketing-and-reservation-systems-reference.svg" alt="Reference architecture for Exploring Ticketing and Reservation Systems">
</div>

Search can use cached availability, but holds and confirmations must pass through one authoritative inventory boundary. Payment success and reservation success remain separate states until reconciliation proves both.

## One possible implementation

A reservation product could use [React](https://react.dev/) for customer and operator interfaces, [Go](https://go.dev/doc/) for inventory APIs, and [PostgreSQL](https://www.postgresql.org/docs/) constraints and transactions for authoritative holds and confirmations. [Redis](https://redis.io/docs/latest/) can support rate limits, waiting-room tokens, and cached search results, but it should not become the final inventory record.

<div class="article-diagram">
  <img src="/images/diagrams/ticketing-and-reservation-systems-implementation.svg" alt="One possible implementation for Exploring Ticketing and Reservation Systems">
</div>

[Apache Kafka](https://kafka.apache.org/documentation/) can distribute confirmed booking events, while a provider such as [Stripe](https://docs.stripe.com/) can handle payment collection with explicit reconciliation. Inventory shape, contention, fairness policy, and provider callbacks should determine whether allocation uses row locking, conditional writes, or serialized processing.

## Holds balance fairness and conversion

A temporary hold gives someone time to review and pay without allowing indefinite reservation. It needs an expiry controlled by the server, stable identifier, and <abbr title="A reservation update that succeeds completely for one requester or does not happen at all">atomic claim</abbr> on inventory.

The interface should show the remaining time without pretending the browser clock is authoritative. Expired holds must be released reliably, and delayed payment callbacks need a policy when the original inventory is no longer available.

## Prevent overselling with one authoritative write path

Caches and search indexes can display availability, but confirmation must pass through the authoritative inventory boundary. Database constraints, conditional writes, or serialized allocation protect the final unit under concurrency.

For general admission, controlled overselling may be a business policy. It should be explicit, measurable, and paired with a recovery plan rather than emerging from a race condition.

## Traffic can become adversarial

Popular releases create synchronized spikes, bots, scraping, credential abuse, and attempts to bypass queues or limits.

<abbr title="A controlled queue that limits how many customers may enter a busy purchase flow at once">Virtual waiting rooms</abbr>, admission tokens, limits for each account, device and behavior signals, rate limits, CAPTCHA used selectively, and gradual inventory release can protect the system. Fairness claims need clear rules and measurement. A queue that can be skipped through another endpoint is only theatre.

## Search and purchase need different consistency

Search results can tolerate brief staleness if the product clearly revalidates before commitment. Checkout cannot rely on a cached promise.

```text
Browse cached options → Select → Revalidate → Hold → Pay → Confirm
```

Price, fees, restrictions, accessibility information, and cancellation terms should be returned with the held inventory so the final confirmation is based on one coherent offer.

## Payment is not the same as confirmation

Payment authorization can succeed while reservation confirmation times out, or confirmation can succeed while the response is lost. The workflow needs idempotency, durable states, provider references, retries, <abbr title="A corrective action such as releasing inventory or refunding payment when a later workflow step fails">compensation</abbr>, and reconciliation.

A user should never be left with only a spinner. They need a stable place to check whether the reservation exists and what to do when the state is uncertain.

## Changes and cancellations are complete journeys

Real products need transfers, exchanges, partial cancellation, rescheduling, waitlists, rules for missed reservations, refunds, credits, and changes initiated by providers.

Each operation affects inventory and money. The system should preserve history and use new events or adjustments rather than rewriting the original booking.

## Accessibility is inventory data

Accessible seats, companion places, wheelchair spaces, sensory accommodations, and appointment needs must be represented accurately and protected from casual removal. The booking flow should not force a person to call merely because the main interface omitted required attributes.

## What changes with AI agents

An agent could watch for availability, compare restrictions, coordinate a group, or prepare a booking. Without controls, thousands of agents could also poll continuously and create a new kind of bot traffic.

Availability for automated clients should use quotas, subscriptions, or change notifications rather than unlimited polling. Offers need expirations. The agent should present the exact date, place, seat or resource, total price, restrictions, and cancellation terms before commitment.

Purchases, destructive cancellations, and expensive changes deserve explicit confirmation. Delegated limits can constrain date ranges, venues, quantity, accessibility needs, and maximum total cost.

## Try the reservation experiment

The [reservation agent lab](https://github.com/ArpithaMurthy/system-design-experiments#reservations) turns several ideas from this note into a small application that can be cloned and changed locally. It demonstrates authoritative seat holds, idempotent requests, expiry, deterministic agent limits, explicit purchase approval, and audit history.

Mock mode works without an account, API key, paid service, or model download. An optional Ollama mode can use a local model while ordinary code continues to enforce availability and price limits.

## Questions I am wondering about

1. What exactly is inventory, and which system owns it?
2. How are holds created, expired, and recovered after failure?
3. What prevents two confirmations for the same unit?
4. Which data may be stale during search, and what is revalidated?
5. How do the queue and purchase limits remain fair across channels?
6. How are uncertain payment and confirmation states reconciled?
7. What are the full change, cancellation, refund, and waitlist journeys?
8. How are automated clients prevented from exhausting inventory or capacity?

## What I want to remember

Reservation systems are concurrency systems wrapped in a customer journey. Trust comes from fair access, an authoritative inventory decision, transparent terms, and a recoverable answer when payment or confirmation is uncertain.