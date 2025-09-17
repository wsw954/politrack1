//components/annotation/InlineCountBadges.js
export default function InlineCountBadges({
  links = 0,
  attachments = 0,
  labels = 0,
}) {
  return (
    <div className="flex gap-3 text-xs text-gray-600">
      <span>{links} links</span>
      <span>{attachments} images</span>
      <span>{labels} labels</span>
    </div>
  );
}
