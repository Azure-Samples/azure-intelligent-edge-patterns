FROM  intelligentretail/base:latest

COPY ./eye-tracking /eye-tracking
RUN /bin/bash -c "chmod +x ./eye-tracking/eye_track.sh"

ENTRYPOINT [ "/bin/bash", "-c"]
CMD  ["./eye-tracking/eye_track.sh track-eyes.py --port 5002"]
