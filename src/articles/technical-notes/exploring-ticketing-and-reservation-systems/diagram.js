export default {
  "slug": "ticketing-and-reservation-systems",
  "title": "Ticketing and reservation system",
  "concerns": "Fairness controls · idempotency · audit records · accessibility · observability",
  "reference": [
    [
      "Customer, provider, venue, and support apps"
    ],
    [
      "Identity and reservation APIs"
    ],
    [
      "Search, offer, and inventory services"
    ],
    [
      "Waiting room",
      "Holds and booking",
      "Pricing and rules"
    ],
    [
      "Payment and provider adapters"
    ],
    [
      "Confirmation, tickets, and reconciliation"
    ]
  ],
  "implementation": [
    [
      [
        "Customer and operator interfaces",
        "React"
      ]
    ],
    [
      [
        "Inventory and reservation APIs",
        "Go"
      ]
    ],
    [
      [
        "Authoritative holds",
        "PostgreSQL"
      ],
      [
        "Traffic controls",
        "Redis"
      ]
    ],
    [
      [
        "Booking events",
        "Apache Kafka"
      ]
    ],
    [
      [
        "Payments",
        "Stripe"
      ]
    ]
  ]
};
