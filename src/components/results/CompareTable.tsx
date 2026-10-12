import type { Recommendation } from '../../domain/types';
import { Card } from '../common/Card';

interface CompareTableProps {
  recommendations: Recommendation[];
}

interface Row {
  label: string;
  render: (r: Recommendation) => string;
}

const ROWS: Row[] = [
  { label: 'Price', render: (r) => `£${r.phone.priceGBP}` },
  { label: 'Match', render: (r) => `${r.matchScore}%` },
  { label: 'Brand', render: (r) => r.phone.brand },
  { label: 'Screen', render: (r) => `${r.phone.specs.screenSize}"` },
  { label: 'Storage', render: (r) => `${r.phone.specs.storageGB}GB` },
  { label: 'Camera', render: (r) => `${r.phone.specs.cameraScore}/100` },
  { label: 'Battery', render: (r) => `${r.phone.specs.batteryScore}/100` },
  {
    label: 'Performance',
    render: (r) => `${r.phone.specs.performanceScore}/100`,
  },
];

export function CompareTable({ recommendations }: CompareTableProps) {
  if (recommendations.length < 2) return null;

  return (
    <Card className="overflow-x-auto">
      <h3 className="text-xl font-bold text-ink mb-4">
        Side-by-side comparison
      </h3>
      <table className="w-full text-sm border-collapse">
        <caption className="sr-only">
          Comparison of selected phones by key specifications
        </caption>
        <thead>
          <tr>
            <th scope="col" className="text-left py-2 pr-3 text-ink-soft">
              Spec
            </th>
            {recommendations.map((r) => (
              <th
                key={r.phone.id}
                scope="col"
                className="text-left py-2 px-3 font-bold text-ink"
              >
                {r.phone.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="border-t border-border">
              <th
                scope="row"
                className="text-left py-2 pr-3 font-semibold text-ink-soft"
              >
                {row.label}
              </th>
              {recommendations.map((r) => (
                <td key={r.phone.id} className="py-2 px-3 text-ink">
                  {row.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
