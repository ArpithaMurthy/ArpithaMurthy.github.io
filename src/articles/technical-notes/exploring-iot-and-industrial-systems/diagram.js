export default {
  "slug": "iot-and-industrial-systems",
  "title": "IoT and industrial system",
  "concerns": "Device identity · signed software · policy · audit records · observability · manual recovery",
  "reference": [
    [
      "Sensors and equipment"
    ],
    [
      "Local controller and safety interlocks"
    ],
    [
      "Site gateway and local buffer"
    ],
    [
      "Secure device messaging"
    ],
    [
      "Device registry, telemetry, and commands"
    ],
    [
      "Fleet updates",
      "Analytics",
      "Operator apps"
    ]
  ],
  "implementation": [
    [
      [
        "Devices and site gateways",
        "Rust"
      ]
    ],
    [
      [
        "Secure device messaging",
        "MQTT"
      ]
    ],
    [
      [
        "Cloud telemetry stream",
        "Apache Kafka"
      ]
    ],
    [
      [
        "Operational time series",
        "TimescaleDB"
      ],
      [
        "Historical archive",
        "Object storage"
      ]
    ],
    [
      [
        "Fleet services",
        "Managed compute or Kubernetes"
      ]
    ]
  ]
};
