"""App Constants.
"""

INFERENCE_MODE_CHOICES = [
    ("PD", "part_detection"),
    ("PC", "part_counting"),
    ("ES", "employee_safety"),
    ("DD", "defect_detection"),
    ("ESA", "empty_shelf_alert"),
    ("TCC", "total_customer_counting"),
    ("CQA", "crowded_queue_alert"),
]

INFERENCE_PROTOCOL_CHOICES = [
    ("grpc", "grpc"),
    ("http", "http"),
]

INFERENCE_SOURCE_CHOICES = [
    ("lva", "lva"),  # Azure Live Video Analysis
    ("capture_module", "capture_module"),  # Self implemented Video Capture
]
