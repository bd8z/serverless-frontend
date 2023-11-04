const { DynamoDBClient, PutItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb")
const { GetObjectCommand, S3Client } = require ("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const client = new DynamoDBClient({ region: "ap-northeast-1" });
const s3Client = new S3Client({ region: "ap-northeast-1" });
const TABLE_NAME = process.env.DYNAMODB_TALBENAME
const URL = process.env.APIURL
const apiPath = process.env.APIPATH
const bucketName = process.env.BUCKETNAME01
const imageKey = process.env.IMAGE_KEY01
const partitionKey = process.env.PARTITION_KEY

exports.handler = async (event) => {
    switch (event.httpMethod) {
        case "GET":
            return getItems();
        case "POST":
            return addItem(event);
        default:
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "text/html",
                },
                body: "<p>Invalid method</p>",
            };
    }
};

const getItems = async () => {
    const command = new ScanCommand({ TableName: TABLE_NAME });
    const data = await client.send(command);

    // 署名付きURLを取得
    const s3command = new GetObjectCommand({
        Bucket: bucketName,
        Key: imageKey
    });
    const imageUrl = await getSignedUrl(s3Client, s3command, { expiresIn: 3600 });

    let body = `<form action="${URL}${apiPath}" method="post" enctype="application/x-www-form-urlencoded">
        <input type="text" name="data" placeholder="Enter data" required />
        <button type="submit">Add</button>
        </form>
        <img src="${imageUrl}" alt="S3 Image" /><br><br>
        <table border="1"><tr><th>ID</th><th>Data</th></tr>`;

    
    data.Items.forEach(item => {
        body += `<tr><td>${item[partitionKey]["S"]}</td><td>${item.data.S}</td></tr>`;
    });
    body += "</table>";

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "text/html",
        },
        body: body,
    };
};

const addItem = async (event) => {
    var Item_ = {}
    Item_[partitionKey] = { S: Date.now().toString() }
    Item_["data"] = { S: unescape(event.body.split('=')[1]) }
    const command = new PutItemCommand({
        TableName: TABLE_NAME,
        Item: Item_,
    });

    await client.send(command);

    return {
        statusCode: 303,
        headers: {
            "Location": "/" + apiPath,
            "Content-Type": "text/html",
        },
        body: "",
    };
};