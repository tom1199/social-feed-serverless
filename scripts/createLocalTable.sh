aws dynamodb create-table \
    --endpoint-url http://localhost:8000 \
    --table-name Local-FeedTable \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=ownerId,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
        AttributeName=ownerId,KeyType=RANGE \
    --provisioned-throughput \
        ReadCapacityUnits=10,WriteCapacityUnits=5

aws dynamodb create-table \
    --endpoint-url http://localhost:8000 \
    --table-name Local-LikeTable \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=feedId,AttributeType=S \
        AttributeName=likedBy,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
        AttributeName=ownerId,KeyType=RANGE \
        AttributeName=likedBy,KeyType=RANGE \
    --provisioned-throughput \
        ReadCapacityUnits=10,WriteCapacityUnits=5