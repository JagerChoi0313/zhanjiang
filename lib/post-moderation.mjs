import { ApiValidationError } from "./api-validation.mjs";

const DEFAULT_BLOCKED_TERMS = ["出售银行卡", "代办假证", "出售身份证", "刷单返利", "博彩代理", "人肉搜索"];
const normalize = (value) => value.normalize("NFKC").toLowerCase().replace(/[\s\p{P}\p{Cf}]/gu, "");

export function assertPostContent(title, description) {
  const customTerms = (process.env.POST_BLOCKED_TERMS ?? "").split(/[,，\n]/u);
  const terms = [...DEFAULT_BLOCKED_TERMS, ...customTerms].map(normalize).filter(Boolean);
  for (const [label, value] of [["标题", title], ["正文", description]]) {
    const content = normalize(value);
    if (terms.some(term => content.includes(term))) {
      throw new ApiValidationError(`${label}含有社区限制发布的内容，请修改后再发布。`);
    }
  }
}
