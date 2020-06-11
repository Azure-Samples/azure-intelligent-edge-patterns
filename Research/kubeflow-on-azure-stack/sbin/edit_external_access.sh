#!/bin/bash
#
# This script helps to edit the ingress behaviour
# 

kubectl edit -n istio-system svc/istio-ingressgateway
echo "run ./get_kf_board_ip.sh to see the external IP when it becomes available(could take a minute)"
