# Exploring IoT and Industrial Systems

IoT and industrial products connect software to devices, sensors, buildings, vehicles, and machinery. A bug can waste energy, stop production, damage equipment, or affect physical safety, so cloud convenience must not replace local control and engineering discipline.

## Separate telemetry, commands, and control

Telemetry reports observed state. Commands request a change. Control loops continuously influence physical behavior. They have different latency, reliability, and safety requirements.

```text
Sensor → Local control → Equipment
   ↓          ↕
Gateway → Cloud monitoring and management
```

## A reference architecture

Connected systems vary from home devices to factories and critical infrastructure. This view keeps local control separate from cloud coordination:

<div class="article-diagram">
  <img src="/images/diagrams/iot-and-industrial-systems-reference.svg" alt="Reference architecture for Exploring IoT and Industrial Systems">
</div>

Physical safety should not depend on cloud availability. Commands from an app, automation, or an agent must pass through the same policy and local safety boundaries.

Control needed for physical safety should continue locally when cloud connectivity fails. The cloud can coordinate, analyze, and configure without becoming a single point of physical failure.

## One possible implementation

Device and gateway software could use [Rust](https://doc.rust-lang.org/book/) where memory safety and constrained deployment matter, [MQTT](https://mqtt.org/mqtt-specification/) for bounded device messaging, and [Apache Kafka](https://kafka.apache.org/documentation/) for durable cloud-side telemetry streams. [TimescaleDB](https://docs.timescale.com/) can support operational time-series queries while object storage retains lower-cost historical data.

<div class="article-diagram">
  <img src="/images/diagrams/iot-and-industrial-systems-implementation.svg" alt="One possible implementation for Exploring IoT and Industrial Systems">
</div>

Fleet services can run on managed compute or [Kubernetes](https://kubernetes.io/docs/) when scale and operational ownership justify it. Hardware support, deterministic local behavior, signed updates, protocol lifetime, and recovery in the field should drive the choice; a cloud stack cannot compensate for unsafe device control.

## Device identity begins at manufacture

Each device needs a verifiable identity, secure provisioning, credentials with only the required permissions, rotation, revocation, and ownership transfer. Shared default passwords and permanent secrets turn one compromise into a fleet problem.

<abbr title="Protected hardware that stores or verifies cryptographic identity and keys">Hardware roots of trust</abbr>, signed firmware, <abbr title="A startup process that runs only software verified by a trusted signature">secure boot</abbr>, encrypted communication, and protected debug interfaces reduce the attack surface.

## State is delayed and partially observed

A dashboard may show the last reported state, not current physical truth. Timestamps, sequence numbers, quality indicators, clock drift, and freshness should remain visible.

Commands need <abbr title="Responses confirming that a command was received or completed">acknowledgements</abbr>, expiry, idempotency, and safe defaults. Repeating “unlock” or “increase temperature” is not equivalent to retrying a read.

## Fleet updates need years of compatibility

Devices may be offline for months and remain deployed for decades. Firmware and configuration updates need staged rollout, hardware compatibility, bandwidth limits, rollback or recovery partitions, and a path for unsupported devices.

Inventory should track model, firmware, ownership, location, health, certificates, and support status without exposing sensitive deployment details.

## Design for constrained and hostile environments

Networks may be slow, intermittent, expensive, or shared. <abbr title="Temporarily storing data near the device until a reliable connection is available">Edge buffering</abbr>, compression, delayed forwarding after connectivity returns, bounded queues, and local diagnostics help systems recover.

Physical access changes the threat model. Safety interlocks and manual controls should not depend solely on remote software.

## What changes with AI agents

Agents may diagnose anomalies, summarize fleet health, propose maintenance, or optimize energy. They should not bypass deterministic safety envelopes or send unbounded commands based on generated reasoning.

An agent can recommend. A policy and control layer checks device, site, operating mode, limits, and approval before execution. Changes with serious physical risk need simulation, staged rollout, confirmation, and an emergency stop.

Model drift and sensor drift can look alike, so predictions need evidence and comparison with physical inspection.

## Try the device command experiment

The [offline command lab](https://github.com/ArpithaMurthy/system-design-experiments#iot) is a working prototype for queueing an expiring command and safely discarding it when a device reconnects too late. It requires no physical device or broker and points to free MQTT tooling for a real extension.

## Questions I am wondering about

1. What must continue safely without cloud connectivity?
2. How are devices provisioned, transferred, rotated, and revoked?
3. Can users distinguish reported, desired, and physical state?
4. Are commands bounded, expiring, idempotent, and auditable?
5. How can a failed fleet update recover remotely and locally?
6. What deterministic envelope constrains actions generated by AI?

## What I want to remember

Connected devices turn software behavior into physical consequences. Local safety, verifiable identity, honest state, recoverable updates, and ownership over many years must survive far beyond a normal web release cycle.