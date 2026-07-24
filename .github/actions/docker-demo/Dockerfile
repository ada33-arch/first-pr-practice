# Container image that runs your code. debian:12-slim is the modern successor
# of the docs' long-EOL debian:9.5-slim example; glibc-based, so anything that
# misbehaves on musl (alpine) works here at the cost of a larger image.
FROM debian:12-slim

COPY entrypoint.sh /entrypoint.sh

# Belt-and-braces: the exec bit is also committed to git, but setting it in
# the image never depends on the checkout's file modes.
RUN chmod +x /entrypoint.sh

# Exec form does no shell processing — env vars like $GITHUB_SHA are expanded
# inside entrypoint.sh, not here.
ENTRYPOINT ["/entrypoint.sh"]
