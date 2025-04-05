#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { LambdaStack } from "../infra/LambdaStack";
import { AuthStack } from "../infra/AuthStack";
import { ApiStack } from "../infra/ApiStack";
import { CDKContext } from "../lib/types";

const createStacks = async () => {
    try {
        const context: CDKContext = {
            environment: "dev"
        };

        const app = new App();

        const lambdaStack = new LambdaStack(app, "AwsCognitoTutorialLambdaStack", context);
        const authStack = new AuthStack(app, "AwsCognitoTutorialAuthStack", context);
        new ApiStack(app, "AwsCognitoTutorialApiStack", context, {
            lambdaIntegration: lambdaStack.lambdaIntegration,
            userPool: authStack.userPool,
            scopeResourceName: authStack.scopeResourceName
        });

        app.synth();
        return "CloudFormation stacks successfully created!";
    } catch (e) {
        return e;
    }
};

//init
createStacks()
    .then(message => console.log(message))
    .catch(e => console.error(e));