# Exploring Banking and Fintech Systems

Banking and fintech products move value under strict expectations of correctness, security, privacy, and <abbr title="The ability to trace and verify actions, decisions, and changes from reliable records">auditability</abbr>. A transfer that appears fast but cannot be explained or reconciled is not a successful transfer. These are the questions I would ask before choosing the architecture.

## Start with the movement of value

The product might expose accounts, cards, transfers, lending, investing, insurance, or financial planning. Each has a different lifecycle, but all need an authoritative record of what happened.

I want to model the states explicitly:

```text
Requested → Authorized → Posted → Settled
     ↓           ↓          ↓
  Rejected    Reversed   Reconciled
```

The balance shown to a user may include posted, pending, held, and available amounts. Those words need precise definitions because two screens showing different numbers can both be technically correct and still destroy trust.

## A reference architecture

There is no single architecture used by every bank or fintech company. The shape depends on the product, regulation, scale, legacy systems, and which responsibilities belong to external providers. This simplified view shows common boundaries rather than a required implementation:

<div class="article-diagram">
  <img src="/images/diagrams/banking-and-fintech-systems-reference.svg" alt="Reference architecture for Exploring Banking and Fintech Systems">
</div>

Clients should not connect directly to financial databases. They use the same identity, authorization, and policy boundaries on the server. The ledger records money movement, while separate stores may hold customer profiles, workflow state, documents, and reporting data. Some institutions build these components. Others use a core banking platform, processor, or banking service provider for part of the system.

## One possible implementation

A conservative starting point could use [Kotlin](https://kotlinlang.org/docs/home.html) with [Spring Boot](https://docs.spring.io/spring-boot/) for transaction services, [PostgreSQL](https://www.postgresql.org/docs/) for the ledger and workflow records, and [Apache Kafka](https://kafka.apache.org/documentation/) for committed domain events. [Temporal](https://docs.temporal.io/) can coordinate long-running payment, settlement, and reconciliation workflows whose state must survive retries and restarts.

<div class="article-diagram">
  <img src="/images/diagrams/banking-and-fintech-systems-implementation.svg" alt="One possible implementation for Exploring Banking and Fintech Systems">
</div>

[OpenTelemetry](https://opentelemetry.io/docs/) can connect technical traces to stable transaction identifiers while keeping sensitive values out of telemetry. The ledger's atomicity, idempotency, reconciliation, and audit requirements should decide the stack; replacing those properties with eventual consistency for convenience would be the wrong trade.

## The ledger is the source of financial truth

A <abbr title="An accounting record where every transaction has equal and opposite entries, keeping total debits and credits balanced">double entry ledger</abbr> records every movement as balanced entries. Money should not appear through an update that has no corresponding source or destination.

1. Entries are <abbr title="New records may be added, but existing records are not changed or deleted">append only</abbr> rather than silently overwritten.
2. Every transaction has a stable identifier and business reference.
3. Debits and credits balance in the same <abbr title="A set of changes that either all succeed or all fail, preventing partial updates">atomic operation</abbr>.
4. Corrections are new reversing or adjusting entries.
5. Derived balances can be rebuilt from the ledger.

The ledger does not replace the product workflow. It gives the workflow an auditable financial foundation.

## Idempotency and reconciliation prevent accounting errors

Networks time out after work may already have completed. A repeated transfer request must not move money twice merely because the caller did not receive the first response.

<abbr title="Unique request identifiers that let a system recognize a retry and avoid performing the same action twice">Idempotency keys</abbr>, <abbr title="Workflow changes saved permanently so they survive crashes and restarts">durable state transitions</abbr>, <abbr title="Database rules that prevent duplicate values in fields that must be unique">uniqueness constraints</abbr>, and careful retry policies make repetition safe. <abbr title="Comparing records from separate systems to find and resolve missing, duplicated, or mismatched transactions">Reconciliation</abbr> compares internal records with processors, banks, card networks, and settlement files. Differences need queues, named owners, and repair procedures rather than manual database edits.

```text
Internal intent ↔ Ledger ↔ Provider record ↔ Settlement
                         compare and explain
```

## Concurrent activity must preserve financial rules

Two withdrawals can arrive at the same time. A payment and reversal can cross. Interest, fees, and holds can affect the same account concurrently.

The design should state which rules require <abbr title="Processing operations one at a time in a defined order">serial execution</abbr>, database constraints, <abbr title="Detecting conflicting updates before saving instead of locking the data in advance">optimistic concurrency</abbr>, or <abbr title="Database guarantees that limit how much simultaneous transactions can observe or affect one another">stronger isolation</abbr>. I want each <abbr title="A rule that must remain true before and after every valid operation">invariant</abbr> enforced at a boundary that every channel uses, not only in one frontend.

## Security begins with identity and authorization

Financial access requires continuing identity and authorization checks after login.

1. Use <abbr title="Sign in methods designed not to reveal reusable secrets to fake sites, such as passkeys or hardware security keys">authentication that resists phishing</abbr> where the risk justifies it.
2. Bind sensitive actions to the authenticated person, device, and session context.
3. Apply <abbr title="An extra identity check required when an action or change in context raises risk">additional verification</abbr> when risk changes.
4. Authorize every account and action on the server.
5. Separate customer, employee, support, and service privileges.
6. Protect secrets and cryptographic keys with managed rotation.
7. Keep <abbr title="Logs designed to reveal or prevent unauthorized alteration">audit records that resist tampering</abbr> for access and changes.
8. Design account recovery as carefully as sign in.

Support tools are part of the attack surface. An employee should see and change only what their role and current task require.

## Fraud and abuse are adaptive systems

Fraud controls combine rules, models, device signals, <abbr title="Limits on how often or how much an account, card, or device can transact within a time window">velocity limits</abbr>, transaction history, and human investigation. Attackers respond to controls, so yesterday's threshold can become today's exploit.

A risk decision needs a suitable response: allow, challenge, delay, limit, or review. <abbr title="Legitimate activity incorrectly identified as suspicious or fraudulent">False positives</abbr> matter because blocking a legitimate payment can be as harmful to the user as missing fraud. Models and rules need outcome monitoring, explanations suited to the decision, and a controlled way to restore the previous version.

## Privacy and compliance constrain the design

Financial data needs classification, <abbr title="Collecting and using personal data only for specific, stated reasons">purpose limitation</abbr>, <abbr title="Rules for how long records are kept and when they are deleted">retention</abbr>, deletion rules, regional handling, and tightly controlled analytics access. Relevant obligations vary by product and jurisdiction, including identity verification, <abbr title="Checks used to detect and report attempts to disguise proceeds from crime">controls against money laundering</abbr>, <abbr title="Checking people and organizations against legal restrictions on financial activity">sanctions screening</abbr>, payment card requirements, lending rules, and consumer reporting.

Compliance is not proof that the product is safe. It establishes requirements that still need sound engineering and operating practices.

## Availability depends on the journey

Customers may need account access during a provider outage even when new transfers cannot be completed. The system can degrade deliberately:

1. Show the most recently known balances with a clear freshness indicator.
2. Accept a request only when its eventual processing is safe and understood.
3. Disable a risky action while keeping statements and support available.
4. Queue noncritical notifications without delaying the transaction.

<abbr title="Service level objectives: measurable reliability targets for a service or user journey">SLOs</abbr> should follow journeys such as sign in, balance retrieval, authorization, transfer submission, and statement access. <abbr title="Targets for how quickly service must return and how much recent data loss is acceptable after a failure">Recovery objectives</abbr> need to reflect how much financial state can safely be reconstructed or replayed.

## Observability must connect technical and financial truth

Normal <abbr title="Measurements and events collected to understand a running system's health and behavior">telemetry</abbr> includes latency, errors, <abbr title="How close a resource is to its maximum useful capacity">saturation</abbr>, dependency health, and <abbr title="How long the oldest unprocessed item has waited">queue age</abbr>. Financial systems also need counts and values by transaction state, unmatched records, duplicate attempts, settlement differences, fraud outcomes, and age of unresolved cases.

Every important transaction should be traceable across API calls, workflow state, ledger entries, provider references, notifications, and reconciliation without exposing sensitive data in logs.

## User experience is part of correctness

People need to know whether an action is pending, complete, failed, reversed, or waiting for review. Dates, exchange rates, fees, limits, and recipient identity should be visible before confirmation.

Error messages should explain what the person can do next without revealing security controls. Accessibility, localization, currency precision, time zones, and understandable statements are part of correct financial behavior, not finishing work.

## What changes with AI agents

An agent could categorize spending, explain a statement, prepare a transfer, compare products, or gather documents. It should not receive broad account authority merely because it can hold a conversation.

I would separate levels of agency:

```text
Read and explain → Prepare → Ask for confirmation → Execute → Provide receipt
```

<abbr title="Access granted to software so it can act for a person within stated limits">Delegated permissions</abbr> should limit accounts, actions, amounts, recipients, duration, and frequency. Actions with serious consequences need fresh human confirmation through a trusted channel. <abbr title="Rules implemented in ordinary code so the same input reliably produces the same authorization decision">Deterministic policy code</abbr>, not the model, enforces limits and authorization.

Agent specific risks include misunderstood intent, <abbr title="Malicious instructions hidden in user input or documents that try to change how the model behaves">prompt injection</abbr> from financial documents, sensitive context leaking to a model provider, and repeated tool calls creating duplicate or costly actions. Idempotency, <abbr title="Removing or masking sensitive information before data is stored or shared">redaction</abbr>, credentials that expire quickly, audit trails, spending limits, and easy revocation are necessary safeguards.

The web or mobile app remains important as a place to inspect balances, compare choices, manage permissions, review agent history, dispute an action, and recover control.

## Try the money transfer experiment

The [idempotent transfer lab](https://github.com/ArpithaMurthy/system-design-experiments#banking) is a working prototype for balanced ledger entries, retrying the same request without moving money twice, and rejecting an overdraft without partially changing balances. It runs locally without a payment account or paid service.

## Questions I am wondering about

1. What is the authoritative ledger, and can balances be rebuilt?
2. Which financial and business invariants must hold under concurrency?
3. How are retries, reversals, refunds, and duplicate requests handled?
4. How are external records reconciled, and who owns differences?
5. Which actions require additional authentication or human review?
6. How are fraud controls measured for both misses and false positives?
7. What can remain available when a provider or region fails?
8. Can every transaction be explained without exposing sensitive data?
9. How are schemas, rules, and models changed safely?
10. If an agent acts, how is its authority bounded, confirmed, and revoked?

## What I want to remember

Financial systems earn trust by preserving and explaining value through retries, failures, corrections, and change. Speed matters, but a durable ledger, explicit invariants, reconciliation, and human control matter more.