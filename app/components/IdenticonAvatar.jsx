"use client";

import { createIdenticonDataUrl } from "../../lib/identicon.mjs";

const IdenticonAvatar = ({
  src,
  seed,
  alt = "avatar",
  className,
  style,
  ...props
}) => {
  const avatarSrc = src || createIdenticonDataUrl(seed);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatarSrc}
      alt={alt}
      className={className}
      style={style}
      {...props}
    />
  );
};

export default IdenticonAvatar;
