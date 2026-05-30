export const AUTH_COOKIE_NAME = "auth_token";
export const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export const getAuthCookieOptions = (overrides = {}) => ({
  name: AUTH_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: AUTH_COOKIE_MAX_AGE,
  ...overrides,
});

export const setAuthCookie = (response, token) => {
  response.cookies.set(getAuthCookieOptions({ value: token }));
  return response;
};

export const clearAuthCookie = (response) => {
  response.cookies.set(getAuthCookieOptions({
    value: "",
    maxAge: 0,
  }));
  return response;
};
