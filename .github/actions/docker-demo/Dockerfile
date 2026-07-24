# Container image that runs your code. Alpine keeps the CI image build fast
# (the docs' debian:9.5-slim example is long EOL).
FROM alpine:3.20

COPY entrypoint.sh /entrypoint.sh

# Belt-and-braces: the exec bit is also committed to git, but setting it in
# the image never depends on the checkout's file modes.
RUN chmod +x /entrypoint.sh

# Exec form does no shell processing — env vars like $GITHUB_SHA are expanded
# inside entrypoint.sh, not here.
ENTRYPOINT ["/entrypoint.sh"]
