import { SearchInput } from "./search-input";
import { Categories } from "./categories";

interface SearchFilterProps {
    searchTerm: string;
    onSearchChange: (val: string) => void;
    categories: string[];
    selectedCategory: string;
    onCategorySelect: (cat: string) => void;
}

export default function SearchFilter({ searchTerm, onSearchChange, categories, selectedCategory, onCategorySelect }: SearchFilterProps) {
    return (
        <div className="p-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full">
            <SearchInput value={searchTerm} onChange={onSearchChange} disable={false} />
            <Categories categories={categories} selectedCategory={selectedCategory} onSelect={onCategorySelect} />
        </div>
    );
}