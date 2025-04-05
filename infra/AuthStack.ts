import { CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import {
    CfnUserPoolGroup,
    OAuthScope,
    ResourceServerScope,
    UserPool,
    UserPoolResourceServer,
} from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { CDKContext } from "../lib/types";

export class AuthStack extends Stack {
    public userPool: UserPool;
    public scopeResourceName: string;

    constructor(scope: Construct, id: string, context: CDKContext, props?: StackProps) {
        super(scope, id, props);

        //user pool
        this.userPool = new UserPool(this, "AwsCognitoTutorialUserPool", {
            selfSignUpEnabled: true,
            signInAliases: {
                username: true,
                email: true,
            },
        });
        new CfnOutput(this, "AwsCognitoTutorialUserPoolId", {
            value: this.userPool.userPoolId,
        });

        //domain
        this.userPool.addDomain("AwsCognitoTutorialUserPoolDomain", {
            cognitoDomain: {
                domainPrefix: `tutorial-user-pool-${context.environment}`,
            },
        });
        new CfnOutput(this, "AwsCognitoTutorialUserPoolDomainId", {
            value: this.userPool.userPoolProviderUrl,
        });

        //user pool groups
        new CfnUserPoolGroup(this, "AwsCognitoTutorialAdminPoolGroup", {
            userPoolId: this.userPool.userPoolId,
            groupName: "admin",
        });
        new CfnUserPoolGroup(this, "AwsCognitoTutorialUserPoolGroup", {
            userPoolId: this.userPool.userPoolId,
            groupName: "user",
        });

        //app client for client credentials
        const apiServerScope = new ResourceServerScope({
            scopeName: "test",
            scopeDescription: "test scope",
        });

        //pass to global for use in ApiStack
        this.scopeResourceName = apiServerScope.scopeName;

        /**
         * Important: Matches up with MethodOptions.authorizationScopes in API Gateway stack
         */
        const resourceServer = new UserPoolResourceServer(this, "ClientCredentialsResourceServer", {
            identifier: context.environment,
            userPool: this.userPool,
            scopes: [apiServerScope],
        });

        //api client
        this.userPool.addClient("AwsCognitoTutorialUserPoolClient", {
            generateSecret: true,
            enableTokenRevocation: true,
            accessTokenValidity: Duration.minutes(60),
            refreshTokenValidity: Duration.days(1),
            oAuth: {
                flows: {
                    clientCredentials: true,
                },
                scopes: [
                    //one for each scope defined above
                    OAuthScope.resourceServer(resourceServer, apiServerScope),
                ],
            },
            authFlows: {
                adminUserPassword: true,
                userPassword: true,
                userSrp: true,
                custom: true,
            },
        });
    }
}
