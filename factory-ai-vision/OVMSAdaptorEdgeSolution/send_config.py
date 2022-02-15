import json
import requests

j = json.load(open('voe_config.json'))
js = json.dumps(j)

requests.post('http://YOUR_DEVICE_IP:8585/set_voe_config', json={'config': js})
