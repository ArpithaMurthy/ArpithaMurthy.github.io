# Exploring Developer Platforms

Developer platforms provide cloud resources, APIs, <abbr title="Continuous integration and continuous delivery: automated practices for testing and releasing software changes">CI/CD</abbr>, observability, environments, and operational workflows to other engineers. Their job is not to hide every detail. It is to make the secure and reliable path easier while preserving enough visibility for teams to understand and recover their systems.

```text
Developer intent → Platform control plane → Workload and resources
Policy, identity, and audit → Platform control plane
```

## A reference architecture

Platform boundaries depend on the cloud, organization, and supported workloads. A common structure looks like this:

<div class="article-diagram">
  <img src="/images/diagrams/developer-platforms-reference.svg" alt="Reference architecture for Exploring Developer Platforms">
</div>

The control plane may become unavailable without stopping healthy workload traffic. Reconciliation restores the requested state when provisioning or deployment work is interrupted.

## One possible implementation

A platform could use [Backstage](https://backstage.io/docs/) for its portal and service catalog, [Kubernetes](https://kubernetes.io/docs/) for supported workloads, [Crossplane](https://docs.crossplane.io/) for declarative cloud resources, and [Argo CD](https://argo-cd.readthedocs.io/) for GitOps delivery. Platform APIs should expose stable product concepts rather than leaking every underlying provider field.

<div class="article-diagram">
  <img src="/images/diagrams/developer-platforms-implementation.svg" alt="One possible implementation for Exploring Developer Platforms">
</div>

[OpenTelemetry](https://opentelemetry.io/docs/) can provide a common telemetry contract across workloads and control-plane components. These tools are justified only when the organization can operate them; a smaller platform built from cloud-managed services and templates may provide a better paved road for a smaller engineering group.

## Begin with developer journeys

Provisioning a service, deploying a change, storing a secret, viewing telemetry, responding to an incident, and decommissioning a resource are complete developer journeys.

Measure lead time, success, recovery, support burden, and adoption rather than the number of platform features. A paved road has little value if teams must leave it for ordinary needs.

## APIs and interfaces are products

CLI commands, portals, templates, libraries, and APIs should share stable concepts and identifiers. Contracts need versioning, compatibility, useful errors, idempotency, and documentation tested against reality.

Defaults should encode security, observability, ownership metadata, cost tags, and deployment safety. <abbr title="Approved ways to bypass a platform default when an unusual requirement cannot use the standard path">Escape hatches</abbr> need review and a path back to the supported route.

## Control plane and data plane need different thinking

The <abbr title="The part of a platform that accepts desired configuration and creates or changes resources">control plane</abbr> configures resources. The <abbr title="The part that handles the application's actual runtime traffic and data">data plane</abbr> serves workload traffic. A control plane outage should not automatically stop healthy workloads.

Provisioning is often an <abbr title="A workflow whose steps continue over time instead of completing inside one request">asynchronous state machine</abbr>. Requests need durable intent, retries, reconciliation, quotas, and a clear display of partial failure.

## Tenant isolation and blast radius are central

Teams share clusters, pipelines, registries, networks, and telemetry systems. Isolation, quotas, <abbr title="An identity assigned to running software so it can access resources without a person's credentials">workload identity</abbr>, policy, and regional cells contain failures and <abbr title="Shared platform users whose heavy resource use reduces performance for others">noisy neighbors</abbr>.

A global platform change needs <abbr title="Small initial deployments used to detect problems before a change reaches everyone">canaries</abbr>, tenant cohorts, compatibility checks, kill switches, and rollback. Platform incidents can affect every product at once.

## Self service requires guardrails and ownership

Authentication should map to organizational identity, while workload identity avoids credentials that remain valid for long periods. Authorization needs environment, resource, action, and approval context.

Every resource should have an owner, lifecycle, support tier, cost visibility, and decommission path. Orphaned infrastructure is both expense and risk.

## Observability must serve consumers and operators

Teams need logs, metrics, traces, deployment history, and dependency context for their workloads. Platform operators need saturation, queue age, reconciliation failures, policy denials, and impact by tenant.

Status and errors should name what the developer can do next. Internal implementation details are useful only when they help diagnosis.

## What changes with AI agents

Agents may generate infrastructure, investigate incidents, update pipelines, or perform routine operations. Developer platforms are natural tool providers because they already own typed workflows and policy boundaries.

Diagnosis with read access can be broad. Changes should be narrow. Production deployment, access changes, deletion, scaling, and costly operations may require plans, diffs, policy checks, approvals, and bounded credentials.

Agent traces should show evidence, commands, tool results, and changes. The platform must resist prompt injection from logs, tickets, repositories, and documentation, all of which may be untrusted.

## Questions I am wondering about

1. Which developer journeys are slow, risky, or repeatedly reinvented?
2. Can the data plane survive control plane degradation?
3. How are shared platform blast radius and noisy neighbors contained?
4. Do defaults provide security and operability without blocking legitimate needs?
5. Can every resource be attributed, supported, costed, and removed?
6. Which agent operations are read, propose, approve, or execute?

## What I want to remember

A developer platform earns adoption through useful constraints and dependable workflows. It should reduce repeated cognitive load while leaving teams able to see, understand, and safely control what runs on their behalf.