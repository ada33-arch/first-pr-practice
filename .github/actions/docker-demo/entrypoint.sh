#!/bin/sh
# args: from action.yml arrive as ordinary process arguments.
# `$#` expands to the number of arguments and `$@` expands to the supplied args.
echo "sha: $GITHUB_SHA"
printf '%d args:' "$#"
printf " '%s'" "$@"
printf '\n'
