export default {
  "slug": "observability-and-log-analytics-platforms",
  "title": "Observability and log analytics platform",
  "concerns": "Schema evolution · tenant isolation · retention · cost controls · backpressure · observability",
  "reference": [
    [
      "Network elements, services, and devices"
    ],
    [
      "Agents, collectors, and gateways"
    ],
    [
      "Parse, validate, enrich, redact, and route"
    ],
    [
      "Buffer and durable ingestion"
    ],
    [
      "Hot query store",
      "Archive",
      "Analytics"
    ],
    [
      "Search, dashboards, alerts, and investigation"
    ]
  ],
  "implementation": [
    [
      [
        "Services, devices, and network elements",
        ""
      ]
    ],
    [
      [
        "Collection and routing",
        "OpenTelemetry Collector"
      ]
    ],
    [
      [
        "Durable ingestion",
        "Apache Kafka"
      ]
    ],
    [
      [
        "Logs and events",
        "ClickHouse"
      ],
      [
        "Metrics",
        "Prometheus"
      ],
      [
        "Archive",
        "Object storage"
      ]
    ],
    [
      [
        "Dashboards and investigation",
        "Grafana"
      ]
    ]
  ]
};
