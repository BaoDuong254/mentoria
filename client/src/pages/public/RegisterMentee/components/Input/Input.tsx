import { type ChangeEvent } from "react";
interface InputProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({ id, label, type, placeholder, onChange }: InputProps) {
  return (
    <>
      <div className='mt-3 flex h-[78px] w-[387px] flex-col justify-between text-white'>
        <label htmlFor={id} className='font-bold'>
          {label}
        </label>
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          onChange={onChange}
          className='h-[50px] w-full rounded-lg border border-gray-600 bg-gray-700 pl-3 text-gray-400'
        />
      </div>
    </>
  );
}
