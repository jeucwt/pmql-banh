import { SearchInput } from "./search-input";
import { Categories } from "./categories";

export default function SearchFilter() {
    return (
        <div className="p-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full">
            <SearchInput disable={true} />
            <Categories />
        </div>
    );
}