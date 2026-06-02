#!/usr/bin/env node
import { randomBytes } from "node:crypto";
import { constants } from "node:fs";
import { access, chmod, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const repoRoot = process.cwd();
const runtimeDir = path.join(repoRoot, "deploy", "runtime");
const secretsDir = path.join(runtimeDir, "secrets");
const force = process.argv.includes("--force");
const isInteractive = input.isTTY && output.isTTY;
let pipedAnswerIndex = 0;

const randomSecret = (bytes = 32) => randomBytes(bytes).toString("base64url");

const readAllInput = async () => {
  let data = "";
  for await (const chunk of input) {
    data += chunk.toString("utf8");
  }
  return data;
};

const pipedAnswers = isInteractive ? null : (await readAllInput()).split(/\r?\n/);

const nextPipedAnswer = () => {
  const answer = pipedAnswers?.[pipedAnswerIndex] ?? "";
  pipedAnswerIndex += 1;
  return answer.trim();
};

const exists = async (filePath) => {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const readHidden = async (rl, prompt) => {
  if (!isInteractive || typeof input.setRawMode !== "function") {
    output.write(prompt);
    const answer = nextPipedAnswer();
    output.write("\n");
    return answer;
  }

  if (!rl) {
    throw new Error("交互式输入初始化失败");
  }

  output.write(prompt);
  input.setRawMode(true);
  input.resume();

  let value = "";
  return new Promise((resolve) => {
    const onData = (buffer) => {
      const char = buffer.toString("utf8");
      if (char === "\u0003") {
        input.setRawMode(false);
        input.off("data", onData);
        output.write("\n");
        process.exit(130);
      }
      if (char === "\r" || char === "\n") {
        input.setRawMode(false);
        input.off("data", onData);
        output.write("\n");
        resolve(value.trim());
        return;
      }
      if (char === "\u007f") {
        value = value.slice(0, -1);
        return;
      }
      value += char;
      output.write("*");
    };

    input.on("data", onData);
  });
};

const askVisible = async (rl, label, fallback) => {
  const suffix = fallback ? `，留空默认 ${fallback}` : "，留空自动生成";
  if (!isInteractive) {
    output.write(`${label}${suffix}: \n`);
    const answer = nextPipedAnswer();
    return answer || fallback || randomSecret(24);
  }

  const value = (await rl.question(`${label}${suffix}: `)).trim();
  return value || fallback || randomSecret(24);
};

const askSecret = async (rl, label) => {
  const value = await readHidden(rl, `${label}，留空自动生成: `);
  return value || randomSecret(32);
};

const askOptionalSecret = async (rl, label) => (
  await readHidden(rl, `${label}，留空跳过配置: `)
);

const writeSecret = async (name, value) => {
  const filePath = path.join(secretsDir, name);
  if (!force && await exists(filePath)) {
    console.log(`保留已有 secret: deploy/runtime/secrets/${name}`);
    return false;
  }

  await writeFile(filePath, `${value}\n`, { mode: 0o600 });
  await chmod(filePath, 0o600);
  console.log(`写入 secret: deploy/runtime/secrets/${name}`);
  return true;
};

await mkdir(path.join(runtimeDir, "mysql"), { recursive: true });
await mkdir(path.join(runtimeDir, "uploads"), { recursive: true });
await mkdir(path.join(runtimeDir, "logs"), { recursive: true });
await mkdir(path.join(runtimeDir, "nginx", "certs"), { recursive: true });
await mkdir(secretsDir, { recursive: true, mode: 0o700 });
await chmod(secretsDir, 0o700);
await chmod(path.join(runtimeDir, "uploads"), 0o777);

console.log("初始化部署目录完成。数据库名和应用数据库用户固定为 zhanjiang。");
console.log("JWT_SECRET 将强随机生成，不从交互输入读取。");

const rl = createInterface({ input, output });
const mysqlRootPassword = await askSecret(rl, "MySQL root 密码");
const mysqlAppPassword = await askSecret(rl, "应用数据库密码");
const adminEmail = await askVisible(rl, "超级管理员邮箱", "admin@example.com");
const adminNickname = await askVisible(rl, "超级管理员昵称", "系统管理员");
const adminPassword = await askSecret(rl, "超级管理员密码");
const difyApiKey = await askOptionalSecret(rl, "Dify API Key");
rl.close();
const jwtSecret = randomSecret(64);

await writeSecret("mysql_root_password", mysqlRootPassword);
await writeSecret("mysql_app_password", mysqlAppPassword);
await writeSecret("admin_email", adminEmail);
await writeSecret("admin_nickname", adminNickname);
await writeSecret("admin_password", adminPassword);
await writeSecret("jwt_secret", jwtSecret);
await writeSecret("dify_api_key", difyApiKey);

console.log("");
console.log("部署初始化完成。下一步建议执行：");
console.log("  docker compose -f deploy/docker-compose.yml up -d mysql");
console.log("  docker compose -f deploy/docker-compose.yml run --rm migrate");
console.log("  docker compose -f deploy/docker-compose.yml run --rm admin-seed");
console.log("  docker compose -f deploy/docker-compose.yml up -d app");
console.log("Nginx 可参考 deploy/nginx/http.conf 或 deploy/nginx/https.conf 单独部署。");
console.log("如需由 compose 一起部署 Nginx 1.30.2，请先放置证书到 deploy/runtime/nginx/certs，再执行 pnpm deploy:up:nginx。");
