"""Project Application Insight configs.

If APP_INSIGHT_ON, django will run middleware that send
backend message to Application Insight
"""

APP_INSIGHT_INST_KEY = 'c192ed15-f8a9-4adb-8c17-44e0f8c3d3cd'
APP_INSIGHT_CONN_STR = f'InstrumentationKey={APP_INSIGHT_INST_KEY}'
