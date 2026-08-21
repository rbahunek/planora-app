import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 18, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export const IconDashboard = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

export const IconProjects = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
  </svg>
);

export const IconTeams = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M16 6.5a3 3 0 0 1 0 5.5M21 20a6 6 0 0 0-4-5.7" />
  </svg>
);

export const IconTasks = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="m8 12 2.5 2.5L16 9" />
  </svg>
);

export const IconTime = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconFeedback = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2Z" />
  </svg>
);

export const IconUsers = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>
);

export const IconAudit = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3 4 6v5c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const IconLogout = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 17 5 12l5-5M5 12h11" />
  </svg>
);

export const IconMenu = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const IconClose = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconPlus = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconChevronRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const IconCalendar = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v3M16 3v3" />
  </svg>
);

export const IconTag = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 3h7l11 11-7 7L3 10Z" />
    <circle cx="7.5" cy="7.5" r="1.3" />
  </svg>
);

export const IconArrowLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M15 6l-6 6 6 6M9 12h11" />
  </svg>
);

export const IconTrend = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </svg>
);
