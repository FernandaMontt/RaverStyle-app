import { formatCLP, timeAgo } from '../lib/format';

export default function FeedSection({ feed }) {
  const items = feed.slice(0, 12);

  return (
    <section aria-label="Actividad combinada en vivo" className="max-w-[1080px] mx-auto mt-20 mb-24 px-6">
      <div className="flex justify-between items-baseline mb-5 flex-wrap gap-2.5">

      </div>
    </section>
  );
}
