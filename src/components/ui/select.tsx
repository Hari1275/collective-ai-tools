import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
}

export function Select({ value, onChange, options, placeholder = 'Select an option', className, buttonClassName }: SelectProps) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Listbox value={value} onChange={onChange}>
      <div className={cn('relative', className)}>
        <ListboxButton className={cn("relative w-full flex items-center justify-between gap-2 cursor-default rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-3 text-left text-sm font-medium text-gray-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all duration-200", buttonClassName)}>
          <span className="block truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
        </ListboxButton>

        <ListboxOptions
          transition
          className="absolute z-50 mt-1 min-w-full w-max max-h-60 overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm dark:bg-gray-800 dark:ring-white/10 transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
        >
          {options.map((option, optionIdx) => (
            <ListboxOption
              key={optionIdx}
              className="group relative cursor-default select-none py-2 pl-10 pr-4 text-gray-900 dark:text-gray-100 data-[focus]:bg-blue-50 data-[focus]:text-blue-900 dark:data-[focus]:bg-blue-900/30 dark:data-[focus]:text-blue-100"
              value={option.value}
            >
              <span className="block whitespace-nowrap pr-2 font-normal group-data-[selected]:font-medium">
                {option.label}
              </span>
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400 opacity-0 group-data-[selected]:opacity-100">
                <Check className="h-4 w-4" aria-hidden="true" />
              </span>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
