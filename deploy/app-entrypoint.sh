#!/bin/sh
set -eu

read_secret_file() {
  var_name="$1"
  file_var_name="${var_name}_FILE"
  eval "file_path=\${$file_var_name:-}"

  if [ -n "$file_path" ]; then
    if [ ! -r "$file_path" ]; then
      echo "Secret file for $var_name is not readable: $file_path" >&2
      exit 1
    fi
    value="$(cat "$file_path")"
    export "$var_name=$value"
  fi
}

url_encode() {
  node -e "process.stdout.write(encodeURIComponent(process.argv[1] || ''))" "$1"
}

read_secret_file JWT_SECRET
read_secret_file MYSQL_PASSWORD
read_secret_file ADMIN_EMAIL
read_secret_file ADMIN_PASSWORD
read_secret_file ADMIN_NICKNAME

if [ -z "${DATABASE_URL:-}" ]; then
  : "${DATABASE_HOST:=mysql}"
  : "${DATABASE_PORT:=3306}"
  : "${DATABASE_NAME:=zhanjiang}"
  : "${DATABASE_USER:=zhanjiang}"

  if [ -z "${MYSQL_PASSWORD:-}" ]; then
    echo "MYSQL_PASSWORD or MYSQL_PASSWORD_FILE is required when DATABASE_URL is not set." >&2
    exit 1
  fi

  encoded_user="$(url_encode "$DATABASE_USER")"
  encoded_password="$(url_encode "$MYSQL_PASSWORD")"
  export DATABASE_URL="mysql://${encoded_user}:${encoded_password}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}"
fi

mkdir -p "${UPLOAD_DIR:-/app/public/upload}"

if [ "$(id -u)" = "0" ] && id nextjs >/dev/null 2>&1; then
  chown -R nextjs:nodejs "${UPLOAD_DIR:-/app/public/upload}"
  exec su-exec nextjs "$@"
fi

exec "$@"
