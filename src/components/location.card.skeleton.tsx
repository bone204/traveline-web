"use client";

export function LocationCardSkeleton() {
  return (
    <div className="location-card skeleton">
      <div className="location-card__image skeleton__block" />
      <div className="location-card__body">
        <div className="skeleton__line skeleton__line--title" />
        <div className="skeleton__line skeleton__line--subtitle" />
        <div className="skeleton__line skeleton__line--short" />
      </div>
    </div>
  );
}

export function LocationGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="location-grid">
      {Array.from({ length: count }).map((_, idx) => (
        <LocationCardSkeleton key={idx} />
      ))}
    </div>
  );
}
