def load_classes(filename):
    with open(filename) as f:
        class_names = f.readlines()
    class_names = [c.strip() for c in class_names]
    return class_names


def postprocess(boxes, scores, classes, class_names):
    detectedObjects = []

    if len(classes) > 0:
        for i in range(len(classes)):
            idx = int(classes[i])
            temp = boxes[i]  # xmin, ymin, xmax, ymax

            dobj = {
                "type": "entity",
                "entity": {
                    "tag": {
                        "value": class_names[idx],
                        "confidence": str(scores[i].numpy())
                    },
                    "box": {
                        "l": str(temp[0].numpy()),  # xmin
                        "t": str(temp[1].numpy()),  # ymax (from top)
                        "w": str((temp[2]-temp[0]).numpy()),  # xmax-xmin
                        "h": str((temp[3]-temp[1]).numpy())  # ymax-ymin
                    }
                }
            }

            detectedObjects.append(dobj)

    return detectedObjects
