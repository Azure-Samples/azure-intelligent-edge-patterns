# OVMS related API

## Get Dfault OVMS Model

**`GET` `/get_default_ovms_model`**

### Usage

#### Success 200

| Field                                         | Type     | Description                         |
| --------------------------------------------- | -------- | ----------------------------------- |
| model_infos                                   | Object[] | List of infos of default OVMS model |
| &nbsp;&nbsp;&nbsp;&nbsp;model_name            | string   | the name of model                   |
| &nbsp;&nbsp;&nbsp;&nbsp;model_type            | string   | the type of model                   |
| &nbsp;&nbsp;&nbsp;&nbsp;classes               | array    | labels of model                     |
| &nbsp;&nbsp;&nbsp;&nbsp;description_title     | string   | the title of description of model   |
| &nbsp;&nbsp;&nbsp;&nbsp;description_content   | string   | the content of description of model |
| &nbsp;&nbsp;&nbsp;&nbsp;description_image_url | string   | the image url of description        |

## Add OVMS Model

**`POST` `/add_ovms_model`**

### Usage


### Parameter

| Field      | Type   | Description                    |
| ---------- | ------ | ------------------------------ |
| model_name | string | the name of default OVMS model |

```bash
# example
{
   "model_name": "face_detection"
}
```

#### Success 200

| Field      | Type   | Description                    |
| ---------- | ------ | ------------------------------ |
| model_name | string | the name of default OVMS model |
| type       | string | the type of model              |
| url        | string | the endpoint of model          |

```bash
# example
{
   "model_name": "face_detection",
   "type": "ovms",
   "url": "ovmsmodule:9010"
}
```

#### Error 4xx

| Field         | Description                                                      |
| ------------- | ---------------------------------------------------------------- |
| ModelNotExist | The Model does not exist. Please contact staff for further help. |
