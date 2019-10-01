#! /bin/bash

echo $1 | sed 's@&#34;@"@g' | jq -r 'fromjson | .properties.scmUri' | sed 's@[[:space:]]*$@@g'