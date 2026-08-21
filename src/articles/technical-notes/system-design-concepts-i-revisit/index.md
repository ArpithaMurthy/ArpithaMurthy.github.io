# System Design Concepts I Revisit

System design can feel like a long list of terms. I want this note to connect the ideas so I can return to them. The question behind every concept is simple: what problem does it help me reason about, and what tradeoff does it introduce?

## Start with the problem, not the architecture

Before choosing a database, cache, or queue, I want to understand what the system must do.

1. Who will use it, and what are they trying to accomplish?
2. How much traffic and data should it handle now and later?
3. What must remain correct when something fails?
4. Which matters more for this use case: fresh data, fast responses, or continued availability?

A design is only good in the context of its requirements. The same choice can be sensible for one system and harmful for another.

```text
Requirements → Constraints → Tradeoffs → Design
```

## Estimates and <abbr title="Service level objectives: measurable reliability targets for a service or user journey">SLOs</abbr> make requirements concrete

Words such as fast, reliable, and large are too vague to design around. I want to turn them into rough numbers before choosing an architecture.

1. How many requests arrive on an average day and at the busiest moment?
2. How much data is written, retained, and read back?
3. What latency should most users experience, and what happens at the slow end?
4. What availability does the user journey require?

An SLO gives the team a shared reliability target. The <abbr title="The amount of unreliability a service can tolerate while still meeting its reliability objective">error budget</abbr> makes the tradeoff visible: if reliability is comfortably within the target, the team has room to change faster. If it is not, reliability work becomes the priority.

```text
Traffic + Data + Latency + Availability → Capacity and SLOs
```

These estimates do not need false precision. Their purpose is to reveal whether the design is off by a factor of ten and where the first bottleneck is likely to appear.

## <abbr title="Application programming interfaces: defined contracts through which software components communicate">APIs</abbr> are promises between components

An API defines how independently changing parts of a system cooperate. I want the contract to make inputs, outputs, errors, pagination, timeouts, and compatibility explicit.

```text
Client → Stable contract → Changing implementation
```

Versioning can help, but compatibility is usually easier when changes are additive. For write APIs, idempotency keys make retries safer. For read APIs, pagination and bounded responses prevent one request from becoming unlimited work.

## Communication patterns should match the shape of the interaction

An API defines the contract. The communication pattern defines how a caller and receiver exchange work across that contract. I want to choose it from the interaction's latency, coupling, delivery, ordering, and recovery needs rather than from technology familiarity.

1. **HTTP request and response:** A client sends a request and waits for a response. It fits browser APIs and service calls where the result is needed immediately, but the caller must handle latency, timeouts, and an unavailable receiver.
2. **RPC and gRPC:** A caller invokes a remote operation through a strongly defined service contract. gRPC commonly uses Protocol Buffers and HTTP/2, making it useful for efficient internal service communication, but it introduces schema evolution and cross-service coupling concerns.
3. **WebSocket:** A long-lived, bidirectional connection lets either side send updates. It fits chat, presence, live dashboards, and other low-latency experiences, but connection state, reconnection, ordering, and fan-out become part of the design.
4. **Queues and publish-subscribe:** A producer hands work or an event to a broker instead of waiting for every consumer. This reduces temporal coupling and absorbs bursts, while introducing eventual processing, duplicate delivery, and backlog management.

```text
Request-response: Client → Service → Response
Bidirectional:    Client ↔ Live connection ↔ Service
Asynchronous:     Producer → Broker → Consumer or subscribers
```

RabbitMQ and Apache Kafka both move data asynchronously, but they optimize for different shapes of work. RabbitMQ is a message broker with flexible routing and acknowledgements, often suited to work queues and commands. Kafka is a durable partitioned event log, often suited to ordered event streams, replay, and multiple independent consumers. Neither removes the need to define message ownership, schemas, ordering scope, retention, retries, idempotency, and dead-letter or recovery behavior.

A single system can use several patterns. A user may submit a request over HTTPS, receive live progress over WebSocket, and trigger background events through Kafka or queued work through RabbitMQ. In a design diagram, I want to label communication when the distinction changes the behavior: request-response, real-time stream, event, or batch at the reference level; HTTP, gRPC, WebSocket, Kafka, or RabbitMQ in a concrete implementation.

## <abbr title="Five design principles covering responsibility, extension, substitution, focused interfaces, and dependency direction">SOLID</abbr> helps me think about change

I used to see SOLID as five rules to follow. I now find it more useful as five questions about how easily code can change.

1. **Single responsibility:** Does this component have one clear reason to change?
2. **Open and closed:** Can I add behavior without repeatedly changing stable code?
3. **Liskov substitution:** Can one implementation replace another without surprising its caller?
4. **Interface segregation:** Does a consumer depend only on what it actually needs?
5. **Dependency inversion:** Do important decisions depend on abstractions rather than changing implementation details?

The idea I want to remember is not to force every design into a pattern. It is to notice when responsibilities are tangled and when one change is likely to cause several unrelated changes.

```text
Changing detail → Interface ← Core decision
```

## Boundaries should follow responsibility and change

A monolith is not automatically simple, and services are not automatically scalable. I want boundaries to reflect business responsibility, data ownership, and the parts that need to change independently.

```text
Clear ownership → Clear boundary → Independent change
```

Every remote boundary adds latency, partial failure, deployment coordination, and observability work. I would rather begin with a well structured system and split it when ownership, scale, or release independence makes the cost worthwhile.

## Traffic routing connects users to healthy capacity

Several layers may direct a request before application code handles it. DNS maps a name to an endpoint. A CDN serves cacheable content near users. A load balancer spreads traffic across healthy instances. An API gateway can provide a shared entry point for authentication, rate limits, and routing. Inside a distributed system, service discovery helps callers find changing service instances.

```text
User → DNS → CDN or load balancer → Gateway → Service
```

Each layer should solve a specific problem. Adding all of them by default creates more configuration and more places for failure. I want to define health checks, routing policy, failover behavior, connection draining, and what happens when an instance or an entire region becomes unavailable. Sticky sessions can preserve local session affinity, but stateless services or shared session state usually make rebalancing and recovery easier.

## Data models should begin with access patterns

The database choice follows the shape of the data, the queries, and the correctness guarantees. Relational storage is useful when relationships and transactions matter. Key value, document, column, graph, and search systems each serve different access patterns.

Indexes speed up reads by maintaining another structure, but they consume storage and make writes more expensive. A useful design names its important queries, indexes, retention policy, and expected growth rather than choosing a database by familiarity alone.

```text
Access patterns → Data model → Storage and indexes
```

## <abbr title="Atomicity, consistency, isolation, and durability: guarantees associated with database transactions">ACID</abbr> protects transaction correctness

ACID helps me reason about what a transaction promises.

1. **Atomicity:** All changes succeed together or none of them do.
2. **Consistency:** A transaction preserves the rules the database is responsible for enforcing.
3. **Isolation:** Concurrent transactions do not produce outcomes outside the chosen isolation guarantee.
4. **Durability:** Once committed, data survives the failures covered by the storage system.

```text
Begin → Read and write → Commit
          all or nothing
```

Isolation levels matter because stronger isolation can reduce concurrency. Dirty reads, nonrepeatable reads, phantom reads, and write skew are not only database terms. They describe real ways concurrent work can violate an assumption. I want to choose the weakest level that still protects the business invariant, then test that invariant under concurrency.

## Concurrency control protects invariants when work overlaps

Two individually valid operations can produce an invalid result when they run at the same time. A design should identify the invariant first, then decide where simultaneous changes are coordinated.

1. **Optimistic concurrency:** Read a version, attempt the update, and reject it if another writer changed the record first. This works well when conflicts are uncommon and retries are acceptable.
2. **Pessimistic locking:** Lock the relevant data before changing it. This can simplify highly contested operations, but long-held locks reduce throughput and can create deadlocks.
3. **Atomic database operations:** Constraints, conditional updates, and transactions often protect an invariant more reliably than coordinating it only in application code.
4. **Distributed locks:** A shared lock can coordinate work across processes, but leases, expiration, fencing, and failure ownership must be designed carefully. A lock is not a substitute for a durable database invariant.

```text
Read version 7 → Update where version = 7 → Commit version 8
                                      ↘ conflict: reload or reject
```

The correct response to a conflict depends on the workflow. Retrying a counter update may be safe. Silently retrying an edited document or a financial decision may overwrite a user's intent, so the conflict should be exposed or resolved explicitly.

## <abbr title="Consistency, availability, and partition tolerance in a distributed system">CAP</abbr> matters when the network is divided

CAP is easy to memorize and easy to oversimplify. A distributed system wants consistency, availability, and partition tolerance. When a network partition happens, it cannot fully guarantee both consistency and availability at the same time.

```text
[Node A]   network partition   [Node B]
    ↓                              ↓
latest value?                  latest value?
```

During that partition, a system can favor one of two responses.

1. **Consistency:** Reject or delay some requests rather than return conflicting data.
2. **Availability:** Continue responding, accepting that some users may temporarily see older or different data.

Partition tolerance is not usually an optional feature because networks can fail. The practical question is what the system should do while that failure is happening. A payment balance and a social feed may answer differently.

## <abbr title="During a partition choose availability or consistency. Otherwise choose latency or consistency">PACELC</abbr> covers tradeoffs with and without a partition

CAP describes the choice during a partition. PACELC adds the everyday choice: else, when the network is healthy, a distributed system often trades latency against consistency.

```text
Partition: Availability or Consistency
Else:      Latency or Consistency
```

A globally consistent write may need coordination across distant regions. A local response is faster but may expose an older value. Geography makes this tradeoff physical, not theoretical.

## Consistency should be stated from the user’s point of view

Consistency is not simply strong or eventual. A system may need read your writes, monotonic reads, causal ordering, or linearizable behavior for a particular workflow.

Quorums offer one way to coordinate replicated data. With `N` replicas, `W` write acknowledgements, and `R` read responses, configurations where `W + R > N` can create overlap between reads and writes. That does not remove every conflict or failure mode, but it makes the coordination choice explicit.

Consensus and leader election help nodes agree on ordered decisions despite failures. They are valuable when the system needs one authoritative sequence, but that coordination has latency and availability costs.

## <abbr title="Basically available, soft state, and eventually consistent">BASE</abbr> gives eventual consistency a shape

BASE describes systems that prefer continued availability and allow state to settle over time.

1. **Basically available:** The system continues to respond, although the response may not contain the newest state.
2. **Soft state:** Data can change as replicas exchange updates, even without a new user action.
3. **Eventually consistent:** If updates stop, replicas will converge on the same value.

```text
Write → Node A → replication → Node B
          fresh                 catches up
```

I do not want to remember BASE as the opposite of ACID. They answer different questions. ACID protects the correctness of a transaction. BASE describes how distributed state may behave across time. Some systems need both in different places.

## Scaling changes how work and state are distributed

Vertical scaling gives one machine more capacity. Horizontal scaling adds more machines. Horizontal scaling can increase capacity and resilience, but only when work and state can be distributed safely.

```text
                 → [Service A]
[Client] → [Load balancer] → [Service B]
                 → [Service C]
```

Stateless services are easier to distribute because any instance can handle the next request. State still exists, but it moves to a database, cache, or another system designed to manage it.

The reminder for me is that every extra machine also creates coordination, deployment, debugging, and failure concerns. Scale should answer a demonstrated need.

## Caches exchange freshness for speed

A cache avoids repeating expensive work. It can reduce latency and protect a database, but it introduces another copy of data that may become stale.

```text
[Request] → [Cache]
               ↓ miss
           [Database]
               ↓
          update cache
```

Before adding a cache, I want to ask:

1. What is the cache key?
2. How long can this data be stale?
3. What invalidates it?
4. What happens when the cache is unavailable?

Caching is often described as a performance feature. The difficult part is deciding when an old answer becomes a wrong answer.

## Replication and partitioning solve different problems

Replication creates copies of data. It can improve availability and read capacity, but replicas must stay synchronized.

Partitioning divides data into smaller groups. It can increase storage and write capacity, but a poor partition key can create uneven load and difficult cross partition queries.

```text
Replication:  [Data] → [Copy A] [Copy B]

Partitioning: [All data] → [A to M] [N to Z]
```

The question I want to ask is whether I need more copies of the same data or a way to divide different data across machines. Sometimes a large system needs both.

Hot partitions are a reminder that even distribution matters as much as the number of partitions. A popular tenant, timestamp based key, or celebrity account can send most traffic to one shard. Choosing a partition key means reasoning about cardinality, skew, rebalancing, and the queries that cross boundaries.

## Queues create space between producers and consumers

A queue lets one part of a system accept work without waiting for another part to finish it immediately.

```text
[Producer] → [Queue] → [Consumer]
                ↓
          absorbs bursts
```

Queues help with traffic spikes, slow work, and independent scaling. They also introduce delayed processing, duplicate delivery, ordering questions, and failed messages.

Backpressure matters when work arrives faster than it can be processed. A queue can absorb a temporary burst, but it cannot make unlimited demand disappear. The system still needs limits, monitoring, and a plan for overload.

Delivery guarantees also need precise language. At most once may lose work. At least once may repeat it. Exactly once usually depends on a carefully bounded system, so I prefer to design consumers to be idempotent and make duplicate handling explicit.

## Distributed workflows need a consistency plan

A transaction cannot always span every service safely. A saga breaks a workflow into local transactions with compensating actions. The transactional outbox stores a state change and an event together, then publishes the event asynchronously.

```text
Local transaction → Outbox → Event → Next step
                ↓ failure                  ↓ failure
            rollback                 retry safely
```

Compensation is not the same as erasing history. Refunding a payment is a new action, not an undo button. I want the workflow to define ownership, retries, duplicate handling, and what a human can do when automation cannot finish.

## Failure handling should avoid making failure larger

Distributed calls will eventually be slow or unavailable. A few small patterns help contain the effect.

1. **Timeouts** stop a caller from waiting forever.
2. **Retries** help with temporary failures, but they need limits and increasing delays.
3. **Circuit breakers** pause calls to a failing dependency so it has room to recover.
4. **Idempotency** makes repeated requests produce the same intended result.
5. **Bulkheads** keep one exhausted dependency or workload from consuming every shared resource.
6. **Rate limits and load shedding** reject excess work deliberately before the whole system becomes unresponsive.

```text
Request → Timeout → Retry carefully → Recover or fail clearly
```

Retries without idempotency can turn one payment into two. Retries without limits can turn a small outage into much more traffic. The pattern is useful only when I also think about its side effects.

Graceful degradation asks which smaller promise the system can still keep. A recommendation panel can disappear while checkout continues. A stale read may be acceptable where a failed write is not. Priority should follow user impact.

## Observability helps me understand the system I actually built

A design diagram shows what I expect. Logs, metrics, and traces show what the system is doing.

1. **Logs** explain individual events with useful context.
2. **Metrics** reveal trends such as latency, traffic, errors, and saturation.
3. **Traces** follow a request across service boundaries.

```text
User request → Service A → Service B → Database
                    one trace across the path
```

I want observability to begin with questions. Can I tell whether users are succeeding? Can I find where time is being spent? Can I distinguish a slow dependency from a problem in my own code?

Alerts should connect to user impact or an action someone can take. Dashboards are useful, but ownership, runbooks, and a clear escalation path are what turn a signal into recovery.

## Security and privacy belong in the architecture

Security is not a final review step. I want to identify trust boundaries, authenticate identities, authorize each action, encrypt data in transit and at rest, rotate secrets, and keep an audit trail for sensitive operations.

```text
Identity → Authentication → Authorization → Audited action
```

Least privilege limits the damage when a credential or component is compromised. Data minimization and retention limits reduce what can be exposed. Abuse prevention, tenant isolation, and privacy requirements can change storage, API, and observability choices, so they belong in the first design.

## Recovery needs explicit targets

High availability reduces interruption. Disaster recovery defines how the system returns after a larger failure. I want two numbers to be clear.

1. **<abbr title="Recovery time objective: the target time for restoring service after a failure">RTO</abbr>:** How long can recovery take?
2. **<abbr title="Recovery point objective: the maximum acceptable amount of recent data loss">RPO</abbr>:** How much recent data can be lost?

```text
Primary region → replicated state → Recovery region
    test the path before it is needed
```

Backups matter only if they can be restored. Multi region architecture matters only if failover, data consistency, capacity, and failback have been exercised. More regions can improve resilience, but they also add coordination and operational cost.

## Data evolution must work while old and new shapes coexist

Stored data, API payloads, and events outlive the code version that created them. A safe change assumes that producers, consumers, and records will not all move to the new shape at once.

Additive changes are usually easier to roll out than renames or removals. For a database, an expand and contract migration can add the new shape, move reads and writes gradually, backfill older records, verify the result, and remove the old shape later. Large backfills need throttling, checkpoints, idempotency, and observability so they do not overwhelm production traffic.

Event schemas need the same care because retained events may be replayed by newer consumers. Producers and consumers should define compatibility rules, defaults for missing fields, ownership, and how malformed or unsupported events are handled.

```text
Add new shape → Write both → Backfill → Read new → Remove old
```

Retention and deletion are also schema decisions. I want to know how long each data class remains useful, where copies and derived data exist, and how legal or user-requested deletion propagates through databases, caches, search indexes, backups, and event streams.

## Safe evolution is part of the design

Long lived systems change while serving traffic. Schema migrations, API changes, and deployments need backward compatibility so old and new versions can coexist during rollout.

```text
Expand → Migrate → Observe → Contract
```

Feature flags, canaries, and gradual rollouts reduce blast radius. Rollback is useful only when data and contracts remain compatible. I want every major change to include a migration path, success signals, and a clear stopping condition.

## Cost and ownership keep architecture grounded

A technically possible design can still be a poor system if no team can operate it or its cost grows faster than its value. Compute, storage, data transfer, managed services, on call load, and engineering attention are all part of the architecture.

At a broader level, I want to ask who owns each capability, where decisions are documented, which standards should be shared, and where teams need freedom. A good design gives the organization a path to evolve, not only a diagram that works on launch day.

## What I want to carry forward

System design is not about collecting the most technologies. It is about making choices that fit the problem and being honest about what each choice costs.

The sequence I want to remember is:

```text
Understand → Estimate → Define invariants → Design → Test failure → Observe → Evolve
```

I will keep adding to this note as my understanding changes. For now, these concepts give me a way to ask better questions before drawing a more complicated architecture.
