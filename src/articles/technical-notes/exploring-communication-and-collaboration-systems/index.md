# Exploring Communication and Collaboration Systems

Messaging, email, meetings, and collaborative documents connect people across devices, networks, organizations, and time. Users expect messages not to disappear, private conversations not to leak, and shared work not to be overwritten.

```text
Person and devices → Conversation service → Ordered history
Person and devices → Presence and media
Conversation service → Membership rules
Ordered history → Sync and search
```

## A reference architecture

Implementations vary by communication mode, privacy model, and scale. These are common boundaries rather than a required design:

<div class="article-diagram">
  <img src="/images/diagrams/communication-and-collaboration-systems-reference.svg" alt="Reference architecture for Exploring Communication and Collaboration Systems">
</div>

Clients use shared membership and authorization rules even when messages, documents, and live media use different storage and delivery paths.

## One possible implementation

A web client could use [React](https://react.dev/), [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) connections for messaging and presence, and [WebRTC](https://webrtc.org/) for live media. [PostgreSQL](https://www.postgresql.org/docs/) can hold membership and durable conversation metadata, [Redis](https://redis.io/docs/latest/) can manage short-lived presence and fan-out state, and object storage can hold attachments and recordings.

<div class="article-diagram">
  <img src="/images/diagrams/communication-and-collaboration-systems-implementation.svg" alt="One possible implementation for Exploring Communication and Collaboration Systems">
</div>

Search may use [OpenSearch](https://docs.opensearch.org/latest/), while collaborative documents need an established CRDT or operational transformation implementation rather than a custom merge algorithm. Encryption boundaries, retention rules, regional media routing, and required ordering should determine how these pieces are deployed.

## Identity and conversation membership are foundational

The system must define who can discover, join, invite, remove, read history, post, edit, and export. Membership changes should affect future access immediately and historical access according to an explicit policy.

<abbr title="Accounts accepted from another organization or identity provider through an agreed trust relationship">Federated identities</abbr> and guest identities add trust boundaries. Display names are not durable identity.

## Delivery has several meanings

Accepted by the server, delivered to a device, read by a person, and acted on are different states. Offline devices and retries create duplicates and reordering.

Stable message identifiers, ordering within each conversation, <abbr title="Send operations that can be retried without creating duplicate messages">idempotent sends</abbr>, <abbr title="Saved positions that let a device request only changes it has not received">synchronization cursors</abbr>, and conflict rules create a coherent history without claiming global ordering where none exists.

## Collaborative editing needs a merge model

<abbr title="A collaboration method that adjusts concurrent edits so they can be applied in a consistent order">Operational transformation</abbr>, <abbr title="Conflict free replicated data types: structures that merge concurrent changes without requiring one central edit order">CRDTs</abbr>, versioned patches, and locking offer different tradeoffs. The choice must cover concurrent edits, offline work, cursor presence, permissions, undo, comments, and large documents.

History should support recovery without turning every intermediate keystroke into permanent sensitive data.

## Live media has a latency budget

Voice and video systems balance delay, quality, bandwidth, CPU, device capability, and cost. <abbr title="Changing media quality as network capacity changes">Adaptive bitrate</abbr>, <abbr title="Short queues that smooth irregular packet arrival before audio or video is played">jitter buffers</abbr>, regional relays, network handoff, and useful fallback behavior protect continuity.

Captions, transcripts, keyboard controls, screen reader labels, and participation on limited bandwidth belong to the meeting experience.

## Privacy and abuse meet at scale

Encryption, key management, retention, <abbr title="A requirement to preserve specified records because of an investigation or legal obligation">legal holds</abbr>, spam prevention, reporting, blocking, moderation, and enterprise policy can pull in different directions. The product should state what is encrypted, who can access it, and what metadata remains visible.

Notifications need user control. A reliable system that demands attention continuously is not a good collaboration system.

## What changes with AI agents

Agents can summarize threads, find decisions, draft replies, capture actions, translate, or attend meetings. Their access should follow conversation membership and document permissions at retrieval time.

Participants need to know when an agent is present, what it records, where output is stored, and who can read it. Generated summaries should link back to source messages and allow correction.

Sending a message, accepting a meeting, or assigning work on someone's behalf requires clear delegation. Private context from one conversation must not silently influence another.

## Try the message delivery experiment

The [message delivery lab](https://github.com/ArpithaMurthy/system-design-experiments#collaboration) is a working prototype for durable send, deduplication, delivery, and read states. Its event history makes the difference between each acknowledgement visible and links to free WebSocket and collaborative-editing resources.

## Questions I am wondering about

1. What do sent, delivered, read, edited, and deleted mean?
2. How do devices converge after offline work?
3. Which collaboration model protects concurrent edits and undo?
4. How do privacy, retention, moderation, and legal requirements interact?
5. What remains usable on slow networks and assistive technology?
6. Can users see and control what an agent observed and did?

## What I want to remember

Communication systems hold human context as well as bytes. Delivery, ordering, membership, privacy, accessibility, and attention affect whether people can trust the space they share.