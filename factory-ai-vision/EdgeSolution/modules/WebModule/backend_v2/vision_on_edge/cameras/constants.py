"""App utilies.
"""

import json
import uuid


def gen_default_lines():
    """gen_default_lines."""
    template = {
        "useCountingLine": True,
        "countingLines": [
            {
                "id": "$UUID_PLACE_HOLDER",
                "type": "Line",
                "label": [{"x": 229, "y": 215}, {"x": 916, "y": 255}],
            }
        ],
    }
    template["countingLines"][0]["id"] = str(uuid.uuid4())
    return json.dumps(template)


def gen_default_zones():
    """gen_default_zones."""
    template = {
        "useDangerZone": True,
        "dangerZones": [
            {
                "id": "$UUID_PLACE_HOLDER",
                "type": "BBox",
                "label": {"x1": 23, "y1": 58, "x2": 452, "y2": 502},
            }
        ],
    }
    template["dangerZones"][0]["id"] = str(uuid.uuid4())
    return json.dumps(template)


def gen_default_lines_dd():
    """gen_default_lines.

    Default lines for defect detection.
    """
    template = {
        "useCountingLine": True,
        "countingLines": [
            {
                "id": "$UUID_PLACE_HOLDER",
                "type": "Line",
                "label": [{"x": 910, "y": 17}, {"x": 910, "y": 504}],
            }
        ],
    }
    template["countingLines"][0]["id"] = str(uuid.uuid4())
    return json.dumps(template)
