import React from "react";

type Props = React.SVGProps<SVGSVGElement>;

export const IconPlus = (p: Props) => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="2" strokeLinecap="round" d="M12 5v14M5 12h14" />
  </svg>
);
export const IconSearch = (p: Props) => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <circle cx="11" cy="11" r="7" strokeWidth="2" />
    <path strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5" />
  </svg>
);
export const IconEdit = (p: Props) => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="2" strokeLinecap="round" d="M12 20h9" />
    <path strokeWidth="2" d="M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z" />
  </svg>
);
export const IconEye = (p: Props) => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="2" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" strokeWidth="2" />
  </svg>
);
export const IconChevronLeft = (p: Props) => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="2" strokeLinecap="round" d="M15 19l-7-7 7-7" />
  </svg>
);
export const IconChevronRight = (p: Props) => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="2" strokeLinecap="round" d="M9 5l7 7-7 7" />
  </svg>
);
export const IconTrash = (p: Props) => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="2" strokeLinecap="round" d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
  </svg>
);
export const IconSave = (p: Props) => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="2" d="M5 3h11l5 5v13H5z" />
    <path strokeWidth="2" d="M7 3v6h8V3" />
  </svg>
);
export const IconArrowLeft = (p: Props) => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="2" strokeLinecap="round" d="M10 19l-7-7 7-7" />
    <path strokeWidth="2" strokeLinecap="round" d="M3 12h18" />
  </svg>
);
export const IconDownload = (p: Props) => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="2" strokeLinecap="round" d="M12 3v12" />
    <path strokeWidth="2" strokeLinecap="round" d="M7 10l5 5 5-5" />
    <path strokeWidth="2" d="M5 21h14" />
  </svg>
);

export const IconLock = (p: Props) => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <rect x="4" y="10" width="16" height="10" rx="2" strokeWidth="2" />
    <path d="M8 10V8a4 4 0 1 1 8 0v2" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconArrowRight = (p: Props) => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="2" strokeLinecap="round" d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);