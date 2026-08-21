# Exploring Travel and Mobility Systems

Ride booking, transit, flight, hotel, and vehicle rental products coordinate people and physical resources while location, price, and availability keep changing. Their difficult work is not drawing a route on a map. It is making a dependable promise from incomplete live information.

## Model the journey as a state machine

A ride may move through requested, matched, accepted, arriving, in progress, completed, cancelled, and disputed states. Flights, rooms, and rentals have different states, but the same principle applies: transitions need owners, rules, timestamps, and recovery paths.

```text
Request → Match → Confirm → Serve → Complete → Settle
             ↓         ↓        ↓
          Timeout   Cancel   Support
```

The backend must reject impossible transitions even when requests arrive late, twice, or out of order.

## A reference architecture

Travel systems vary across rides, public transit, flights, rooms, and rentals. Common boundaries include:

<div class="article-diagram">
  <img src="/images/diagrams/travel-and-mobility-systems-reference.svg" alt="Reference architecture for Exploring Travel and Mobility Systems">
</div>

Search and estimates may use recent copies, but price, availability, identity, and journey state must be checked again before commitment. External providers remain responsible for some inventory and service outcomes, so adapters and reconciliation are part of the transaction path.

## One possible implementation

Traveler and provider apps could use [React Native](https://reactnative.dev/docs/getting-started), with [Kotlin](https://kotlinlang.org/docs/home.html) and [Spring Boot](https://docs.spring.io/spring-boot/) services managing journey state and booking workflows. [PostgreSQL](https://www.postgresql.org/docs/) with [PostGIS](https://postgis.net/documentation/) can support transactional and geographic data, [Redis](https://redis.io/docs/latest/) can hold short-lived location and matching state, and [Apache Kafka](https://kafka.apache.org/documentation/) can carry journey and provider events.

<div class="article-diagram">
  <img src="/images/diagrams/travel-and-mobility-systems-implementation.svg" alt="One possible implementation for Exploring Travel and Mobility Systems">
</div>

[OR-Tools](https://developers.google.com/optimization) can provide a foundation for routing and assignment, while provider adapters should expose stable internal contracts. Update frequency, regional latency, battery cost, safety, and external inventory authority should shape separate designs for live mobility and advance travel booking.

## Location is useful, noisy, and sensitive

GPS readings drift, arrive late, disappear indoors, and consume battery. The system needs a policy for freshness, accuracy, sampling, smoothing, <abbr title="Aligning noisy location readings with the most likely road, route, or path">map matching</abbr>, and fallback.

Location data can reveal homes, workplaces, routines, and relationships. Collection should be limited to the journey, protected in transit and storage, retained only as needed, and hidden from people who do not need exact coordinates.

## Matching is a changing optimization problem

Dispatch can consider distance, estimated arrival, vehicle type, capacity, driver state, accessibility, traffic, fairness, and marketplace balance. The nearest provider is not always the best assignment.

The result must survive concurrent requests and stale positions. A short reservation, version check, or <abbr title="An update that succeeds only if a stored value still matches the version previously read">compare and set operation</abbr> can prevent one resource from being promised twice. Timeouts return abandoned assignments to the pool.

## Estimates must admit uncertainty

Arrival time, route, fare, room availability, and connection risk are predictions. The interface should distinguish an estimate from a guarantee and update it when conditions change.

Useful quality measures include prediction error by geography and time, not only global averages. A model that works downtown but repeatedly fails in areas with less traffic creates an uneven product.

## Pricing and payment need explainable rules

The system should record the inputs and version of the pricing rule used for a quote. Taxes, tolls, cancellation fees, promotions, tips, deposits, currency conversion, and adjustments after the journey need explicit treatment.

Payment authorization, capture, refunds, provider payouts, and reconciliation form a workflow of their own. Idempotency prevents a retry from charging twice.

## Live demand is geographically uneven

Demand clusters around airports, stations, events, weather, and commuting hours. Partitioning by geography helps, but borders create searches across regions and moving resources change partitions.

The system needs bounded search, <abbr title="Slowing or rejecting new work when downstream components cannot keep up">backpressure</abbr>, rate limits, and deliberate reduction of service. When live updates fail, it may show a less precise location, widen refresh intervals, or move communication to a fallback channel rather than invent certainty.

## Safety is part of the architecture

Identity verification, masked communication, emergency assistance, trip sharing, anomaly detection, enforcement between blocked parties, and support escalation must work across every channel.

Safety controls need protection from misuse as well. Reports require evidence, privacy, human review, appeals, and careful access by support staff.

## External providers will fail differently

Maps, traffic, airlines, hotels, payment processors, messaging systems, and identity providers have distinct rate limits and consistency. Adapters should isolate their contracts. Timeouts, <abbr title="Controls that temporarily stop calls to a failing dependency so the rest of the system can recover">circuit breakers</abbr>, caching, and fallback providers can contain failures, but stale travel information must be clearly labelled.

## What changes with AI agents

An agent could compare routes, prepare an itinerary, request an accessible vehicle, or rebook after a disruption. It may reduce navigation across several providers, but the underlying reservations and payments still require deterministic contracts.

The agent should carry bounded preferences and delegated authority. A change in destination, price, cancellation fee, travel date, or passenger identity may require confirmation. The user needs a receipt that names what was booked, with whom, at what price, and under which cancellation rules.

An agent is especially useful during disruption, when it can gather alternatives. It is also risky then because inventory changes quickly. Offers need expiry times, and the backend must revalidate price and availability at commitment.

## Questions I am wondering about

1. What are the authoritative states and legal transitions for a journey?
2. How fresh and accurate must location be for each decision?
3. How does matching avoid duplicate assignment and systematic unfairness?
4. Which estimates are shown, and how is prediction error measured?
5. How are quotes, changes, charges, payouts, and refunds explained?
6. What happens during geographic spikes or provider failures?
7. How are safety reports protected, reviewed, and appealed?
8. Which agent actions require renewed availability, price, or human confirmation?

## What I want to remember

Mobility systems turn uncertain physical conditions into a promise. Good design preserves state, privacy, safety, and user control when location changes, providers fail, and estimates turn out to be wrong.