import { useEffect, useRef, useState } from "react";

const ElectricBorder = ({
  children,
  primaryColor = "#ed1c24",
  secondaryColor = "rgba(237, 28, 36, 0.2)", // Utilisé pour un effet de halo
  speed = 1,
  chaos = 0.12, // Utilisé pour faire varier l'opacité
  thickness = 2,
  style = {},
  className = "",
}) => {
  const containerRef = useRef(null);
  const [path, setPath] = useState("");

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const r = style.borderRadius || 16;
        setPath(
          `M${r},0 H${width - r} A${r},${r} 0 0 1 ${width},${r} V${height - r} A${r},${r} 0 0 1 ${width - r},${height} H${r} A${r},${r} 0 0 1 0,${height - r} V${r} A${r},${r} 0 0 1 ${r},0 Z`,
        );
      }
    };

    updatePath();
    window.addEventListener("resize", updatePath);
    return () => window.removeEventListener("resize", updatePath);
  }, [style.borderRadius]);

  return (
    <div
      ref={containerRef}
      className={`electric-border-container ${className}`}
      style={{
        position: "relative",
        padding: thickness,
        ...style,
      }}
    >
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          overflow: "visible",
        }}
      >
        {/* On utilise secondaryColor pour un trait de fond statique */}
        <path
          d={path}
          fill="none"
          stroke={secondaryColor}
          strokeWidth={thickness}
        />
        {/* Le trait animé principal */}
        <path
          d={path}
          fill="none"
          stroke={primaryColor}
          strokeWidth={thickness}
          strokeDasharray="100 300"
          style={{
            animation: `electric-move ${3 / speed}s linear infinite, electric-flicker ${chaos}s infinite alternate`,
          }}
        />
      </svg>

      <style>{`
        @keyframes electric-move {
          from { stroke-dashoffset: 400; }
          to { stroke-dashoffset: 0; }
        }
        /* Utilisation de 'chaos' pour un léger scintillement électrique */
        @keyframes electric-flicker {
          0% { opacity: 1; stroke-width: ${thickness}; }
          100% { opacity: ${1 - chaos}; stroke-width: ${thickness + 1}; }
        }
      `}</style>

      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
};

export default ElectricBorder;
