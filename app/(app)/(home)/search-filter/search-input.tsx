"use client"

import {Input} from "@/components/ui/input";
import {SearchIcon} from "lucide-react";


interface SearchInputProps {
  disable?: boolean;
  value?: string;
  onChange?: (val: string) => void;
}
export const SearchInput = ({ disable, value, onChange }: SearchInputProps) => {
  return (
    <div className="flex items-center gap-4 w-full">
        <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4" />
            <Input
                placeholder="Tìm kiếm bánh bạn thích..."
                disabled={disable}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                className="bg-background text-bold pl-8"
            />
        </div>
    </div>
    
  );
};
