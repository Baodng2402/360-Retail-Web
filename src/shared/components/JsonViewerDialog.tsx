import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Textarea } from "@/shared/components/ui/textarea";
import toast from "react-hot-toast";
import { Copy, FileJson } from "lucide-react";

type JsonViewerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  value: unknown;
};

const safeStringify = (v: unknown) => {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
};

export function JsonViewerDialog({ open, onOpenChange, title, value }: JsonViewerDialogProps) {
  const text = useMemo(() => safeStringify(value), [value]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Đã copy JSON.");
    } catch {
      toast.error("Copy thất bại.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3">
            <span className="truncate">{title}</span>
            <Badge variant="outline" className="gap-1">
              <FileJson className="h-3.5 w-3.5" />
              Raw
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => void copy()}>
            <Copy className="h-4 w-4" />
            Copy JSON
          </Button>
        </div>

        <Textarea value={text} readOnly className="min-h-[420px] font-mono text-xs leading-5" />
      </DialogContent>
    </Dialog>
  );
}

