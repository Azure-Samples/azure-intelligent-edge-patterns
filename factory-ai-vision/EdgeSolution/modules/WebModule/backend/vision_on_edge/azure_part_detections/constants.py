"""App Constants.
"""

INFERENCE_MODE_CHOICES = [
    ("PD", "part_detection"),
    ("PC", "part_counting"),
    ("ES", "employee_safety"),
    ("DD", "defect_detection"),
]

INFERENCE_PROTOCOL_CHOICES = [
    ("grpc", "grpc"),
    ("http", "http"),
]

INFERENCE_SOURCE_CHOICES = [
    ("lva", "lva"),  # Azure Live Video Analysis
    ("capture_module", "capture_module"),  # Self implemented Video Capture
]
