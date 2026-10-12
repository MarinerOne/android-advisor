import { useFavourites } from '../../state/favourites';

interface FavouriteButtonProps {
  phoneId: string;
  phoneName: string;
}

export function FavouriteButton({ phoneId, phoneName }: FavouriteButtonProps) {
  const { isFavourite, toggle } = useFavourites();
  const active = isFavourite(phoneId);

  return (
    <button
      onClick={() => toggle(phoneId)}
      aria-pressed={active}
      aria-label={
        active
          ? `Remove ${phoneName} from favourites`
          : `Add ${phoneName} to favourites`
      }
      title={active ? 'Remove from favourites' : 'Save to favourites'}
      className={
        'inline-flex items-center justify-center w-10 h-10 rounded-pill border-2 ' +
        'transition-all duration-fast hover:-translate-y-0.5 ' +
        (active
          ? 'border-primary bg-surface-alt'
          : 'border-border bg-surface hover:border-primary')
      }
    >
      <span className="text-xl" aria-hidden="true">
        {active ? '❤️' : '🤍'}
      </span>
    </button>
  );
}
