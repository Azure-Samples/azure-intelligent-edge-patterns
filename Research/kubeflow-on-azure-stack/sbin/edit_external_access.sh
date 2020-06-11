#!/bin/bash
#
# This script helps to edit the ingress behaviour
# 

kubectl edit -n istio-system svc/istio-ingressgateway
echo "You need to run \"./get_kf_board_ip.sh\" to see the external IP when it becomes available(could take a minute)"

read -r -p "Would you like to run it now? [Y/n] " input
 
case $input in
    [yY][eE][sS]|[yY])
         ./get_kf_board_ip.sh
         ;;
    [nN][oO]|[nN])
         echo "To run manually:"
         echo ""
         echo "  $ kubectl get -w -n istio-system svc/istio-ingressgateway"
         echo ""
         ;;
    *)
    echo "Invalid input..."
    echo "To run manually:"
    echo "  ./get_kf_board_ip.sh"

 exit 1
 ;;
esac

