MODULES=`ls modules`

for MODULE in ${MODULES[@]}; do
    echo $MODULE
    cat modules/$MODULE/module.json | grep '"version"'
done
