const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let csrfTokenPromise;

export const getCsrfToken = async () => {
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetch("/API/auth/Csrf", {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.success || !payload.data?.token) {
          throw new Error(payload.message || "CSRF令牌获取失败");
        }
        return payload.data.token;
      })
      .catch((error) => {
        csrfTokenPromise = undefined;
        throw error;
      });
  }

  return csrfTokenPromise;
};

export const csrfFetch = async (input, options = {}) => {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);

  if (UNSAFE_METHODS.has(method)) {
    headers.set("x-csrf-token", await getCsrfToken());
  }

  return fetch(input, {
    ...options,
    method,
    credentials: options.credentials ?? "include",
    headers,
  });
};
