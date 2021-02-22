import os
import json
import time
import torch

# Called when the deployed service starts
def init():
    global model
    global device

    # Get the path where the deployed model can be found.
    model_filename = 'obj_segmentation.pkl'
    model_path = os.path.join(os.environ['AZUREML_MODEL_DIR'], model_filename)

    device = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu')
    model = torch.load(model_path, map_location=device)

# Handle requests to the service
def run(data):
    try:
        start_at = time.time()
        inputs = json.loads(data)
        img_data_list = inputs["instances"]
        img_tensor_list = [torch.tensor(item) for item in img_data_list]
        model.eval()
        with torch.no_grad():
            predictions = model([item.to(device) for item in img_tensor_list])

        pred_data_list = [{
            "masks": prediction['masks'][0, 0].mul(255).byte().cpu().numpy().tolist(),
            "boxes": prediction['boxes'].numpy().tolist(),
            "labels": prediction['labels'].numpy().tolist(),
            "scores": prediction['scores'].numpy().tolist(),

        } for prediction in predictions]

        return {"predictions": pred_data_list,
                "elapsed_time": time.time() - start_at}

    except Exception as e:
        error = str(e)
        return error
