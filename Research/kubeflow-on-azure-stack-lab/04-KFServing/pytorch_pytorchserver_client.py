#
# Based on KFServing PyTorch demo, https://github.com/kubeflow/kfserving/tree/master/docs/samples/pytorch
#

import torch
import torchvision
import torchvision.transforms as transforms
import requests

transform = transforms.Compose([transforms.ToTensor(),
                                    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))])
testset = torchvision.datasets.CIFAR10(root='./data', train=False,
                                               download=True, transform=transform)
testloader = torch.utils.data.DataLoader(testset, batch_size=4,
                                                 shuffle=False, num_workers=2)
dataiter = iter(testloader)
images, labels = dataiter.next()
formData = {
            'instances': images[0:1].tolist()
            }
res = requests.post('http://localhost:8080/v1/models/pytorchmodel:predict', json=formData)
print(res)
print(res.text)
