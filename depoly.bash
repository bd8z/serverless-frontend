#!/bin/bash
VAR=$(uuidgen);
ARR=(${VAR//-/ });
VAR=${ARR[0]};

# create-stack
aws cloudformation create-stack --stack-name "stack-${VAR}" --capabilities CAPABILITY_NAMED_IAM --template-body file://template.yaml --parameters ParameterKey=UUID,ParameterValue=${VAR};