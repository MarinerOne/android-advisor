import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { PhoneTile } from '../components/browse/PhoneTile';
import {
  getBrands,
  getPhones,
  getTags,
} from '../data/phonesRepository';
import { PRICE_BAND_LABELS, type PriceBand } from '../domain/types';
import { track } from '../analytics/analytics';
import { Seo } from '../seo/Seo';

type SortKey = 'price-asc' | 'price-desc' | 'name' | 'brand';

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'brand', label: 'Brand (A–Z)' },
];

export function Browse() {
  const navigate = useNavigate();
  const allPhones = useMemo(() => getPhones(), []);
  const brands = useMemo(() => getBrands(), []);
  const tags = useMemo(() => getTags(), []);

  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('all');
  const [band, setBand] = useState<PriceBand | 'all'>('all');
  const [tag, setTag] = useState('all');
  const [sort, setSort] = useState<SortKey>('price-asc');

  // Track the page view once.
  useEffect(() => {
    track({ name: 'browse_viewed' });
  }, []);

  // Track searches, debounced so we don't fire on every keystroke.
  useEffect(() => {
    const q = search.trim();
    if (!q) return;
    const t = setTimeout(() => {
      track({ name: 'browse_searched', props: { query: q } });
    }, 600);
    return () => clearTimeout(t);
  }, [search]);

  // Track filter/sort changes (not the initial default state).
  useEffect(() => {
    if (brand === 'all' && band === 'all' && tag === 'all' && sort === 'price-asc') {
      return;
    }
    track({
      name: 'browse_filtered',
      props: { brand, band, tag, sort },
    });
  }, [brand, band, tag, sort]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = allPhones.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (brand !== 'all' && p.brand !== brand) return false;
      if (band !== 'all' && p.priceBand !== band) return false;
      if (tag !== 'all' && !p.tags.includes(tag)) return false;
      return true;
    });

    result.sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.priceGBP - b.priceGBP;
        case 'price-desc':
          return b.priceGBP - a.priceGBP;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'brand':
          return a.brand.localeCompare(b.brand) || a.priceGBP - b.priceGBP;
      }
    });
    return result;
  }, [allPhones, search, brand, band, tag, sort]);

  function reset() {
    setSearch('');
    setBrand('all');
    setBand('all');
    setTag('all');
    setSort('price-asc');
  }

  const selectClass =
    'rounded-md border-2 border-border bg-surface px-3 py-2 text-ink font-semibold focus-visible:outline-none focus-visible:border-primary';

  return (
    <div className="flex-1 py-6">
      <Seo
        title="Browse all Android phones"
        description="Browse and compare 100+ Android phones by brand, price, camera, battery and more. Find the right phone for your budget and needs."
        path="/browse"
      />
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <h1 className="text-3xl font-bold text-ink">Browse all phones</h1>
        <Button variant="secondary" onClick={() => navigate('/quiz')}>
          Take the quiz 🎯
        </Button>
      </div>

      <div className="mb-5">
        <label htmlFor="phone-search" className="sr-only">
          Search phones by name
        </label>
        <input
          id="phone-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, e.g. Pixel, Galaxy S24…"
          className="w-full rounded-lg border-2 border-border bg-surface px-4 py-3 text-ink focus-visible:outline-none focus-visible:border-primary"
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          aria-label="Filter by brand"
          className={selectClass}
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        >
          <option value="all">All brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by price"
          className={selectClass}
          value={band}
          onChange={(e) => setBand(e.target.value as PriceBand | 'all')}
        >
          <option value="all">Any price</option>
          {PRICE_BAND_LABELS.map((b) => (
            <option key={b.band} value={b.band}>
              {b.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by category"
          className={selectClass}
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        >
          <option value="all">All categories</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort phones"
          className={selectClass}
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <Button variant="ghost" onClick={reset}>
          Clear filters
        </Button>
      </div>

      <p className="text-sm text-ink-soft mb-4" aria-live="polite">
        Showing {filtered.length} of {allPhones.length} phones
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3" aria-hidden="true">
            🔍
          </div>
          <p className="text-ink-soft mb-4">
            No phones match those filters. Try widening your search.
          </p>
          <Button variant="secondary" onClick={reset}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((phone) => (
            <PhoneTile key={phone.id} phone={phone} />
          ))}
        </div>
      )}
    </div>
  );
}
