FEED_LIKED_BY_USER_TABLE=Local-FeedLikedByUserTable \
USER_LIKE_FEED_TABLE=Local-UserLikeFeedTable \
FEED_TABLE=Local-FeedTable \
USER_FOLLOW_TABLE=Local-FollowUserTable \
/home/ec2-user/.c9/bin/sam local start-api —skip-pull-image --docker-network lambda-local —template template.yml