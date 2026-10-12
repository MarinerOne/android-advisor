import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { PhoneTile } from '../components/browse/PhoneTile';
import { useFavourites } from '../state/favourites';
import { getPhones } from '../data/phonesRepository';

export function Favourites() {
  const navigate = useNavigate();
  const { favourites } = useFavourites();

  // Preserve the order the user saved them in.
  const phones = useMemo(() => {
    const all = getPhones();
    return favourites
      .map((id) => all.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  }, [favourites]);

  return (
    <div className="flex-1 py-6">
      <h1 className="text-3xl font-bold text-ink mb-5">Your shortlist ❤️</h1>

      {phones.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3" aria-hidden="true">
            🤍
          </div>
          <p className="text-ink-soft mb-4">
            No favourites yet. Tap the heart on any phone to save it here.
          </p>
          <Button onClick={() => navigate('/browse')}>Browse phones</Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-ink-soft mb-4">
            {phones.length} saved {phones.length === 1 ? 'phone' : 'phones'}
          </p>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {phones.map((phone) => (
              <PhoneTile key={phone.id} phone={phone} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
