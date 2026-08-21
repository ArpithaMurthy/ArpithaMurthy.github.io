export default {
  "slug": "online-games-and-virtual-economies",
  "title": "Online game and virtual economy",
  "concerns": "Server authority · abuse controls · version compatibility · audit records · observability",
  "reference": [
    [
      "Game clients and platform networks"
    ],
    [
      "Identity and session gateway"
    ],
    [
      "Matchmaking and authoritative game servers"
    ],
    [
      "Results and progression"
    ],
    [
      "Economy ledger",
      "Social systems",
      "Live content"
    ],
    [
      "Analytics, safety, and player support"
    ]
  ],
  "implementation": [
    [
      [
        "Game client",
        "Unity"
      ]
    ],
    [
      [
        "Authoritative sessions",
        "Go + Agones"
      ]
    ],
    [
      [
        "Matchmaking",
        "Open Match"
      ],
      [
        "Short-lived session state",
        "Redis"
      ],
      [
        "Progression and economy",
        "PostgreSQL"
      ]
    ],
    [
      [
        "Live-operation events",
        "Apache Kafka"
      ]
    ]
  ]
};
