import { ChevronDown } from "lucide-react";
interface FilterProps {
  filterName: string;
}
export default function Filter({ filterName }: FilterProps) {
  return (
    <div className='flex items-center justify-center gap-2 rounded-full bg-gray-700 px-3 py-1 text-gray-300'>
      {filterName} <ChevronDown />
    </div>
  );
}
