MODULES_DIR="../EdgeSolution/modules"
MODULES=`ls $MODULES_DIR`

for MODULE in ${MODULES[@]}; do
    echo $MODULE
    cat $MODULES_DIR/$MODULE/module.json | grep '"version"'
done
