"""Project Application Insight configs.

If APP_INSIGHT_ON, django will run middleware that send
backend message to Application Insight
"""

APP_INSIGHT_INST_KEY = "4c8b219e-5c92-4934-bd2c-62003fb061c4"
APP_INSIGHT_CONN_STR = f"InstrumentationKey={APP_INSIGHT_INST_KEY}"
