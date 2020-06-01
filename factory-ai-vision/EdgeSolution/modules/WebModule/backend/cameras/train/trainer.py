from azure.cognitiveservices.vision.customvision.training import CustomVisionTrainingClient

class Trainer:
    @staticmethod
    def dequeue_iterations(trainer: CustomVisionTrainingClient, custom_vision_project_id: str, max_iterations=2):
      """ Dequeue training iterations
      """
      iterations = trainer.get_iterations(custom_vision_project_id)
      if len(iterations) > max_iterations:
          trainer.delete_iteration(custom_vision_project_id, iterations[-1].as_dict()['id'])
