export default {
  "slug": "enterprise-saas-products",
  "title": "Enterprise SaaS product",
  "concerns": "Tenant isolation · authorization · audit · quotas · observability · retention · regional controls",
  "reference": [
    [
      "Web, mobile, partner, and administrator clients"
    ],
    [
      "Identity and tenant routing"
    ],
    [
      "Product domain services"
    ],
    [
      "Tenant configuration",
      "Records and search",
      "Jobs and workflows"
    ],
    [
      "Integration and event layer"
    ],
    [
      "Customer and partner systems"
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
        "Enterprise identity",
        "OpenID Connect + SCIM"
      ]
    ],
    [
      [
        "Tenant-aware APIs",
        "ASP.NET Core"
      ]
    ],
    [
      [
        "Transactional records",
        "PostgreSQL"
      ],
      [
        "Bounded cache",
        "Redis"
      ],
      [
        "Permission-filtered search",
        "OpenSearch"
      ],
      [
        "Durable workflows",
        "Temporal"
      ]
    ]
  ]
};
