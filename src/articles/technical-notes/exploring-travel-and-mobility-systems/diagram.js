export default {
  "slug": "travel-and-mobility-systems",
  "title": "Travel and mobility system",
  "concerns": "Privacy · authorization · audit records · regional resilience · accessibility · observability",
  "reference": [
    [
      "Traveler, provider, operator, and support apps"
    ],
    [
      "Identity and journey APIs"
    ],
    [
      "Search, matching, and booking workflows"
    ],
    [
      "Location and maps",
      "Inventory and journey state",
      "Pricing and payment ledger"
    ],
    [
      "Provider adapters and event streams"
    ],
    [
      "Notifications, safety, and reconciliation"
    ]
  ],
  "implementation": [
    [
      [
        "Traveler and provider apps",
        "React Native"
      ]
    ],
    [
      [
        "Journey services",
        "Kotlin + Spring Boot"
      ]
    ],
    [
      [
        "Journeys and maps",
        "PostgreSQL + PostGIS"
      ],
      [
        "Live matching",
        "Redis"
      ],
      [
        "Event stream",
        "Apache Kafka"
      ]
    ],
    [
      [
        "Routing",
        "OR-Tools"
      ]
    ]
  ]
};
