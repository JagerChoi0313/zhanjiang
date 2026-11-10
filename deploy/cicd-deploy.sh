#!/usr/bin/env bash
set -euo pipefail
umask 077
APP_IMAGE=${1:?application image required}
TOOL_IMAGE=${2:?tooling image required}
ACTOR=${3:?registry actor required}
[[ "$APP_IMAGE" =~ ^ghcr.io/jagerchoi0313/zhanjiang-app:[0-9a-f]{40}$ ]]
[[ "$TOOL_IMAGE" =~ ^ghcr.io/jagerchoi0313/zhanjiang-tooling:[0-9a-f]{40}$ ]]
cd /home/caixypromise/apps/zhanjiang
exec 9>deploy/.cicd.lock
flock -n 9 || { echo 'Another deployment is running'; exit 1; }
export DOCKER_CONFIG
DOCKER_CONFIG=$(mktemp -d)
trap 'rm -rf "$DOCKER_CONFIG"' EXIT
docker login ghcr.io -u "$ACTOR" --password-stdin
if [[ "${4:-false}" == "true" ]]; then
  docker image inspect "$APP_IMAGE" "$TOOL_IMAGE" > /dev/null
elif [[ "${4:-false}" == "direct" ]]; then
  for image in "$APP_IMAGE" "$TOOL_IMAGE"; do
    env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy NO_PROXY="*" no_proxy="*" skopeo copy --src-authfile "$DOCKER_CONFIG/config.json" "docker://$image" "docker-daemon:$image"
  done
else
  docker pull "$APP_IMAGE"
  docker pull "$TOOL_IMAGE"
fi
BASE=deploy/docker-compose.yml
OVERRIDE=deploy/docker-compose.ghcr.yml
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p deploy/backups
OLD_IMAGE=$(docker inspect deploy-app-1 --format '{{.Image}}')
ROLLBACK_IMAGE="zhanjiang-rollback:$STAMP"
docker tag "$OLD_IMAGE" "$ROLLBACK_IMAGE"
if [[ -f "$OVERRIDE" ]]; then cp "$OVERRIDE" "deploy/backups/compose-$STAMP.yml"; fi
# Abort before migration if a consistent logical backup cannot be produced.
docker compose -f "$BASE" exec -T mysql sh -ec 'export MYSQL_PWD="$(cat /run/secrets/mysql_root_password)"; exec mysqldump -uroot --single-transaction --no-tablespaces --routines --events --triggers zhanjiang' | gzip > "deploy/backups/db-$STAMP.sql.gz"
gzip -t "deploy/backups/db-$STAMP.sql.gz"
cat > "$OVERRIDE.next" <<YAML
services:
  app:
    image: $APP_IMAGE
  migrate:
    image: $TOOL_IMAGE
YAML
mv "$OVERRIDE.next" "$OVERRIDE"
DC=(docker compose -f "$BASE" -f "$OVERRIDE")
"${DC[@]}" config --quiet
"${DC[@]}" run --rm --no-deps --pull never migrate
rollback() {
  echo 'Application update failed; restoring previous app image (database is not rolled back automatically)'
  sed "s|image: $APP_IMAGE|image: $ROLLBACK_IMAGE|" "$OVERRIDE" > "$OVERRIDE.next"
  mv "$OVERRIDE.next" "$OVERRIDE"
  "${DC[@]}" up -d --no-deps --no-build app
}
if ! "${DC[@]}" up -d --no-deps --no-build --wait --wait-timeout 180 app; then rollback; exit 1; fi
if ! curl --fail --silent --show-error http://127.0.0.1:3000/API/Health; then rollback; exit 1; fi
printf '\nDeployed %s; backup: deploy/backups/db-%s.sql.gz\n' "$APP_IMAGE" "$STAMP"
"${DC[@]}" ps
