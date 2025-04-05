import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import {
    AuthorizationType,
    CognitoUserPoolsAuthorizer,
    Cors,
    LambdaIntegration,
    MethodOptions,
    ResourceOptions,
    RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { IUserPool } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { CDKContext } from "../lib/types";

interface ApiStackProps extends StackProps {
    lambdaIntegration: LambdaIntegration;
    userPool: IUserPool;
    scopeResourceName: string;
}

export class ApiStack extends Stack {
    constructor(scope: Construct, id: string, context: CDKContext, props: ApiStackProps) {
        super(scope, id, props);

        const api = new RestApi(this, "AwsCognitoTutorialRestApi", {
            binaryMediaTypes: ["*/*"],
            deployOptions: {
                stageName: context.environment,
                throttlingRateLimit: 10,
                throttlingBurstLimit: 20,
            },
        });

        //Cognito authorizor
        const authorizer = new CognitoUserPoolsAuthorizer(this, "AwsCognitoTutorialRestApiAuthorizor", {
            cognitoUserPools: [props.userPool],
            identitySource: "method.request.header.Authorization",
        });
        authorizer._attachToApi(api);

        //Cognito options
        const optionsWithAuth: MethodOptions = {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: authorizer.authorizerId,
            },
            authorizationScopes: [
                //IMPORTANT! Must match server scopes in AuthStack!
                // `${context.environment}/test`,
                `${context.environment}/${props.scopeResourceName}`,
                // "aws.cognito.signin.user.admin",
                // "aws.cognito.signin.user.data",
                // "aws.cognito.signin.user.user",
            ],
        };

        //CORS options
        const optionsWithCors: ResourceOptions = {
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS,
            },
        };

        //base resource
        const resource = api.root.addResource(props.scopeResourceName, optionsWithCors);
        resource.addMethod("GET", props.lambdaIntegration, optionsWithAuth);

        new CfnOutput(this, "ApiOutput", {
            value: api.url,
        });
    }
}
