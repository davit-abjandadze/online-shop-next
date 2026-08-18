import React from "react";

export interface RefIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/* Colorful, illustrative icon set used across the referendum site (Header / Footer / Home / QuestionCard) */

export const BallotIcon: React.FC<RefIconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <rect x="3" y="9" width="18" height="12" rx="2" fill="#0347a0" />
    <rect x="3" y="9" width="18" height="3" rx="1" fill="#6085b5" />
    <path d="M8 4h8a1 1 0 011 1v5H7V5a1 1 0 011-1z" fill="#E4E6EB" />
    <path d="M9.5 14.5l1.6 1.6L14.5 12.7" stroke="#FAD400" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FireIcon: React.FC<RefIconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M12 2c1 3-2.5 4.2-2.5 7.2A3.5 3.5 0 0013 12.7c1.7 0 2.8-1.2 3-2.7 1.3 1.4 2 3 2 4.7 0 3.9-2.7 6.8-6 6.8s-6-2.9-6-6.8C6 9.9 8.7 6.3 12 2z" fill="#F43E50" />
    <path d="M12 22c-1.9 0-3.5-1.6-3.5-3.9 0-1.9 1.3-3.3 2-4.4.2 1.1 1 1.9 2 1.9 1.2 0 2-1 2-2.2.9 1 1.5 2.4 1.5 3.9 0 2.4-1.6 4.7-4 4.7z" fill="#FAD400" />
  </svg>
);

export const ClipboardIcon: React.FC<RefIconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <rect x="5" y="4" width="14" height="17" rx="2" fill="#ffffff" stroke="#1877F2" strokeWidth="1.6" />
    <rect x="9" y="2.5" width="6" height="3.5" rx="1" fill="#1877F2" />
    <path d="M8 10h8M8 13.5h8M8 17h5" stroke="#65676B" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const TagIcon: React.FC<RefIconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M11.6 3.2l7.2 7.2a2 2 0 010 2.8l-6.6 6.6a2 2 0 01-2.8 0l-7.2-7.2a2 2 0 01-.6-1.4V4.4a1.2 1.2 0 011.2-1.2h7.4c.5 0 1 .2 1.4.6z" fill="#FAD400" />
    <circle cx="7.5" cy="7.5" r="1.6" fill="#ffffff" />
  </svg>
);

export const SearchIcon: React.FC<RefIconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="10.5" cy="10.5" r="6.5" fill="#E7F3FF" stroke="#1877F2" strokeWidth="1.8" />
    <path d="M15.5 15.5L20 20" stroke="#65676B" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const UserIcon: React.FC<RefIconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="12" cy="8" r="4" fill="#1877F2" />
    <path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" fill="#4293FA" />
  </svg>
);

export const ChartIcon: React.FC<RefIconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <rect x="3" y="3" width="18" height="18" rx="3" fill="#F0F2F5" />
    <rect x="6.5" y="13" width="3" height="5.5" rx="1" fill="#1877F2" />
    <rect x="10.5" y="9" width="3" height="9.5" rx="1" fill="#30C582" />
    <rect x="14.5" y="6" width="3" height="12.5" rx="1" fill="#FAD400" />
  </svg>
);

export const KeyIcon: React.FC<RefIconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="8" cy="15" r="4.5" fill="#FAD400" />
    <rect x="11" y="9" width="10" height="3.2" rx="1.4" transform="rotate(45 11 9)" fill="#1877F2" />
    <circle cx="8" cy="15" r="1.6" fill="#ffffff" />
  </svg>
);

export const LogoutIcon: React.FC<RefIconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <rect x="3" y="3" width="10" height="18" rx="2" fill="#F0F2F5" />
    <path d="M11 12h9m0 0l-3-3m3 3l-3 3" stroke="#F43E50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronDownIcon: React.FC<RefIconProps> = ({ size = 16, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M6 9l6 6 6-6" stroke="#65676B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const StarIcon: React.FC<RefIconProps & { filled?: boolean }> = ({ size = 22, className, style, filled }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path
      d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 2.8z"
      fill={filled ? "#FAD400" : "#F0F2F5"}
      stroke={filled ? "#e1bf00" : "#B0B3B8"}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);

export const CheckSquareIcon: React.FC<RefIconProps> = ({ size = 18, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <rect x="3" y="3" width="18" height="18" rx="4" fill="#1877F2" />
    <path d="M7.5 12.5l2.7 2.7 6-6.4" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const RadioIcon: React.FC<RefIconProps> = ({ size = 18, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="12" cy="12" r="9" fill="#ffffff" stroke="#1877F2" strokeWidth="2" />
    <circle cx="12" cy="12" r="4.2" fill="#1877F2" />
  </svg>
);

export const PeopleIcon: React.FC<RefIconProps> = ({ size = 18, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="8.5" cy="8" r="3.2" fill="#1877F2" />
    <circle cx="16" cy="9" r="2.6" fill="#4293FA" />
    <path d="M3 19c0-3.3 2.5-5.4 5.5-5.4s5.5 2.1 5.5 5.4" fill="#1877F2" />
    <path d="M13.5 19c.2-2.6 1.8-4.4 4-4.9 2 .6 3.5 2.3 3.5 4.9" fill="#4293FA" />
  </svg>
);

export const LockIcon: React.FC<RefIconProps> = ({ size = 18, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <rect x="4" y="10.5" width="16" height="10" rx="2.5" fill="#65676B" />
    <path d="M7.5 10.5V7a4.5 4.5 0 019 0v3.5" stroke="#65676B" strokeWidth="2" fill="none" />
    <circle cx="12" cy="15.2" r="1.7" fill="#ffffff" />
  </svg>
);

export const UndoIcon: React.FC<RefIconProps> = ({ size = 18, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M6 8.5H15a5 5 0 010 10H9" stroke="#1877F2" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <path d="M9.5 5L6 8.5l3.5 3.5" stroke="#1877F2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const HourglassIcon: React.FC<RefIconProps> = ({ size = 16, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M6 3h12M6 21h12" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" />
    <path d="M7 3c0 4 3 5 5 6-2 1-5 2-5 6h10c0-4-3-5-5-6 2-1 5-2 5-6H7z" fill="#FFEDD5" stroke="#C2410C" strokeWidth="1.5" />
  </svg>
);

export const CheckCircleIcon: React.FC<RefIconProps> = ({ size = 16, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="12" cy="12" r="10" fill="#30C582" />
    <path d="M7.5 12.3l3 3 6-6.6" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SunIcon: React.FC<RefIconProps> = ({ size = 20, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="12" cy="12" r="5" fill="#FAD400" />
    <g stroke="#FAD400" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8" />
    </g>
  </svg>
);

export const MoonIcon: React.FC<RefIconProps> = ({ size = 20, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path
      d="M20 14.5A8.5 8.5 0 119.5 4a7 7 0 1010.5 10.5z"
      fill="#4293FA"
    />
  </svg>
);

export const CloseIcon: React.FC<RefIconProps> = ({ size = 18, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="12" cy="12" r="10" fill="#F0F2F5" />
    <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#65676B" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const PlusIcon: React.FC<RefIconProps> = ({ size = 18, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="12" cy="12" r="10" fill="#1877F2" />
    <path d="M12 7.5v9M7.5 12h9" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const EditIcon: React.FC<RefIconProps> = ({ size = 18, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M4 20l1-4.5L15.5 5l3.5 3.5L8.5 19l-4.5 1z" fill="#FAD400" stroke="#e1bf00" strokeWidth="1" />
    <path d="M14 6.5l3.5 3.5" stroke="#1877F2" strokeWidth="1.6" />
  </svg>
);

export const TrashIcon: React.FC<RefIconProps> = ({ size = 18, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M5 7h14l-1.2 13.1A2 2 0 0115.8 22H8.2a2 2 0 01-2-1.9L5 7z" fill="#F43E50" />
    <path d="M9 4.5a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0115 4.5V7H9V4.5z" fill="#F0F2F5" />
    <path d="M3.5 7h17" stroke="#F0F2F5" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const PlayIcon: React.FC<RefIconProps> = ({ size = 18, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="12" cy="12" r="10" fill="#30C582" />
    <path d="M10 8.3v7.4a.7.7 0 001.05.6l6-3.7a.7.7 0 000-1.2l-6-3.7A.7.7 0 0010 8.3z" fill="#ffffff" />
  </svg>
);

export const PauseIcon: React.FC<RefIconProps> = ({ size = 18, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="12" cy="12" r="10" fill="#8A8D91" />
    <rect x="9" y="8" width="2.2" height="8" rx="1" fill="#ffffff" />
    <rect x="12.8" y="8" width="2.2" height="8" rx="1" fill="#ffffff" />
  </svg>
);

export const WarningIcon: React.FC<RefIconProps> = ({ size = 18, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M12 2.5l10.5 18.5H1.5L12 2.5z" fill="#FFCB47" />
    <rect x="11" y="9" width="2" height="6" rx="1" fill="#7c4a03" />
    <circle cx="12" cy="17.5" r="1.2" fill="#7c4a03" />
  </svg>
);

export const ShieldIcon: React.FC<RefIconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M12 2.5l8 3v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10v-6l8-3z" fill="#4293FA" />
    <path d="M8.5 12.3l2.3 2.3 4.5-4.9" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const QuestionMarkIcon: React.FC<RefIconProps> = ({ size = 22, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="12" cy="12" r="10" fill="#E7F3FF" />
    <path
      d="M9.3 9.5a2.7 2.7 0 015.2.9c0 1.7-2.1 1.9-2.4 3.4"
      stroke="#1877F2"
      strokeWidth="1.8"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="12" cy="17" r="1.1" fill="#1877F2" />
  </svg>
);

export const CalendarIcon: React.FC<RefIconProps> = ({ size = 14, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <rect x="3" y="5" width="18" height="16" rx="2" fill="#ffffff" stroke="#8A8D91" strokeWidth="1.4" />
    <rect x="3" y="5" width="18" height="4.5" rx="2" fill="#8A8D91" />
    <rect x="7" y="2.5" width="2" height="4" rx="1" fill="#65676B" />
    <rect x="15" y="2.5" width="2" height="4" rx="1" fill="#65676B" />
  </svg>
);

export const TargetIcon: React.FC<RefIconProps> = ({ size = 22, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="12" cy="12" r="9" fill="#F43E50" />
    <circle cx="12" cy="12" r="5.5" fill="#ffffff" />
    <circle cx="12" cy="12" r="2.2" fill="#F43E50" />
  </svg>
);

export const PinIcon: React.FC<RefIconProps> = ({ size = 16, className, style }) => (
  // ეს არის დამაგრების/მიმაგრების ("push-pin") აიკონი, არა გეო-ლოკაციის მარკერი
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} style={style}>
    <path
      d="M9.828.722a.5.5 0 01.354.146l4.95 4.95a.5.5 0 010 .707c-.48.48-1.072.588-1.503.588a2.8 2.8 0 01-.46-.039l-3.134 3.134a5.927 5.927 0 01.16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 01-.707 0L5.94 10.768l-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 010-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 011.013.16l3.134-3.133a2.772 2.772 0 01-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 01.353-.146z"
      fill="#F43E50"
    />
  </svg>
);

export const GoogleIcon: React.FC<RefIconProps> = ({ size = 18, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M22 12.2c0-.7-.06-1.4-.18-2H12v3.8h5.6a4.8 4.8 0 01-2.1 3.2v2.6h3.4c2-1.8 3.1-4.5 3.1-7.6z" fill="#4285F4" />
    <path d="M12 22c2.7 0 5-.9 6.7-2.4l-3.4-2.6c-.9.6-2.1 1-3.3 1-2.6 0-4.8-1.7-5.6-4.1H2.9v2.6A10 10 0 0012 22z" fill="#34A853" />
    <path d="M6.4 13.9a6 6 0 010-3.8V7.5H2.9a10 10 0 000 9l3.5-2.6z" fill="#FBBC05" />
    <path d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9C16.9 3 14.7 2 12 2 8.1 2 4.7 4.2 2.9 7.5l3.5 2.6C7.2 7.8 9.4 6.1 12 6.1z" fill="#EA4335" />
  </svg>
);

export const FacebookIcon: React.FC<RefIconProps> = ({ size = 18, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="12" cy="12" r="10" fill="#ffffff" />
    <path
      d="M13.5 21.9v-7.6h2.6l.4-3h-3v-1.9c0-.9.25-1.5 1.5-1.5H16.6V5.1c-.28-.04-1.24-.12-2.36-.12-2.33 0-3.93 1.42-3.93 4.03v2.25H7.7v3h2.6v7.6a10 10 0 003.2 0z"
      fill="#1877F2"
    />
  </svg>
);

export const LinkIcon: React.FC<RefIconProps> = ({ size = 18, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path
      d="M9.5 14.5l5-5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M11 6.5l1.4-1.4a3.5 3.5 0 014.95 4.95L15.9 11.4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 17.5l-1.4 1.4a3.5 3.5 0 01-4.95-4.95l1.45-1.45"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* Grid-view toggle: 2-სვეტიანი (side-by-side) და 1-სვეტიანი (სრულ სიგანეზე) განლაგება.
   მონოქრომული, `currentColor`-ზეა აგებული, რომ ღილაკის active/inactive ფერი CSS-იდან იმართებოდეს. */
export const GridTwoIcon: React.FC<RefIconProps> = ({ size = 18, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <rect x="3" y="4" width="8" height="16" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
    <rect x="13" y="4" width="8" height="16" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export const GridOneIcon: React.FC<RefIconProps> = ({ size = 18, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <rect x="3" y="4" width="18" height="6.5" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
    <rect x="3" y="13.5" width="18" height="6.5" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);
