import React, { useState, useMemo } from "react"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function Combobox({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select an option...", 
  searchPlaceholder = "Search...", 
  notFoundMessage = "No results found.", 
  isLoading,
  allowCreation = false,
  onCreation,
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setOpen(false);
    setSearchTerm("");
  };
  
  const handleCreate = () => {
    const newEntry = searchTerm.trim();
    if (allowCreation && onCreation && newEntry) {
      onCreation(newEntry);
      onChange(newEntry); // Directly set the new value
      setOpen(false);
      setSearchTerm("");
    }
  };

  // Find the label for the currently selected value.
  // It might be in the options, or it might be a newly created value.
  const selectedLabel = useMemo(() => {
    const selectedOption = options.find((option) => option.value.toLowerCase() === value?.toLowerCase());
    return selectedOption?.label || value || placeholder;
  }, [options, value, placeholder]);


  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const showCreationButton = allowCreation && searchTerm && !filteredOptions.some(opt => opt.label.toLowerCase() === searchTerm.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={searchPlaceholder}
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {isLoading ? (
              <CommandItem disabled>Loading...</CommandItem>
            ) : (
              <>
                <CommandEmpty>
                    {showCreationButton ? (
                        <div 
                            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent"
                            onClick={handleCreate}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" /> Create "{searchTerm}"
                        </div>
                    ) : (
                        <p className="p-2 text-sm text-center">{notFoundMessage}</p>
                    )}
                </CommandEmpty>
                <CommandGroup>
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value?.toLowerCase() === option.value.toLowerCase() ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}