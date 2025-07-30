#!/bin/bash
cd /home/kavia/workspace/code-generation/javascript-playground-42535-42544/javascript_playground_backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

