import json

from fastapi import FastAPI
from pydantic import BaseModel, Json

from cascade.voe_to_ovms import load_voe_config_from_dict, voe_config_to_ovms_config


app = FastAPI()

@app.get('/status')
def status():
    return 'ok'


class VoeConfigData(BaseModel):
    config: Json

@app.post('/set_voe_config')
def set_voe_config(voe_config_data: VoeConfigData):

    voe_config = load_voe_config_from_dict(voe_config_data.config)
    ovms_config = voe_config_to_ovms_config(voe_config)

    with open('../workspace/config.json', 'w+') as f:
        json.dump(ovms_config.dict(exclude_none=True), f)

    return 'ok'

