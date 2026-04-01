"use client";

interface RefereeInfoProps {
  referee: { name: string; nationality: string } | null | undefined;
}

export function RefereeInfo({ referee }: RefereeInfoProps) {
  if (!referee) return null;

  return (
    <p className="text-xs text-text-muted text-center">
      🏁 Trọng tài: {referee.name} ({referee.nationality})
    </p>
  );
}
