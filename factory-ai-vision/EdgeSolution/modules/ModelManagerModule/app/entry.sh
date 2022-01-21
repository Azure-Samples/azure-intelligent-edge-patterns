cp -R /app/workspace/* /workspace
uvicorn main:app --port 8585 --host 0.0.0.0
