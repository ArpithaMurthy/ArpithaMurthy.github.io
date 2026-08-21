# Exploring AI Products and Agent Platforms

AI products combine models that can give different answers with software that follows fixed rules. They may also use private information, external tools, and human decisions. A convincing response is not enough. I want to know whether the product is useful, safe, affordable, and still under the user's control when the model changes or gets something wrong.

## Begin with a task and consequence

“Add AI” is not a requirement. I want to know whose task improves, what good output means, what a mistake costs, and when a person should remain responsible.

Tasks may retrieve, classify, extract, generate, recommend, or act. Acting deserves a higher bar because an error changes the world rather than only showing text.

## A reference architecture

AI products vary by task, risk, data, and model provider. This view shows common boundaries rather than a required design:

<div class="article-diagram">
  <img src="/images/diagrams/ai-products-and-agent-platforms-reference.svg" alt="Reference architecture for Exploring AI Products and Agent Platforms">
</div>

The model should not connect directly to databases or privileged systems. Retrieval applies the user's access before providing context, and tools expose narrow actions through ordinary authorization and policy checks.

## One possible implementation

A starting point could use [React](https://react.dev/) for the product interface, [FastAPI](https://fastapi.tiangolo.com/) for typed model and tool APIs, [PostgreSQL](https://www.postgresql.org/docs/) with [pgvector](https://github.com/pgvector/pgvector) for governed application and retrieval data, and object storage for approved source documents. A durable job queue can isolate long model calls, ingestion, and evaluations from interactive requests.

<div class="article-diagram">
  <img src="/images/diagrams/ai-products-and-agent-platforms-implementation.svg" alt="One possible implementation for Exploring AI Products and Agent Platforms">
</div>

[OpenTelemetry](https://opentelemetry.io/docs/) can connect model calls, retrieval, tools, cost, and user-visible outcomes without making prompts the only diagnostic record. Provider SDKs and orchestration libraries should remain behind narrow interfaces so models can change without rewriting authorization or business rules.

## Keep important rules outside the model

The model can interpret a request and suggest a plan. Regular code should still check identity, permissions, input shape, limits, business rules, and actions that cannot easily be undone.

```text
User request
|
v
Model suggests a response or action
|
v
Code checks rules and permissions
|
v
Approved tool or API action
|
v
Result shown to the user
```

Each tool should do a small, clearly defined job and receive only the access it needs. When a request may be retried, repeating it should not accidentally repeat the outcome. An agent should never receive a database credential as a shortcut around an API.

## Show where information came from

Retrieval quality depends on source quality, chunking, freshness, permissions, and ranking. Every retrieved item must respect the requesting user's access before entering the prompt.

When an answer needs verification, it should link to the original source and show when that source was updated. User input, retrieved documents, tool results, and system instructions should remain separate because untrusted text can try to manipulate the model through prompt injection.

## Evaluation is part of the product

A static benchmark cannot represent all production behavior. Evaluation needs representative tasks, difficult edge cases, adversarial content, permission checks, multilingual inputs, and real failure costs.

Useful measures include task success, factual support, unsafe action rate, correction rate, refusal quality, latency, token and tool cost, and human takeover. Model or prompt changes should run against versioned evaluation sets before gradual rollout.

## Human control should match consequence

Low risk suggestions can appear directly. Drafts should be editable. High impact actions may require preview, explanation, confirmation, approval, or complete refusal.

Users need to know when AI is involved, what data it used, what action it took, and how to correct or revoke it. Memory should be visible, scoped, editable, and deletable.

## Security and privacy have new paths

Threats include <abbr title="Malicious instructions hidden in user input or retrieved content that try to change how the model behaves">prompt injection</abbr>, <abbr title="Unauthorized exposure or transfer of private or protected data">data exfiltration</abbr>, <abbr title="Corrupted or misleading content added to a knowledge source so the model retrieves it later">poisoned retrieval</abbr>, <abbr title="Tools that lack proper permission checks, input validation, or limits on what they can do">insecure tools</abbr>, <abbr title="Giving an agent more access or freedom to act than it needs for its task">excessive agency</abbr>, <abbr title="Repeatedly triggering expensive requests to deliberately increase someone's cloud or AI bill">denial of wallet attacks</abbr>, <abbr title="Attempts to copy or infer a model's behavior, parameters, or protected capabilities through repeated queries">model extraction</abbr>, and <abbr title="Private data, credentials, prompts, or model responses accidentally recorded in diagnostic logs">sensitive information in logs</abbr>.

Controls include separating untrusted input, allowing only approved tools, using credentials that expire quickly, limiting requests and spending, removing sensitive data, running risky work in a sandbox, and keeping an audit history that cannot be silently changed.

The team should review which model provider receives the data, how long it keeps the data, where it processes the data, whether it uses the data for training, and which other vendors it relies on.

## Reliability includes graceful model failure

Models time out, limit requests, change behavior, and return output in the wrong format. The product needs validation, retries only when safe, a fallback model where it helps, and a useful path that does not depend on AI.

Tracing should connect user intent, model version, prompt version, retrieval references, tool calls, policy decisions, cost, and final outcome without exposing secrets.

## Questions I am wondering about

1. What task improves, and how will we know?
2. What is the consequence of a plausible but wrong result?
3. Which decisions should fixed rules handle outside the model?
4. Does retrieval respect permissions and show where information came from?
5. Can evaluations detect regressions across models, prompts, and groups?
6. Can users inspect, stop, correct, and revoke agent behavior?
7. Is the value worth the latency, cost, privacy, and operating burden?

## What I want to remember

An AI product is a system, not a prompt. Its quality comes from task design, trusted context, bounded tools, evaluation, human control, and operational evidence around a model that will never be perfectly predictable.