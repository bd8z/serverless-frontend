#!/bin/bash
VAR=$(uuidgen);
ARR=(${VAR//-/ });
VAR=${ARR[0]};

TMP_BACKET=bd8z-temporary;
aws cloudformation package --template templateV3.yaml --s3-bucket $TMP_BACKET --output-template-file templateV3_out.yaml
aws cloudformation create-stack --stack-name "stack-${VAR}" --capabilities CAPABILITY_NAMED_IAM --template-body file://templateV3_out.yaml --parameters ParameterKey=UUID,ParameterValue=${VAR}