#!/bin/bash
VAR=$(uuidgen);
ARR=(${VAR//-/ });
VAR=${ARR[0]};

TMP_BACKET=bd8z-temporary;
PACKEGE_ZIP="file-${VAR}.zip";
zip -r -j $PACKEGE_ZIP src;
aws s3api put-object --bucket "${TMP_BACKET}" --key "${PACKEGE_ZIP}" --body $PACKEGE_ZIP;
aws cloudformation create-stack --stack-name "stack-${VAR}" --capabilities CAPABILITY_NAMED_IAM --template-body file://templateV2.yaml --parameters ParameterKey=UUID,ParameterValue=${VAR} ParameterKey=LambdaCodeKey,ParameterValue=${PACKEGE_ZIP} ParameterKey=LambdaCodeBucket,ParameterValue=${TMP_BACKET};