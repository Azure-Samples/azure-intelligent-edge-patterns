# -*- coding: utf-8 -*-
"""App utilies.
"""

import json
import uuid


def gen_default_lines():
    """gen_default_lines.
    """
    template = {
        "useCountingLine":
            True,
        "countingLines": [{
            "id": "$UUID_PLACE_HOLDER",
            "type": "Line",
            "label": [{
                "x": 229,
                "y": 215
            }, {
                "x": 916,
                "y": 255
            }]
        }]
    }
    template['countingLines'][0]['id'] = str(uuid.uuid4())
    return json.dumps(template)


def gen_default_zones():
    """gen_default_zones.
    """
    template = {
        "useDangerZone":
            True,
        "dangerZones": [{
            "id": "$UUID_PLACE_HOLDER",
            "type": "BBox",
            "label": {
                "x1": 23,
                "y1": 58,
                "x2": 452,
                "y2": 502
            }
        }]
    }
    template['dangerZones'][0]['id'] = str(uuid.uuid4())
    return json.dumps(template)
