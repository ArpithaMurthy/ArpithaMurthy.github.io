export default {
  "slug": "healthcare-systems",
  "title": "Healthcare system",
  "concerns": "Provenance · audit records · privacy · safety checks · downtime procedures · observability",
  "reference": [
    [
      "Patient, clinician, pharmacy, and administrator apps"
    ],
    [
      "Identity, consent, and access"
    ],
    [
      "Clinical workflow services"
    ],
    [
      "Patient record and documents",
      "Orders, results, and decision support",
      "Scheduling and billing"
    ],
    [
      "Interoperability and messaging"
    ],
    [
      "Labs, pharmacies, payers, and partners"
    ]
  ],
  "implementation": [
    [
      [
        "Patient and clinician apps",
        "React"
      ]
    ],
    [
      [
        "Clinical workflow APIs",
        "Java + Spring Boot"
      ]
    ],
    [
      [
        "Clinical records",
        "PostgreSQL"
      ],
      [
        "Documents and images",
        "Object storage"
      ],
      [
        "Integration events",
        "Apache Kafka"
      ]
    ],
    [
      [
        "Clinical exchange",
        "FHIR + DICOM"
      ]
    ]
  ]
};
