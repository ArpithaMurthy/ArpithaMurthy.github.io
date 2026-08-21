export default {
  "slug": "communication-and-collaboration-systems",
  "title": "Communication and collaboration system",
  "concerns": "Encryption · abuse controls · retention · audit records · accessibility · observability",
  "reference": [
    [
      "Web, mobile, and desktop clients"
    ],
    [
      "Identity and API gateway"
    ],
    [
      "Conversation and membership services"
    ],
    [
      "Message store",
      "Document synchronization",
      "Media relays"
    ],
    [
      "Search, notifications, and device sync"
    ]
  ],
  "implementation": [
    [
      [
        "Web client",
        "React"
      ]
    ],
    [
      [
        "Real-time communication",
        "WebSocket + WebRTC"
      ]
    ],
    [
      [
        "Membership and history",
        "PostgreSQL"
      ],
      [
        "Presence and fan-out",
        "Redis"
      ],
      [
        "Attachments",
        "Object storage"
      ],
      [
        "Search",
        "OpenSearch"
      ]
    ]
  ]
};
