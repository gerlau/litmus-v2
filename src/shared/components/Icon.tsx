interface IcoProps {
  d: string;
  size?: number;
  strokeWidth?: number;
}

function Ico({ d, size = 16, strokeWidth = 1.8 }: IcoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-shrink-0"
    >
      <path d={d} />
    </svg>
  );
}

export const Icons = {
  dashboard: () => <Ico d="M3 13h7V3H3v10zm0 8h7v-6H3v6zm11 0h7V11h-7v10zm0-18v6h7V3h-7z" />,
  features: () => <Ico d="M12 2 4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6l-8-4z" />,
  risks: () => <Ico d="M12 9v4M12 17h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />,
  apps: () => <Ico d="M5 4h6v6H5zM13 4h6v6h-6zM5 14h6v6H5zM13 14h6v6h-6z" />,
  findings: () => <Ico d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />,
  search: () => <Ico d="M11 4a7 7 0 1 0 4.95 11.95L21 21M11 4a7 7 0 0 1 7 7" />,
  bell: () => <Ico d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M9 21a3 3 0 0 0 6 0" />,
  sun: () => <Ico d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" />,
  moon: () => <Ico d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  upload: () => <Ico d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />,
  caret: () => <Ico d="M9 18l6-6-6-6" />,
  check: () => <Ico d="M20 6 9 17l-5-5" strokeWidth={2.5} />,
  download: () => <Ico d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
};
