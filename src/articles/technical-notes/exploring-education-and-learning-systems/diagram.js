export default {
  "slug": "education-and-learning-systems",
  "title": "Education and learning system",
  "concerns": "Accessibility · consent · privacy · audit records · content versions · offline recovery",
  "reference": [
    [
      "Learner, educator, guardian, and administrator apps"
    ],
    [
      "Identity and institution policy"
    ],
    [
      "Course and learning services"
    ],
    [
      "Content delivery and practice",
      "Assessment and feedback",
      "Progress and credentials"
    ],
    [
      "Analytics, notifications, and integrations"
    ]
  ],
  "implementation": [
    [
      [
        "Learner and educator clients",
        "React PWA"
      ]
    ],
    [
      [
        "Course and assessment APIs",
        "NestJS"
      ]
    ],
    [
      [
        "Records",
        "PostgreSQL"
      ],
      [
        "Content",
        "Object storage"
      ],
      [
        "Background jobs and analytics",
        "Worker queue"
      ],
      [
        "Integrations",
        "LTI + OneRoster"
      ]
    ]
  ]
};
