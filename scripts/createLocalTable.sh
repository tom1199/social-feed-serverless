# aws dynamodb delete-table --endpoint-url http://localhost:8000 --table-name Local-FeedTable
aws dynamodb create-table \
    --endpoint-url http://localhost:8000 \
    --table-name Local-FeedTable \
    --attribute-definitions \
        AttributeName=ownerId,AttributeType=S \
        AttributeName=createdAt,AttributeType=N \
    --key-schema \
        AttributeName=ownerId,KeyType=HASH \
        AttributeName=createdAt,KeyType=RANGE \
    --provisioned-throughput \
        ReadCapacityUnits=10,WriteCapacityUnits=5

# aws dynamodb delete-table --endpoint-url http://localhost:8000 --table-name Local-UserTable
aws dynamodb create-table \
    --endpoint-url http://localhost:8000 \
    --table-name Local-UserTable \
    --attribute-definitions \
        AttributeName=userId,AttributeType=S \
        AttributeName=userName,AttributeType=S \
    --key-schema \
        AttributeName=userId,KeyType=HASH \
        AttributeName=userName,KeyType=RANGE \
    --provisioned-throughput \
        ReadCapacityUnits=10,WriteCapacityUnits=5

# aws dynamodb delete-table --endpoint-url http://localhost:8000 --table-name Local-UserLikeFeedTable
aws dynamodb create-table \
    --endpoint-url http://localhost:8000 \
    --table-name Local-UserLikeFeedTable \
    --attribute-definitions \
        AttributeName=userId,AttributeType=S \
        AttributeName=feedId,AttributeType=S \
    --key-schema \
        AttributeName=userId,KeyType=HASH \
        AttributeName=feedId,KeyType=RANGE \
    --provisioned-throughput \
        ReadCapacityUnits=5,WriteCapacityUnits=5

# aws dynamodb delete-table --endpoint-url http://localhost:8000 --table-name Local-FeedLikedByUserTable
aws dynamodb create-table \
    --endpoint-url http://localhost:8000 \
    --table-name Local-FeedLikedByUserTable \
    --attribute-definitions \
        AttributeName=feedId,AttributeType=S \
        AttributeName=userId,AttributeType=S \
    --key-schema \
        AttributeName=feedId,KeyType=HASH \
        AttributeName=userId,KeyType=RANGE \
    --provisioned-throughput \
        ReadCapacityUnits=5,WriteCapacityUnits=5
        
# aws dynamodb delete-table --endpoint-url http://localhost:8000 --table-name Local-FollowUserTable
aws dynamodb create-table \
    --endpoint-url http://localhost:8000 \
    --table-name Local-FollowUserTable \
    --attribute-definitions \
        AttributeName=userId,AttributeType=S \
        AttributeName=followedUserId,AttributeType=S \
    --key-schema \
        AttributeName=userId,KeyType=HASH \
        AttributeName=followedUserId,KeyType=RANGE \
    --provisioned-throughput \
        ReadCapacityUnits=5,WriteCapacityUnits=5