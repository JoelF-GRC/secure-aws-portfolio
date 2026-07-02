import os
import json
import boto3
from decimal import Decimal

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])
PARTITION_KEY = os.environ.get("PARTITION_KEY_VALUE", "resume")

def decimal_to_int(value):
    if isinstance(value, Decimal):
        return int(value)
    return value

def lambda_handler(event, context):
    # Optional: basic CORS support for browser
    headers = {
        "Access-Control-Allow-Origin": "https://joelflood.com",  # or "*" during testing
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    }

    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return {
            "statusCode": 204,
            "headers": headers,
            "body": ""
        }

    # Increment the visits counter atomically
    response = table.update_item(
        Key={"pk": PARTITION_KEY},
        UpdateExpression="ADD visits :inc",
        ExpressionAttributeValues={":inc": 1},
        ReturnValues="UPDATED_NEW"
    )

    visits = decimal_to_int(response["Attributes"]["visits"])

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({"visits": visits})
    }
