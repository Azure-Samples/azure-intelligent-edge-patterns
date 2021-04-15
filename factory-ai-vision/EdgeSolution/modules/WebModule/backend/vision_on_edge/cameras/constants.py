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
                "order": 1,
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
                "order": 1,
            }
        ],
    }
    template["dangerZones"][0]["id"] = str(uuid.uuid4())
    return json.dumps(template)


def gen_default_zones_esa():
    """gen_default_zones."""
    template = {
        "useDangerZone": True,
        "dangerZones": [
            {
                "id": "$UUID_PLACE_HOLDER",
                "type": "BBox",
                "label": {"x1": 415, "y1": 83, "x2": 513, "y2": 198},
                "order": 1,
            }
        ],
    }
    template["dangerZones"][0]["id"] = str(uuid.uuid4())
    return json.dumps(template)


def gen_default_zones_tcc():
    """gen_default_zones."""
    template = {
        "useDangerZone": True,
        "dangerZones": [
            {
                "id": "$UUID_PLACE_HOLDER",
                "type": "BBox",
                "label": {"x1": 0, "y1": 0, "x2": 960, "y2": 540},
                "order": 1,
            }
        ],
    }
    template["dangerZones"][0]["id"] = str(uuid.uuid4())
    return json.dumps(template)


def gen_default_zones_cqa():
    """gen_default_zones."""
    template = {
        "useDangerZone": True,
        "dangerZones": [
            # {
            #     "id": "$UUID_PLACE_HOLDER",
            #     "type": "Polygon",
            #     "label": [
            #         {"x": 463, "y": 275},
            #         {"x": 495, "y": 349},
            #         {"x": 301, "y": 440},
            #         {"x": 261, "y": 328},
            #     ],
            #     "order": 1,
            # }
        ],
    }
    # template["dangerZones"][0]["id"] = str(uuid.uuid4())
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
                "label": [{"x": 611, "y": 17}, {"x": 611, "y": 504}],
                "order": 1,
            }
        ],
    }
    template["countingLines"][0]["id"] = str(uuid.uuid4())
    return json.dumps(template)
