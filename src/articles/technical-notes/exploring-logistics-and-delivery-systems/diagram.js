export default {
  "slug": "logistics-and-delivery-systems",
  "title": "Logistics and delivery system",
  "concerns": "Custody history · offline sync · privacy · audit records · exception handling · observability",
  "reference": [
    [
      "Customer, warehouse, driver, and operator apps"
    ],
    [
      "Identity and operational APIs"
    ],
    [
      "Order, inventory, and shipment state"
    ],
    [
      "Warehouse systems",
      "Routing and fleet",
      "Carrier adapters"
    ],
    [
      "Event ingestion and evidence store"
    ],
    [
      "Tracking, notifications, and reconciliation"
    ]
  ],
  "implementation": [
    [
      [
        "Warehouse and driver apps",
        "React Native + local DB"
      ]
    ],
    [
      [
        "Shipment services",
        "Kotlin + Spring Boot"
      ]
    ],
    [
      [
        "Operational and map data",
        "PostgreSQL + PostGIS"
      ],
      [
        "Scan and partner events",
        "Apache Kafka"
      ],
      [
        "Routing",
        "OR-Tools"
      ],
      [
        "Evidence",
        "Object storage"
      ]
    ]
  ]
};
