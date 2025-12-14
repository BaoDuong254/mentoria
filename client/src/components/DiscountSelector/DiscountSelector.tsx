import { Tag } from "lucide-react";
import { useState } from "react";
import type { DiscountItem } from "@/apis/discount.api";

interface DiscountSelectorProps {
  discounts: DiscountItem[];
  bestDiscount: string | null;
  selectedDiscount: string | null;
  onSelect: (discountName: string | null) => void;
}

export default function DiscountSelector({
  discounts,
  bestDiscount,
  selectedDiscount,
  onSelect,
}: DiscountSelectorProps) {
  const [showAll, setShowAll] = useState(false);

  const displayedDiscounts = showAll ? discounts : discounts.slice(0, 3);

  const formatValue = (discount: DiscountItem) => {
    if (discount.discount_type === "Percentage") {
      return `${String(discount.discount_value)}% OFF`;
    }
    return `$${String(discount.discount_value)} OFF`;
  };

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-3'>
        {displayedDiscounts.map((discount) => {
          const isSelected = selectedDiscount === discount.discount_name;
          const isBest = bestDiscount === discount.discount_name;

          return (
            <div
              key={discount.discount_id}
              onClick={() => {
                onSelect(isSelected ? null : discount.discount_name);
              }}
              className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                isSelected
                  ? "border-purple-500 bg-purple-500/10"
                  : isBest
                    ? "border-yellow-500/50 bg-yellow-500/5"
                    : "border-gray-600 hover:border-gray-500 hover:bg-gray-700/50"
              }`}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Tag className='h-5 w-5 text-purple-400' />
                  <div>
                    <div className='flex items-center gap-2'>
                      <span className='font-bold text-white'>{discount.discount_name}</span>
                      {isBest && (
                        <span className='rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-bold text-black'>
                          BEST
                        </span>
                      )}
                    </div>
                    <span className='text-sm text-gray-400'>{formatValue(discount)}</span>
                  </div>
                </div>
                <div className='flex flex-col items-end'>
                  <span className='text-sm text-gray-400'>Save</span>
                  <span className='text-lg font-bold text-white'>${discount.estimated_savings.toFixed(2)}</span>
                </div>
              </div>
              {isSelected && <div className='mt-2 text-sm font-semibold text-purple-400'>✓ Applied</div>}
            </div>
          );
        })}
      </div>

      {discounts.length > 3 && (
        <button
          onClick={() => {
            setShowAll(!showAll);
          }}
          className='rounded-lg border-2 border-dashed border-gray-600 py-2 text-gray-400 transition-all hover:border-gray-500 hover:text-gray-300'
        >
          {showAll ? "Show Less" : `Show ${String(discounts.length - 3)} More Discounts`}
        </button>
      )}
    </div>
  );
}
