"""App constants.
"""

PROGRESS_1_FINDING_PROJECT: dict = {
    "status": "Finding project",
    "log": "Finding Project on Custom Vision.",
}
PROGRESS_2_PROJECT_FOUND: dict = {
    "status": "Uploading project",
    "log": "Project found on Custom Vision.",
}
PROGRESS_2_PROJECT_CREATED: dict = {
    "status": "Uploading project",
    "log": "Creating project on Custom Vision.",
}

PROGRESS_3_UPLOADING_PARTS: dict = {
    "status": "Uploading parts",
    "log": "Uploading parts to Custom Vision.",
}
PROGRESS_4_UPLOADING_IMAGES: dict = {
    "status": "Uploading images",
    "log": "Uploading images to Custom Vision.",
}
PROGRESS_5_SUBMITTING_TRAINING_TASK: dict = {
    "status": "Preparing training task",
    "log": "Submitting training task to Custom Vision.",
}
PROGRESS_6_PREPARING_CUSTOM_VISION_ENV: dict = {
    "status": "Preparing custom vision environment",
    "log": "Preparing Custom Vision Environment.",
}
PROGRESS_7_TRAINING: dict = {
    "status": "Training",
    "log": "Training on Custom Vision (may take 10-15 minutes).",
}
PROGRESS_8_EXPORTING: dict = {
    "status": "Exporting",  # Change line
    "log": "Exporting model.",
}
# Complete
PROGRESS_0_OK: dict = {"status": "ok", "log": "Model trained."}
PROGRESS_9_SUCCESS: dict = {"status": "Success", "log": "Model trained."}
PROGRESS_10_NO_CHANGE: dict = {"status": "No change", "log": "Project not changed. Not Training!"}

# Failed
