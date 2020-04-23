FROM  intelligentretail/base:latest

COPY ./people-counting /people-counting
RUN /bin/bash -c "chmod +x ./people-counting/exec_count.sh"

ENTRYPOINT [ "/bin/bash", "-c"]
CMD  ["./people-counting/exec_count.sh 1"]
