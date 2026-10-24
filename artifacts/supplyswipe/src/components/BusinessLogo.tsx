// Business logo image (object-fit contain). Never initials.

/* eslint-disable @next/next/no-img-element */
export function BusinessLogo({
  src,
  name,
  size = 44,
  className = "",
  style,
}: {
  src: string;
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      draggable={false}
      style={{ width: size, height: size, objectFit: "contain", flex: "none", ...style }}
      className={className}
    />
  );
}
