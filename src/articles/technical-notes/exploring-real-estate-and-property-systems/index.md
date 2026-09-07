# Exploring Real Estate and Property Systems

Real estate products connect listings, ownership, identity, money, documents, geography, and physical processes that may span years. Property search may look like ordinary discovery, but rentals, mortgages, transactions, and maintenance carry legal and financial consequences.

```text
Property record → Listing → Search and viewing → Agreement
Property record → Provenance
Listing → Availability
Search and viewing → Verification
Agreement → Documents
```

## A reference architecture

Property systems vary across rentals, sales, mortgages, and management. A common component view is:

<div class="article-diagram">
  <img src="/images/diagrams/real-estate-and-property-systems-reference.svg" alt="Reference architecture for Exploring Real Estate and Property Systems">
</div>

Search indexes and estimates may be stale. Availability, terms, identity, signatures, and payment state must be checked again by the authoritative transaction workflow.

## One possible implementation

A property product could use [Next.js](https://nextjs.org/docs) for public search and account journeys, [ASP.NET Core](https://learn.microsoft.com/aspnet/core/) for listing and transaction APIs, and [PostgreSQL](https://www.postgresql.org/docs/) with [PostGIS](https://postgis.net/documentation/) for property, boundary, and proximity data. [OpenSearch](https://docs.opensearch.org/latest/) can provide faceted discovery, while object storage preserves photos, disclosures, and signed documents.

<div class="article-diagram">
  <img src="/images/diagrams/real-estate-and-property-systems-implementation.svg" alt="One possible implementation for Exploring Real Estate and Property Systems">
</div>

Electronic signatures may use a provider such as [DocuSign](https://developers.docusign.com/docs/), but the product still owns document versions, authority, status, and reconciliation. Public-record quality, regional law, fair-housing controls, and long retention periods should shape the implementation more than framework preference.

## A property needs identity and history

Addresses are not stable unique identifiers. Units split or merge, formats vary, and one place may have several official references.

The model should distinguish property, building, unit, <abbr title="A legally defined piece of land recorded for ownership and taxation">parcel</abbr>, listing, occupancy, owner, and transaction. <abbr title="Information about where a fact came from and how it changed over time">Provenance</abbr> matters when facts come from agents, public records, owners, inspectors, or estimates.

## Listings are claims with a lifecycle

Draft, active, under offer, leased, sold, withdrawn, and expired states need clear authority. Photos, dimensions, amenities, price, availability, and disclosures can become stale.

Duplicate and fraudulent listings require verification, reporting, evidence, and correction. Search indexes may lag, but commitment workflows must revalidate availability and terms.

## Search is geographic and personal

Map boundaries, commute, schools, accessibility, cost, and neighborhood attributes affect discovery. Ranking should separate relevance, sponsorship, and platform incentives.

Sensitive inferences and protected characteristics require care. Personalization and advertising should not recreate discriminatory steering.

## Transactions are document workflows

Applications, identity checks, offers, deposits, inspections, financing, signatures, closing, rent, and maintenance each have states and deadlines.

Documents need access control, versioning, signatures, retention, and a complete audit trail. Payment and escrow records need idempotency and reconciliation.

## Property assets outlast software releases

Ownership, leases, warranties, inspections, and maintenance span years. Migrations must preserve historical meaning. Integrations with public records, lenders, property managers, contractors, and utilities will disagree and need reconciliation.

## What changes with AI agents

Agents could compare properties, schedule viewings, summarize documents, prepare applications, or coordinate maintenance. They should cite source listings and distinguish verified facts from estimates or generated interpretation.

Submitting an offer, application, signature, payment, or notice needs explicit authority and confirmation. Agents must not infer or use protected characteristics to steer choices.

The direct app remains useful for map exploration, document review, permission management, and disputes where visual and legal context matter.

## Try the verified listing experiment

The [listing lifecycle lab](https://github.com/ArpithaMurthy/system-design-experiments#real-estate) is a working prototype for verifying and publishing one version of a property claim, then invalidating that verification after a material edit. It links to free geospatial data and tooling.

## Questions I am wondering about

1. How are property identity, units, listings, and ownership distinguished?
2. Which facts are verified, estimated, stale, or disputed?
3. How are ranking and advertising prevented from discriminatory steering?
4. Can every document, signature, payment, and deadline be reconstructed?
5. How are records kept for many years migrated and reconciled with partners?
6. Which agent actions require legal review or fresh human confirmation?

## What I want to remember

Property software represents places and commitments that outlive the application. Provenance, fair discovery, durable documents, and clear authority matter as much as search speed.