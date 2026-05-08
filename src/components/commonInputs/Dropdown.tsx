import { useState, useRef, useEffect } from 'react';
import { Controller, FieldError, useFormContext } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowDown } from 'react-icons/io';

import { DropdownControllerProps } from '../../utils/types';

const DropdownController: React.FC<{ metaData: DropdownControllerProps }> = ({
  metaData
}) => {
  const {
    options,
    name,
    placeholder = 'Select',
    defaultValue,
    isRequired = false,
    isDisabled = false,
    labelClass = 'mb-2',
    errorClass = 'text-red-500 text-[10px]  my-1',
    fieldClass = 'border p-2',
    icon,
    hideLabel = false,
    isEditable = false
  } = metaData;

  const {
    control,
    formState: { errors },
    trigger
  } = useFormContext();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  let fieldError = null;
  try {
    fieldError = Object.keys(errors).length > 0 && eval(`errors.${name}`);
  } catch (error) {
    console.log(error);
    fieldError = null;
  }

  const filteredOptions = options?.filter(option =>
    String(option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative rounded-lg bg-white" ref={dropdownRef}>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue || ''}
        render={({ field }) => (
          <div className="relative bg-inherit">
            {icon && (
              <span className="absolute bottom-3 left-1 px-1 text-[#737373]">
                {icon()}
              </span>
            )}
            
            {isEditable ? (
              <div className="relative">
                <input
                  {...field}
                  id={name}
                  disabled={isDisabled}
                  placeholder=" "
                  autoComplete="off"
                  className={`${fieldClass} selectPadding peer w-full cursor-text`}
                  onChange={e => {
                    field.onChange(e.target.value);
                    setSearchTerm(e.target.value);
                    setIsOpen(true);
                    trigger(name);
                  }}
                  onFocus={() => {
                    setSearchTerm(field.value || '');
                    setIsOpen(true);
                  }}
                />
                <div 
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <IoIosArrowDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 z-[100] mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-xl focus:outline-none"
                    >
                      {filteredOptions?.length ? (
                        filteredOptions.map((option, index) => (
                          <li
                            key={index}
                            className="cursor-pointer px-4 py-2.5 text-sm text-gray-700 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => {
                              field.onChange(option);
                              setSearchTerm(String(option));
                              setIsOpen(false);
                              trigger(name);
                            }}
                          >
                            {option}
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-3 text-center text-sm italic text-gray-400">
                          No matching results
                        </li>
                      )}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <select
                {...field}
                id={name}
                disabled={isDisabled}
                className={`${fieldClass} selectPadding`}
                onChange={e => {
                  field.onChange(e.target.value);
                  trigger(name);
                }}
              >
                <option value="">{placeholder}</option>
                {options?.map(item => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            )}

            {!hideLabel ? (
              <label
                htmlFor={name}
                className={`pointer-events-none absolute left-8 ${field.value ? '-top-2 text-sm text-[#1A439A]' : 'top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#1A439A]'} ${labelClass} transition-all duration-200`}
              >
                {placeholder}
                {isRequired && <span className="text-red-500">{' *'}</span>}
              </label>
            ) : null}
          </div>
        )}
      />
      {fieldError && (
        <p className={errorClass}>
          {fieldError ? (fieldError as FieldError)?.message : ''}
        </p>
      )}
    </div>
  );
};

export default DropdownController;
