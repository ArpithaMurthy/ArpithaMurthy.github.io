# Exploring Complex Web Apps: Security, Quality, and Scale

Complex web apps such as commerce platforms, social networks, and streaming products combine valuable data, many user journeys, distributed systems, and continuous change. These are the questions engineers need to make explicit before architecture becomes difficult to reverse.

## Complexity comes from consequences and interactions

A product becomes complex when several concerns must be correct at the same time.

1. Many users and teams change the system concurrently.
2. Workflows cross services, data stores, regions, or external providers.
3. Money, identity, private information, rights, or safety are involved.
4. Traffic is large, uneven, or difficult to predict.
5. The product must remain available while it changes.
6. A local decision can create cost or failure across the system.

The number of microservices is not a useful definition of complexity. A modular monolith with payments and personal data can be complex. A collection of small services can be unnecessarily complicated.

```text
Users + Data + Risk + Scale + Change + Ownership → System complexity
```

## Frame the product before framing the system

Architecture starts with the user journeys and business invariants that cannot be compromised.

For commerce, the critical path may be discover product, price order, reserve inventory, pay, fulfill, refund, and reconcile. For social media, it may be create, distribute, rank, moderate, and delete content. For streaming, it may be ingest, encode, protect, discover, authorize, and deliver media.

I want requirements in four groups:

1. **Functional:** What can each actor do?
2. **Quality attributes:** What must be fast, available, consistent, private, or durable?
3. **Constraints:** Which regulations, providers, deadlines, skills, and existing systems shape the solution?
4. **Evolution:** Which capabilities and traffic patterns are likely to change?

Priorities matter because not every journey needs the same guarantees. Browsing can often tolerate stale data. Charging a card or enforcing access rights usually cannot.

## Name invariants and failure consequences

An invariant is a rule that must remain true even under retries, concurrency, partial failure, and delayed messages.

Examples include:

1. An accepted payment is linked to exactly one durable order intent.
2. Inventory cannot silently become negative beyond an agreed policy.
3. A blocked user cannot access content through another path.
4. A deleted account is removed from required systems within the promised period.
5. A viewer receives only media they are entitled to watch.

These rules guide transaction boundaries, idempotency, authorization, reconciliation, and testing. I prefer to write them before drawing service boxes.

## Quantify scale and reliability

Words such as global, real time, and highly available need numbers.

I want rough estimates for active users, requests per second, the ratio between reads and writes, object size, media bitrate, storage growth, retention, geographic distribution, and the ratio between peak and average traffic. Product events can be highly skewed: a sale, viral post, live match, or new episode may create the actual design load.

Service level indicators measure what users experience. Service level objectives state the target. <abbr title="The amount of unreliability a service can tolerate while still meeting its reliability objective">Error budgets</abbr> help balance feature delivery and reliability work.

```text
User journey → SLI → SLO → Error budget → Engineering priority
```

Availability should be defined per journey, not as one number for the entire company. Recovery time objective and recovery point objective make disaster expectations concrete.

## Choose architecture around boundaries and change

The first question is not monolith or microservices. It is where responsibilities, data ownership, and independent change belong.

A modular monolith can provide strong transactions and simple operations while the domain is still forming. Services become useful when teams need independent ownership, workloads scale differently, or a boundary has distinct reliability and security needs.

Every remote call adds latency, partial failure, versioning, observability, and coordination. A useful boundary has:

1. A clear business responsibility.
2. An owner with operational accountability.
3. Explicit APIs or events.
4. Authority over its data and invariants.
5. A reason to change or scale independently.

Architecture decision records should capture important choices, alternatives, consequences, and conditions that would cause the decision to be revisited.

## One possible implementation

A balanced starting point could use [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/docs/) for the browser application, a modular [ASP.NET Core](https://learn.microsoft.com/aspnet/core/) backend, and [PostgreSQL](https://www.postgresql.org/docs/) as the transactional default. [Redis](https://redis.io/docs/latest/) can serve bounded caching and coordination needs, while [Apache Kafka](https://kafka.apache.org/documentation/) should enter only when durable asynchronous streams solve a measured problem.

<div class="article-diagram">
  <img src="/images/diagrams/a-complex-web-app-for-security-quality-and-scale-implementation.svg" alt="One possible implementation for Exploring Complex Web Apps: Security, Quality, and Scale">
</div>

[OpenTelemetry](https://opentelemetry.io/docs/) can establish traces, metrics, and logs across the initial architecture. [Terraform](https://developer.hashicorp.com/terraform/docs) and [Kubernetes](https://kubernetes.io/docs/) may help once infrastructure scale and deployment ownership justify them, but neither is a prerequisite for a secure, reliable application.

## Model the domain and its data deliberately

Data models should begin with business concepts, invariants, access patterns, and lifecycle.

Relational stores are strong defaults for transactions and relationships. Key value, document, graph, search, time series, and object stores solve different access patterns. <abbr title="Using several types of database because different data and access patterns need different storage models">Polyglot storage</abbr> can be valuable, but every additional system adds expertise, backup, security, migration, and incident costs.

For each data set, I want to know:

1. Which domain owns the authoritative record?
2. Which copies are derived, cached, indexed, or analytical?
3. What consistency does each journey require?
4. How is data partitioned, replicated, retained, archived, and deleted?
5. How will the schema evolve without stopping traffic?
6. How are corrupt or divergent records detected and repaired?

Indexes improve reads but increase write and storage cost. <abbr title="A field used to decide which database partition stores a record">Partition keys</abbr> need enough distinct values and must avoid hot tenants, popular creators, trending products, or hotspots tied to time.

## Make consistency a product decision

Strong consistency, <abbr title="A model where copies may temporarily differ but converge after updates finish propagating">eventual consistency</abbr>, behavior that lets users see their own recent writes, and causal ordering create different user experiences.

A product page can show slightly stale review counts. Checkout needs a deliberate policy when price or inventory changes. A social feed can converge asynchronously, while privacy settings may require immediate enforcement. Streaming progress may tolerate delayed synchronization, but access revocation may not.

Distributed workflows need explicit patterns. Local transactions protect one boundary. <abbr title="Workflows that coordinate transactions across services and use corrective actions when a later step fails">Sagas</abbr> coordinate several steps with compensating actions. A <abbr title="A database table written in the same transaction as business data, then used to publish events reliably">transactional outbox</abbr> publishes events without losing the relationship to the committed state. Reconciliation finds what retries and automation could not resolve.

```text
Command → Local transaction + Outbox → Event → Next boundary
                      ↓ failure                  ↓ failure
                  rollback                 retry or reconcile
```

Claims of exactly once processing should be treated carefully. Idempotent operations, deduplication keys, durable state transitions, and observable reconciliation are usually more practical guarantees.

## Design APIs as contracts that last

APIs need explicit authentication, authorization, validation, errors, pagination, filtering, limits, timeouts, idempotency, and compatibility rules.

Public, mobile, partner, and internal clients evolve at different speeds. Additive changes are easier to adopt than breaking changes. Contract tests based on consumer expectations can catch accidental incompatibility. Deprecation requires usage visibility, communication, and a removal plan.

GraphQL, REST, RPC, and events each have useful contexts. The protocol matters less than bounded work, clear ownership, predictable failure behavior, and a contract that clients can safely depend on.

## Build security into every layer

Security begins with a threat model: assets, actors, trust boundaries, likely attacks, and consequences.

The baseline includes:

1. Strong identity, secure session handling, and appropriate multifactor authentication.
2. Authorization on the server for every protected action and object.
3. Access limited to required permissions for people, services, infrastructure, and pipelines.
4. Input validation, output encoding, safe file handling, and injection prevention.
5. Protection against cross site scripting, request forgery, server side request forgery, credential stuffing, and automated abuse.
6. Encryption in transit and at rest, with managed key rotation.
7. Secrets stored outside code and rotated without broad downtime.
8. Dependency, container, infrastructure, and software supply chain scanning.
9. Audit trails that resist tampering for sensitive actions.
10. Incident response, credential revocation, and forensic readiness.

Authorization should follow the resource and action, not only a role name. Systems shared by many tenants need strong isolation in APIs, queries, caches, jobs, logs, and administrative tools.

## Treat privacy and compliance as architecture

Personal data needs classification, purpose, consent where required, retention limits, deletion, export, and access controls. Data lineage helps answer where information came from and where it was copied.

Regional requirements may affect storage location, transfer, payment handling, age protections, accessibility, media rights, and record retention. Compliance scope should be reduced where possible. For example, using a payment provider's hosted fields can keep raw card details away from the application.

Logs, analytics, backups, search indexes, caches, and training data are still copies of data. Deletion and access policies must reach them too.

## Plan capacity for peaks, skew, and growth

Capacity planning must account for peaks as well as averages. I want to estimate peak concurrency, work multiplied across dependencies, bandwidth, storage, database connections, queue depth, cache memory, and the slowest downstream dependency.

Horizontal scaling works best for stateless compute. Stateful systems need partitioning, replication, rebalancing, and a plan for hot keys. Autoscaling needs a signal that represents pressure early enough to act. CPU alone may miss queue growth, connection exhaustion, or dependency latency.

Load tests should model realistic mixes and skew. A celebrity post, limited product, or popular stream can concentrate demand even when total capacity looks sufficient.

## Use caching and CDNs with a freshness contract

CDNs and caches reduce latency, bandwidth, and origin load. They also create copies that can become stale or expose data under the wrong key.

For each cache, I want an answer for key design, tenant and authorization boundaries, expiration, invalidation, stampede protection, negative caching, fallback, and observability.

Commerce caches must respect price, promotion, and inventory rules. Social caches need invalidation that preserves privacy. Streaming systems often use multiple CDN providers, origin shielding, tokenized URLs, and regional traffic steering.

## Design asynchronous work for overload and repair

Queues and event streams decouple producers, absorb bursts, and let consumers scale independently. They also introduce delay, duplicates, ordering, poison messages, schema evolution, and replay concerns.

The design should define:

1. Partition and ordering guarantees.
2. Retry policy with backoff and jitter.
3. Idempotent consumers and deduplication windows.
4. Handling for messages that repeatedly fail and a safe replay process.
5. Backpressure, queue limits, and load shedding.
6. Event schema ownership and compatibility.
7. Monitoring for lag, age, throughput, and failure.

A queue can absorb a burst, but it cannot solve permanent overload. Admission control and product degradation are still needed.

## Expect dependencies to fail

Timeouts should be shorter than the caller's remaining latency budget. Retries need limits because synchronized retries can multiply an outage. Circuit breakers, bulkheads, concurrency limits, and rate limits contain failure.

Graceful degradation should be a product decision. A commerce site might keep browsing available while recommendations are down. A social app might show a chronological feed when ranking is unavailable. A streaming app might lower bitrate or switch CDN while preserving playback.

```text
Dependency fails → Contain → Degrade → Recover → Reconcile
```

Fallbacks must be tested. An unused fallback is only an assumption.

## Engineer the frontend as a system

Large frontends need boundaries for routes, features, shared components, data access, state, permissions, and experiments. A design system provides accessible primitives and consistent interaction, but it also needs governance and versioning.

Server rendering, static generation, client rendering, and streaming rendering trade server cost, cacheability, personalization, and interaction speed. The choice can vary by route.

Frontend performance work includes bundle budgets, code splitting, image and media strategy, rendering stability, request waterfalls, long tasks, memory use, and behavior on slower devices. Monitoring from actual users is more representative than a fast development laptop.

Offline behavior, optimistic updates, conflict handling, localization, time zones, currency, layouts that read from right to left, and accessibility become architectural concerns when they affect shared components and data contracts.

## Make quality a layered system

Quality is not achieved by maximizing test count. I want fast checks close to the code and fewer broad tests around critical journeys.

1. Unit tests protect business rules and transformations.
2. Component tests protect UI behavior and accessibility.
3. Integration tests protect database, queue, cache, and provider interactions.
4. Contract tests protect service and client compatibility.
5. Tests across the full system protect a small set of journeys with serious consequences.
6. Load, soak, and stress tests reveal capacity and leak behavior.
7. Security tests cover permissions, abuse cases, and dependency risk.
8. Resilience tests verify timeouts, retries, failover, and degradation.
9. Data quality checks detect missing, delayed, duplicated, or invalid records.

Test environments need representative configuration and data without copying sensitive production information carelessly. Flaky tests should be treated as defects because they train teams to ignore evidence.

## Observe user journeys, not only machines

Logs, metrics, traces, profiles, audit events, and measurements from actual users should connect a symptom visible to a user to the responsible component.

Good observability includes correlation identifiers, structured events, consistent service metadata, dependency timing, queue age, saturation, and business outcomes. Data with many distinct values needs cost and privacy controls.

Dashboards should begin with critical journeys and SLOs. Alerts should be actionable, owned, deduplicated, and tied to runbooks. A technically healthy service can still produce failed checkouts or stalled playback, so business and system signals need to be read together.

## Release without making every change a launch event

Continuous delivery needs reproducible builds, protected pipelines, artifact provenance, environment promotion, and deployment credentials limited to required permissions.

Feature flags separate deployment from exposure. Canary releases, gradual rollouts, and automated health checks reduce blast radius. Flags need owners and removal dates so they do not become permanent branches in production.

Database and event changes should use migrations that expand compatibility before removing the old form:

```text
Add compatible shape → Deploy readers and writers → Backfill → Remove old shape
```

Rollback is not always possible after data changes. Plans to move forward with a repair and reconciliation are equally important.

## Prepare for incidents and disasters

Backups matter only when restore is tested. Designs across zones or regions need an explicit failover mode, expectation for data loss, routing plan, and procedure for returning to normal.

Incident readiness includes severity definitions, assigned responders, runbooks, communication channels, status updates, and access to the tools needed under pressure. Reviews after an incident should improve the system and its conditions rather than search for one person to blame.

Game days and controlled fault experiments reveal hidden dependencies before a real outage does.

## Include abuse, fraud, and safety in the product model

Complex consumer systems attract behavior that normal functional requirements miss.

Commerce needs fraud detection, account takeover protection, refund controls, bot and inventory abuse prevention, and financial reconciliation. Social systems need reporting, blocking, moderation, spam controls, rate limits, appeals, and safety escalation. Streaming systems need entitlement checks, content protection, piracy response, geographic restrictions, and policies for concurrent sessions.

Automated decisions need explainability, monitoring, human review where appropriate, and protection against feedback loops. Safety tools are not optional administrative screens. They are part of the product architecture.

## Design for teams and ownership

Systems scale through people as well as machines. Service boundaries should not require constant coordination among several teams for one ordinary change.

I want each important capability to have an owner, support expectations, documentation, operational dashboards, and a path for consumers to request changes. Platform teams should provide paved roads that make secure, observable, reliable behavior easier by default.

Standards should reduce repeated decisions without preventing justified exceptions. Architecture reviews are most useful when they clarify risk, tradeoffs, and ownership rather than approve diagrams.

## Keep cost visible

Cloud resources, data transfer, logs, search indexes, media encoding, external APIs, support, compliance, and engineering attention all contribute to cost.

Cost should be measured per useful unit such as order, active user, uploaded hour, streamed hour, or tenant. Capacity headroom and redundancy are intentional costs. Waste is different: unused resources, unbounded telemetry, repeated data copies, and architectures whose operating burden exceeds their value.

Decisions to build or buy should include integration, migration, dependence on one vendor, security, reliability, pricing at future scale, and exit strategy.

## Will agents replace web apps or become another client?

I expect some journeys to move from screens to intent. Instead of opening several pages, a person may ask an agent to find a product, compare options, prepare an order, moderate a queue, or choose something to watch. The interaction can become shorter even while the system behind it becomes more capable.

I do not think this means the backend should be opened directly to an agent. An agent is another client, with less predictable behavior than a traditional frontend. Business rules, authorization, validation, and invariants still belong behind controlled contracts.

```text
Web, mobile, or agent
          ↓
API or tool gateway
          ↓
Authorization + policy + domain services
          ↓
Authoritative data and external providers
```

A layer for agents might expose APIs or tools organized around tasks rather than mirroring every internal endpoint. A commerce tool could prepare a cart or request a return. A social tool could draft a post or retrieve a moderation queue. A streaming tool could search the entitled catalogue and update a watchlist. Protocols may change, but narrow contracts and stable domain semantics remain useful.

### The web app still has a role

Many decisions are easier to understand visually. People may want to compare products, inspect a bill, review a timeline, adjust privacy controls, see why content was removed, or recover an account. A web app provides a direct control surface when the agent is unavailable, wrong, or not trusted.

The web may evolve from being the only interaction layer into one of several:

1. A place to explore when the user has not formed a precise request.
2. A review surface for an agent's proposed action.
3. A control plane for identity, permissions, preferences, history, and revocation.
4. A fallback for correction, dispute, recovery, and accessibility needs.
5. The authoritative explanation of what the product offers and why a decision occurred.

### Acting on behalf of a person changes security

An agent should not inherit unlimited user authority. Delegated access needs to state who authorized it, which resources and actions are allowed, how long permission lasts, and how it can be revoked. Steps with serious consequences, such as purchase, payment, publishing, deletion, or permission changes, may require fresh human confirmation.

Agents also introduce risks that ordinary API clients do not fully capture:

1. Untrusted content can attempt to redirect the agent through prompt injection.
2. Retrieved data can cross tenant, privacy, or confidentiality boundaries.
3. A plausible but incorrect interpretation can trigger a valid API call with the wrong intent.
4. Autonomous retries or loops can create duplicate actions, load, and unexpected cost.
5. Tool descriptions or model behavior can change independently of the backend.
6. Sensitive context can leak into prompts, logs, traces, or external model providers.

This requires tools with limited permissions, explicit allowlists, credentials that expire quickly, policy checks outside the model, input and output isolation, spending and rate limits, and audit history that resists tampering. The model can propose an action, but deterministic code should enforce whether that action is allowed.

### Agent quality needs its own evidence

A normal integration test can prove that a checkout API works. It cannot prove that an agent selected the intended item, interpreted an ambiguous request correctly, or asked for confirmation at the right moment.

Agent evaluation needs representative tasks, adversarial content, permission boundaries, ambiguous instructions, tool failures, and changing model versions. Useful measures may include task completion, correction rate, rate of unsafe actions, confirmation quality, latency, token and tool cost, and the number of times a person must take over.

Every agent action should be traceable from user intent through model decision, tool call, policy decision, and backend result, while still protecting private reasoning and sensitive data. A person should be able to see what happened and correct it.

### The architecture may become more headless, but not less responsible

Products may invest more in stable APIs, workflows driven by events, semantic data, and reusable domain capabilities because many interfaces will sit above them. That can be useful pressure: business behavior becomes less coupled to one screen.

It can also move complexity out of sight. Removing a form does not remove validation. Replacing navigation with a conversation does not remove authorization, accessibility, latency, failure handling, or support. The interface may become simpler while the responsibility of the system stays the same or grows.

The questions I want to keep open are:

1. Which journeys are genuinely easier through intent, and which need visual exploration?
2. When should an agent act, propose, ask, or refuse?
3. How can a user understand and revoke delegated authority?
4. What is the source of truth when the web page, agent context, and backend disagree?
5. How do we preserve competition and user choice rather than depend on one agent platform?
6. Who is accountable when a technically authorized action does not match the person's intent?

## Questions that change by product type

### Commerce

1. Where are price, promotion, tax, inventory, order, payment, and fulfillment authoritative?
2. How are payment callbacks, retries, refunds, chargebacks, and reconciliation handled?
3. What can be reserved, oversold, substituted, or fulfilled later?
4. How do guest checkout, account identity, currency, locale, and accessibility work?

### Social media

1. How are work multiplication, ranking, privacy, blocking, deletion, and moderation enforced across copies?
2. What happens when a post becomes unexpectedly popular?
3. How are spam, coordinated abuse, harmful content, and appeals handled?
4. Which recommendation signals are collected, and how are quality and bias evaluated?

### Streaming

1. How are media ingested, transcoded, packaged, stored, protected, and distributed?
2. How do adaptive bitrate, captions, device support, and playback recovery behave?
3. How are entitlement, geography, concurrency, advertising, and rights windows enforced?
4. How will origins, CDNs, and regional capacity handle a live peak or provider failure?

## A review checklist before launch

1. Are critical journeys, invariants, risks, and owners explicit?
2. Are scale estimates, SLOs, RTO, and RPO agreed?
3. Do boundaries match domain responsibility and team ownership?
4. Are data authority, consistency, retention, deletion, and migration defined?
5. Are authentication, authorization, tenant isolation, secrets, and audit needs tested?
6. Are privacy, accessibility, compliance, abuse, and safety requirements included?
7. Can the system contain dependency failure and degrade intentionally?
8. Are capacity, hot spots, backpressure, and regional behavior tested?
9. Do telemetry and alerts show whether users can complete critical journeys?
10. Can changes roll out gradually, stop safely, and repair data when needed?
11. Are backups restorable and incident responsibilities understood?
12. Is the operational and financial cost acceptable at expected growth?

## What I want to remember

Technical design is less about naming every technology and more about making consequences visible. A strong design connects user outcomes to invariants, architecture, operations, and ownership. It states where the system can bend, where it must remain correct, and how people will safely change it after launch.