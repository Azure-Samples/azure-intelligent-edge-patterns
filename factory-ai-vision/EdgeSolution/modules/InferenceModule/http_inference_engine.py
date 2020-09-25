class HttpInferenceEngine:
    def __init__(self, stream_manager):
        self.stream_manager = stream_manager

    def predict(self, cam_id, img):
        stream = self.stream_manager.get_stream_by_id(cam_id)
        print(cam_id, flush=True)
        if not stream:
            predicitons = []
            print("[INFO] Stream not ready yet", flush=True)
            return []
        else:
            try:
                stream.predict(img)
                predictions = stream.last_prediction
                print(predictions, flush=True)
            except:
                print("[ERROR] Unexpected error:", sys.exc_info(), flush=True)

            results = []
            for prediction in predictions:
                tag_name = prediction["tagName"]
                confidence = prediction["probability"]
                box = {
                    "l": prediction["boundingBox"]["left"],
                    "t": prediction["boundingBox"]["top"],
                    "w": prediction["boundingBox"]["width"],
                    "h": prediction["boundingBox"]["height"],
                }
                results.append(
                    {
                        "type": "entity",
                        "entity": {
                            "tag": {"value": tag_name, "confidence": confidence},
                            "box": box,
                        },
                    }
                )
            return results
