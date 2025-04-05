import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { CDKContext } from "../lib/types";

export class LambdaStack extends Stack {
    public readonly lambdaIntegration: LambdaIntegration;

    constructor(scope: Construct, id: string, context: CDKContext, props?: StackProps) {
        super(scope, id, props);

        const globalEnvs = {
            AWS_ENV: context.environment,
        };
        
        //API
        const cognitoTutorialApiLambda = new NodejsFunction(this, "AwsCognitoTutorialProfileApiLambda", {
            functionName: "cognitoTutorialApiHandler",
            runtime: Runtime.NODEJS_22_X,
            handler: "cognitoTutorialApiHandler",
            entry: "./lambda/cognitoTutorialApiHandler.ts",
            environment: {
                ...globalEnvs,
            },
            bundling: {
                minify: true,
            },
        });

        //APIGW integration
        this.lambdaIntegration = new LambdaIntegration(cognitoTutorialApiLambda);
    }
}
