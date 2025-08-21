import React, { ReactNode } from "react";
import { useTheme, themeUtils } from "../theme";

export interface BrutalistCardProps {
  children: ReactNode;
  color?: "neonYellow" | "neonPink" | "neonGreen" | "neonMint" | "cobalt";
  header?: string;
  meta?: string;
  rightIcon?: ReactNode;
  className?: string;
  onPress?: () => void;
  style?: React.CSSProperties;
}

export function BrutalistCard({
  children,
  color = "neonYellow",
  header,
  meta,
  rightIcon,
  className = "",
  onPress,
  style,
  ...props
}: BrutalistCardProps) {
  const { colors, radius, spacing, fonts } = useTheme();

  const cardStyles: React.CSSProperties = {
    backgroundColor: colors[color],
    borderRadius: radius.xl,
    padding: spacing["2xl"], // 20px
    position: "relative",
    overflow: "hidden",
    cursor: onPress ? "pointer" : "default",
    transition: "transform 0.12s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    ...style,
  };

  const headerStyles: React.CSSProperties = {
    ...fonts.display,
    color: colors.black,
    margin: 0,
    marginBottom: meta ? spacing.xs : spacing.md,
  };

  const metaStyles: React.CSSProperties = {
    ...fonts.body,
    color: themeUtils.withOpacity(colors.black, 0.7),
    margin: 0,
    marginBottom: spacing.md,
    fontSize: 13,
  };

  const contentStyles: React.CSSProperties = {
    color: colors.black,
    position: "relative",
    zIndex: 1,
  };

  const rightIconStyles: React.CSSProperties = {
    position: "absolute",
    top: spacing["2xl"],
    right: spacing["2xl"],
    zIndex: 2,
    opacity: 0.8,
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (onPress) {
      const target = e.currentTarget as HTMLElement;
      target.style.transform = "scale(0.98)";
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (onPress) {
      const target = e.currentTarget as HTMLElement;
      target.style.transform = "scale(1)";
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (onPress) {
      const target = e.currentTarget as HTMLElement;
      target.style.transform = "scale(1)";
    }
  };

  return (
    <div
      style={cardStyles}
      className={`brutalist-card ${className}`}
      onClick={handlePress}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      role={onPress ? "button" : undefined}
      tabIndex={onPress ? 0 : undefined}
      onKeyDown={(e) => {
        if (onPress && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onPress();
        }
      }}
      {...props}
    >
      {rightIcon && (
        <div style={rightIconStyles} className="brutalist-card__right-icon">
          {rightIcon}
        </div>
      )}

      <div style={contentStyles}>
        {header && (
          <h2 style={headerStyles} className="brutalist-card__header">
            {header}
          </h2>
        )}

        {meta && (
          <p style={metaStyles} className="brutalist-card__meta">
            {meta}
          </p>
        )}

        <div className="brutalist-card__content">{children}</div>
      </div>
    </div>
  );
}

export default BrutalistCard;
