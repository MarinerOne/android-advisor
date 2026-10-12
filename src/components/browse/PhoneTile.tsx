import { Link } from 'react-router-dom';
import type { Phone } from '../../domain/types';
import { Card } from '../common/Card';
import { FavouriteButton } from '../common/FavouriteButton';

interface PhoneTileProps {
  phone: Phone;
}

export function PhoneTile({ phone }: PhoneTileProps) {
  return (
    <Card className="h-full flex flex-col">
      <div className="flex justify-between items-start gap-2 mb-2">
        <Link
          to={`/phone/${phone.id}`}
          className="block flex-1 rounded-md focus-visible:outline-none"
        >
          <img
            src={phone.image}
            alt={phone.name}
            loading="lazy"
            className="w-full h-32 object-contain rounded-md bg-surface-alt mb-3"
          />
        </Link>
        <FavouriteButton phoneId={phone.id} phoneName={phone.name} />
      </div>
      <Link to={`/phone/${phone.id}`} className="flex-1">
        <h3 className="font-bold text-ink leading-tight hover:text-primary transition-colors duration-fast">
          {phone.name}
        </h3>
      </Link>
      <div className="flex items-baseline justify-between mt-2">
        <span className="text-sm text-ink-soft">{phone.brand}</span>
        <span className="font-bold text-primary">£{phone.priceGBP}</span>
      </div>
    </Card>
  );
}
