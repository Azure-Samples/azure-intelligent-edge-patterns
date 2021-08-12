# OVMS related API

## Get Default OVMS Model

**`POST` `/get_default_ovms_model`**

### Usage


### Parameter

| Field | Type   | Description           |
| ----- | ------ | --------------------- |
| model_name | string | the name of default OVMS model |

```bash
# example
{
   "model_name": "face_detection"
}
```

#### Success 200

| Field  | Type  | Description |
| ------ | ----- | ----------- |
| model_name | string | the name of default OVMS model |
| type | string | the type of model |
| url | string | the endpoint of model |

```bash
# example
{
   "model_name": "face_detection",
   "type": "ovms",
   "url": "ovms-server:9010"
}
```

#### Error 4xx

| Field | Description |
| ----- | ----------- |
| ModelNotExist | The Model does not exist. Please contact staff for further help. |
