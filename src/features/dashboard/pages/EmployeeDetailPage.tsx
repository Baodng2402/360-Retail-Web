import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { employeesApi } from "@/shared/lib/employeesApi";
import type { Employee } from "@/shared/types/employee";
import { useAuthStore } from "@/shared/store/authStore";
import { ArrowLeft, Loader2, User, Mail, Phone, Briefcase, Calendar, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** Normalize role check: backend may return "StoreOwner", "Store Owner", "storeowner", or comma-separated. */
const hasRole = (roleValue: unknown, target: string): boolean => {
  if (!roleValue) return false;
  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");
  const r = String(roleValue).trim();
  const t = target;
  if (normalize(r) === normalize(t)) return true;
  return r.split(/[,]/).some((part) => normalize(part.trim()) === normalize(t));
};

export default function EmployeeDetailPage() {
  const { t: tStaff, i18n } = useTranslation("staff");
  const { t: tCommon } = useTranslation("common");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role ?? "";
  const canEdit =
    hasRole(role, "StoreOwner") || hasRole(role, "Manager");

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [positionMode, setPositionMode] = useState<"preset" | "custom">("preset");
  const [baseSalary, setBaseSalary] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [customPosition, setCustomPosition] = useState("");

  const POSITION_OPTIONS = [
    "StoreOwner",
    "Manager",
    "Staff",
    "Cashier",
    "Sales",
    "Warehouse",
  ] as const;

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const emp = await employeesApi.getEmployeeById(id);
        setEmployee(emp);
        setFullName(emp.fullName);
        setPosition(emp.position);
        const isPreset =
          !!emp.position &&
          (POSITION_OPTIONS as readonly string[]).includes(emp.position);
        setPositionMode(isPreset ? "preset" : "custom");
        setCustomPosition(isPreset ? "" : emp.position || "");
        setBaseSalary(
          typeof emp.baseSalary === "number" ? String(emp.baseSalary) : "",
        );
        setIsActive(emp.isActive);
      } catch (err) {
        console.error("Failed to load employee:", err);
        toast.error(tStaff("detail.toasts.loadFailed"));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, tStaff]);

  const handleSave = async () => {
    if (!employee || !id || !canEdit) return;
    try {
      setSaving(true);
      const salaryNumber =
        baseSalary.trim() === "" ? undefined : Number(baseSalary.trim());
      if (salaryNumber !== undefined && Number.isNaN(salaryNumber)) {
        toast.error(tStaff("detail.toasts.invalidBaseSalary"));
        setSaving(false);
        return;
      }
      const nextPosition =
        positionMode === "custom"
          ? customPosition.trim()
          : position.trim();
      if (!nextPosition) {
        toast.error(tStaff("detail.toasts.positionRequired"));
        setSaving(false);
        return;
      }
      const updated = await employeesApi.updateEmployee(id, {
        fullName: fullName.trim() || employee.fullName,
        position: nextPosition || employee.position,
        baseSalary: salaryNumber,
        isActive,
      });
      setEmployee((prev) => (prev ? { ...prev, ...updated } : updated));
      toast.success(tStaff("detail.toasts.updateSuccess"));
    } catch (err) {
      console.error("Failed to update employee:", err);
      toast.error(tStaff("detail.toasts.updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!employee || !id || !canEdit) return;
    try {
      setDeleting(true);
      const updated = await employeesApi.updateEmployee(id, { isActive: false });
      setEmployee((prev) => (prev ? { ...prev, ...updated, isActive: false } : updated));
      setIsActive(false);
      toast.success(tStaff("detail.toasts.deactivateSuccess"));
      setDeleteOpen(false);
    } catch (err) {
      console.error("Failed to deactivate employee:", err);
      toast.error(tStaff("detail.toasts.deactivateFailed"));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{tStaff("detail.loading")}</span>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-muted-foreground">{tStaff("detail.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/staff")}>
          {tStaff("detail.backToList")}
        </Button>
      </div>
    );
  }

  const formatJoinDate = (value: string) => {
    const locale = i18n.language.toLowerCase().startsWith("en") ? "en-US" : "vi-VN";
    return new Intl.DateTimeFormat(locale, { dateStyle: "short" }).format(new Date(value));
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="inline-flex items-center gap-2 px-0 text-sm text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/dashboard/staff")}
      >
        <ArrowLeft className="h-4 w-4" />
        {tStaff("detail.backToList")}
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 md:col-span-1 space-y-4">
          <div className="flex flex-col items-center text-center space-y-3">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
              <AvatarImage src={employee.avatarUrl || undefined} alt={employee.fullName} />
              <AvatarFallback>
                {getInitials(employee.fullName || employee.email || "U")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold flex items-center justify-center gap-2">
                <User className="h-4 w-4 text-teal-600" />
                {employee.fullName}
              </p>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Briefcase className="h-3 w-3" />
                {employee.position || tStaff("detail.positionFallback")}
              </p>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                <span>{employee.email}</span>
              </div>
              {employee.phoneNumber && (
                <div className="flex items-center justify-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{employee.phoneNumber}</span>
                </div>
              )}
              {employee.joinDate && (
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {tStaff("detail.joinDateLabel")} {formatJoinDate(employee.joinDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{tStaff("detail.sectionTitle")}</h2>
            {canEdit && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteOpen(true)}
                  disabled={saving || deleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {tStaff("detail.actions.deactivate")}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || deleting}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {tStaff("detail.actions.saveChanges")}
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">{tStaff("detail.form.fullName")}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={employee.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">{tStaff("detail.form.position")}</Label>
              <div className="grid gap-2">
                <Select
                  value={positionMode}
                  onValueChange={(v) => setPositionMode(v as "preset" | "custom")}
                  disabled={!canEdit}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preset">
                      {tStaff("detail.form.positionModePreset")}
                    </SelectItem>
                    <SelectItem value="custom">
                      {tStaff("detail.form.positionModeCustom")}
                    </SelectItem>
                  </SelectContent>
                </Select>

                {positionMode === "preset" ? (
                  <Select
                    value={position}
                    onValueChange={setPosition}
                    disabled={!canEdit}
                  >
                    <SelectTrigger id="position" className="w-full">
                      <SelectValue placeholder={tStaff("detail.form.positionPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITION_OPTIONS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="position"
                    value={customPosition}
                    onChange={(e) => setCustomPosition(e.target.value)}
                    disabled={!canEdit}
                    placeholder={tStaff("detail.form.customPositionPlaceholder")}
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseSalary">{tStaff("detail.form.baseSalary")}</Label>
              <Input
                id="baseSalary"
                type="number"
                min={0}
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{tStaff("detail.form.workStatusTitle")}</p>
              <p className="text-xs text-muted-foreground">
                {isActive
                  ? tStaff("detail.form.activeHint")
                  : tStaff("detail.form.inactiveHint")}
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={!canEdit}
              className="data-[state=checked]:bg-teal-600"
            />
          </div>
        </Card>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{tStaff("detail.dialog.title")}</DialogTitle>
            <DialogDescription>
              <span
                dangerouslySetInnerHTML={{
                  __html: tStaff("detail.dialog.description", {
                    name: employee.fullName,
                  }),
                }}
              />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              {tCommon("actions.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tCommon("actions.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

