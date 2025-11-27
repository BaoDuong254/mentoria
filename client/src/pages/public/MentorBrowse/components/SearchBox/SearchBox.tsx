export interface SearchBoxItem {
  id: number | string;
  label: string;
  count?: number;
}
interface SearchBoxProps {
  title: string;
  placeholder?: string;
  items: SearchBoxItem[];
  isLoading?: boolean;

  onSearch: (val: string) => void;
  searchTerm: string;

  selectedIds: (number | string)[];
  onSelect: (item: SearchBoxItem) => void;
}
export default function SearchBox({
  title,
  placeholder,
  items,
  onSearch,
  searchTerm,
  selectedIds,
  onSelect,
}: SearchBoxProps) {
  return (
    <>
      <div className='flex w-11/12 items-center justify-center rounded-xl border-2 border-gray-700 bg-gray-800 text-white'>
        <div className='my-8 flex w-11/12 flex-col gap-5'>
          <div>
            <h2 className='text-[20px] font-bold'>{title}</h2>
          </div>
          <div className='mx-2 flex flex-1 items-center rounded-lg border border-gray-700 bg-(--secondary) px-3 py-2 text-gray-300 focus-within:border-purple-500'>
            <input
              value={searchTerm}
              type='text'
              placeholder={placeholder ?? `Search ${title}...`}
              className='flex-1 bg-transparent placeholder-gray-500 outline-none'
              onChange={(e) => {
                onSearch(e.target.value);
              }}
            />
          </div>
          <div className='custom-scrollbar flex max-h-[300px] flex-col gap-3 overflow-y-auto pr-1'>
            {items.length > 0 ? (
              items.map((item) => {
                const isChecked = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className='group flex cursor-pointer items-center justify-between text-sm'
                    onClick={() => {
                      onSelect(item);
                    }}
                  >
                    <div className='flex items-center gap-2'>
                      <input
                        type='checkbox'
                        checked={isChecked}
                        readOnly
                        className='rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-400'
                      />
                      <span
                        className={`transition-colors ${isChecked ? "font-medium text-purple-400" : "text-white group-hover:text-gray-300"}`}
                      >
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={`transition-colors ${isChecked ? "font-medium text-purple-400" : "text-xs text-gray-500"}`}
                    >
                      {item.count}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className='py-2 text-center text-xs text-white'>No results found</p>
            )}
          </div>
          <div>
            <span className='text-(--green)'>Show more</span>
          </div>
        </div>
      </div>
    </>
  );
}
