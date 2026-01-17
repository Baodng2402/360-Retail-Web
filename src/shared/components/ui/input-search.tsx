import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/lib/utils";

// Kế thừa toàn bộ props của thẻ Input HTML (value, onChange, onKeyDown, etc.)
interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  wrapperClassName?: string; // Class cho thẻ div bao ngoài (để chỉnh width)
}

// Dùng React.forwardRef để sau này có thể dùng ref nếu cần (ví dụ: focus vào ô search)
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, wrapperClassName, ...props }, ref) => {
    return (
      <div className={cn("relative", wrapperClassName)}>
        {/* Icon Search cố định */}
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        {/* Input chính */}
        <Input
          type="search" // Hiển thị nút 'x' clear trên một số trình duyệt
          className={cn(
            "pl-9", // Padding left để né icon
            "bg-background",
            className // Cho phép ghi đè style input từ bên ngoài
          )}
          ref={ref}
          {...props} // Truyền tất cả props còn lại vào (value, onChange...)
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
