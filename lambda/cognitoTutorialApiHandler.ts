import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const cognitoTutorialApiHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let res: APIGatewayProxyResult;
    try {
        switch (event.httpMethod) {
            case "GET":
                res = {
                    statusCode: 200,
                    body: JSON.stringify({ message: "GET success..." })
                };
                break;
            case "POST":
                res = {
                    statusCode: 201,
                    body: JSON.stringify({ message: "POST success..." })
                };
                break;
            case "PUT":
                res = {
                    statusCode: 201,
                    body: JSON.stringify({ message: "PUT success..." })
                };
                break;
            case "DELETE":
                res = {
                    statusCode: 200,
                    body: JSON.stringify({ message: "DELETE success..." })
                };
                break;
            default:
                res = {
                    statusCode: 400,
                    body: JSON.stringify({ message: "HTTP method not implemented..." })
                };
                break;
        }
    } catch (e) {
        res = {
            statusCode: 500,
            body: JSON.stringify({ error: e })
        };
    }
    return new Promise(resolve => resolve(res));
};
