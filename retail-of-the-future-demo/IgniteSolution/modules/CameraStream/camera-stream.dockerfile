FROM  intelligentretail/base:latest

COPY ./camera-stream /camera-stream
RUN /bin/bash -c "chmod +x ./camera-stream/run_camera.sh"

ENTRYPOINT [ "/bin/bash", "-c"]
CMD  ["./camera-stream/run_camera.sh camera.py rtsp://admin:IgniteDemo2019@10.0.0.213/cam/realmonitor?channel=1?subtype=1"]
