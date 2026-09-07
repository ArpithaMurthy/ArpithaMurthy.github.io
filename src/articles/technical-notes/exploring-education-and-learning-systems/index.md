# Exploring Education and Learning Systems

Learning platforms connect students, educators, families, institutions, content, assessment, and credentials. Their success is not time spent in the app. It is whether people can learn, demonstrate understanding, receive useful support, and carry trustworthy progress forward.

```text
Content → Practice → Feedback → Understanding → Credential
Educator support → Practice, feedback, and understanding
```

## A reference architecture

Learning systems vary across schools, universities, workplaces, and independent study. A common component view is:

<div class="article-diagram">
  <img src="/images/diagrams/education-and-learning-systems-reference.svg" alt="Reference architecture for Exploring Education and Learning Systems">
</div>

Assessment, progress, and credentials need stronger integrity controls than ordinary content browsing. Institution and class membership must govern every API, export, and analytical view.

## One possible implementation

A practical starting point could use a [React progressive web app](https://react.dev/) for accessible, offline-capable learner experiences, [NestJS](https://docs.nestjs.com/) services for course and assessment workflows, [PostgreSQL](https://www.postgresql.org/docs/) for institutional and progress records, and object storage for versioned learning content and submissions. Background jobs can handle media processing, notifications, imports, and analytics without delaying interactive work.

<div class="article-diagram">
  <img src="/images/diagrams/education-and-learning-systems-implementation.svg" alt="One possible implementation for Exploring Education and Learning Systems">
</div>

Integrations should favor education standards such as [LTI](https://www.1edtech.org/standards/lti) and [OneRoster](https://www.1edtech.org/standards/oneroster). The exact products matter less than preserving tenant boundaries, content versions, accommodations, offline recovery, and auditable assessment changes.

## Model learning, not only content delivery

Courses, lessons, activities, submissions, feedback, mastery, and credentials have related but distinct lifecycles. Completion does not always mean understanding, and one score should not become the only representation of a learner.

The system should support revision, late work, accommodations, group work, instructor overrides, and appeals without losing history.

## Roles and institutions create complex boundaries

Students, guardians, teachers, assistants, administrators, and external evaluators have different permissions. A person may hold several roles across institutions.

<abbr title="Keeping each institution's data and operations separate from every other institution">Tenant isolation</abbr>, class membership, age protections, consent, and school transitions must apply to APIs, exports, search, analytics, and support tools.

## Assessment requires integrity and fairness

Question banks, randomized delivery, time limits, <abbr title="Supervision used to verify assessment conditions and discourage prohibited assistance">proctoring</abbr>, grading, moderation, and evaluation after an appeal need explicit rules. Controls should match the consequence of the assessment.

Accessibility and accommodations cannot be afterthoughts. Extra time, alternate formats, keyboard access, captions, readable mathematics, and assistive technology support must survive every delivery mode.

## Design for uneven connectivity and devices

Learners may share devices or rely on intermittent networks. Offline drafts, resumable uploads, small media alternatives, clear synchronization state, and experiences designed for limited bandwidth widen access.

Content needs versioning so that a past submission can be understood against the lesson and rubric visible at that time.

## Analytics should help rather than label

Progress data can identify where support may be useful, but predictions can encode unequal opportunity. Educators need context, uncertainty, and the ability to disagree.

Collect only signals with a clear educational purpose. Retention, research use, model training, and sharing need transparent policies, especially for children.

## What changes with AI agents

An agent can explain a concept differently, generate practice, translate material, summarize feedback, or help an educator prepare a lesson. The risk is replacing productive struggle with answer generation or presenting confident errors as instruction.

The product should distinguish tutoring, drafting, assessment, and grading contexts. It can reveal sources, ask the learner to explain reasoning, adapt hints, and give teachers visibility without turning education into surveillance.

Grading and disciplinary decisions with serious consequences need human accountability. Agent evaluation should measure learning outcomes, factuality, accessibility, age suitability, bias, and whether the system encourages understanding rather than dependency.

## Try the offline assessment experiment

The [assessment sync lab](https://github.com/ArpithaMurthy/system-design-experiments#education) is a working prototype for queueing an attempt offline, blocking an impossible sync, reconnecting, and deduplicating repeated uploads. It runs without an LMS account and links to free interoperability resources.

## Questions I am wondering about

1. What learning outcome is the product trying to improve?
2. How are revisions, accommodations, overrides, and appeals represented?
3. Does the experience work on shared, older, and intermittently connected devices?
4. Which analytics lead to useful support, and which merely classify people?
5. How are credentials issued, verified, corrected, and revoked?
6. Does AI help a learner think, or quietly do the thinking for them?

## What I want to remember

Education software should expand a learner's agency. Content, assessment, analytics, and AI are useful only when they support understanding, fairness, accessibility, and a trusted relationship with educators.