#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

usage() {
  cat <<'EOF'
Usage:
  create_issues.sh [--repo OWNER/REPO] [--label LABEL] [--dry-run]
EOF
}

require_bin() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

repo="$(git -C "$REPO_ROOT" remote get-url origin | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')"
dry_run=0
labels=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)
      repo="${2:-}"
      shift 2
      ;;
    --label)
      labels+=("${2:-}")
      shift 2
      ;;
    --dry-run)
      dry_run=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

require_bin gh
require_bin jq

fixture_path="$REPO_ROOT/fixtures/demo-issues.json"
labels_json="$(printf '%s\n' "${labels[@]:-}" | jq -R . | jq -s 'map(select(length > 0))')"

create_issue() {
  local title="$1"
  local body="$2"

  if [[ "$dry_run" -eq 1 ]]; then
    jq -nc --arg repo "$repo" --arg title "$title" --arg body "$body" --argjson labels "$labels_json" \
      '{repo: $repo, title: $title, body: $body, labels: $labels}'
    return
  fi

  local payload
  payload="$(jq -nc --arg title "$title" --arg body "$body" --argjson labels "$labels_json" '{title: $title, body: $body, labels: $labels}')"
  printf '%s' "$payload" | gh api "repos/$repo/issues" --method POST --input - --jq '"Created issue #\(.number): \(.title)"'
}

jq -c '.[]' "$fixture_path" | while IFS= read -r issue; do
  title="$(jq -r '.title' <<<"$issue")"
  body="$(jq -r '.body // ""' <<<"$issue")"
  create_issue "$title" "$body"
done
