export function CategoryBar({ categories, selectedCategory, onSelectCategory, totalCount }) {
  return (
    <div className="px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-neutral-100 bg-white">
      <button
        type="button"
        onClick={() => onSelectCategory('')}
        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          selectedCategory === ''
            ? 'bg-neutral-900 text-white'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/70'
        }`}
      >
        All{totalCount !== undefined ? ` (${totalCount})` : ''}
      </button>

      {categories.map((cat) => {
        const isActive = selectedCategory === cat.name;
        return (
          <button
            key={cat.name}
            type="button"
            onClick={() => onSelectCategory(isActive ? '' : cat.name)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isActive
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/70'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
