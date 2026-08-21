export default {
  "slug": "ai-products-and-agent-platforms",
  "title": "AI product and agent platform",
  "concerns": "Permissions · redaction · cost limits · audit records · human review · safe fallback behavior",
  "reference": [
    [
      "Web, mobile, and business applications"
    ],
    [
      "Identity and product APIs"
    ],
    [
      "Agent or model workflow"
    ],
    [
      "Retrieval and approved data",
      "Policy and tool execution",
      "Model gateway and providers"
    ],
    [
      "Evaluation and tracing"
    ]
  ],
  "implementation": [
    [
      [
        "Product interface",
        "React"
      ]
    ],
    [
      [
        "Model and tool APIs",
        "FastAPI"
      ]
    ],
    [
      [
        "App and retrieval data",
        "PostgreSQL + pgvector"
      ],
      [
        "Approved sources",
        "Object storage"
      ],
      [
        "Ingestion and evaluation",
        "Job queue"
      ]
    ],
    [
      [
        "Tracing",
        "OpenTelemetry"
      ]
    ]
  ]
};
