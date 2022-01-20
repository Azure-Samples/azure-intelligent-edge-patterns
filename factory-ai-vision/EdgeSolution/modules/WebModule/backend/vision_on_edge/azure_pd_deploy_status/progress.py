"""App constants.
"""

PROGRESS_1_WATINING_PROJECT_TRAINED: dict = {
    "status": "waiting project trained",
    "log": "Waiting Project to be trained.",
}
PROGRESS_2_DEPLOYING: dict = {
    "status": "deploying",
    "log": "Deploying model to inference module.",
}

# Complete
PROGRESS_0_OK: dict = {"status": "ok", "log": "Model deployed."}

# Failed
PROGRESS_0_FAILED: dict = {"status": "failed", "log": "Any log"}
