"""Project Application Insight configs.

If APP_INSIGHT_ON, django will run middleware that send
backend message to Application Insight
"""
import os

APP_INSIGHT_INST_KEY = ""
APP_INSIGHT_INST_KEY = os.environ.get('APPLICATIONINSIGHTS_INSTRUMENTATION_KEY', APP_INSIGHT_INST_KEY)
APP_INSIGHT_CONN_STR = f"InstrumentationKey={APP_INSIGHT_INST_KEY}"
