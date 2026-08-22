import { useEffect, useState } from "react";
import { Briefcase, Building2, Calendar, Mail, Phone, MapPin, BadgeCheck, Save } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PageSkeleton } from "../components/ui/Skeleton";
import { useToast } from "../context/useToast";
import { apiErrorMessage } from "../lib/apiClient";
import { formatDate, initials } from "../lib/format";
import * as employeeApi from "../api/employees";
import type { EmployeeProfileOut } from "../lib/types";

export default function Profile() {
  const toast = useToast();
  const [profile, setProfile] = useState<EmployeeProfileOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    employeeApi
      .getMyProfile()
      .then((p) => {
        setProfile(p);
        setPhone(p.phone ?? "");
        setAddress(p.address ?? "");
      })
      .catch((err) => toast.error(apiErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await employeeApi.updateMyProfile({ phone, address });
      setProfile(updated);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading || !profile) {
    return (
      <div>
        <h1 className="mb-6 font-display text-3xl font-semibold text-ink">Profile</h1>
        <PageSkeleton />
      </div>
    );
  }

  const fullName =
    profile.first_name || profile.last_name ? `${profile.first_name} ${profile.last_name}`.trim() : profile.user.employee_id;

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-semibold text-ink">Profile</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="flex flex-col items-center text-center lg:col-span-1">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 font-display text-2xl font-semibold text-white">
            {initials(profile.first_name, profile.last_name) || profile.user.employee_id.slice(0, 2)}
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold text-ink">{fullName}</h2>
          <p className="text-sm text-faint">{profile.job_title ?? "No title set"}</p>

          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {profile.user.is_verified ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified
              </span>
            ) : (
              <span className="text-amber-400">Pending verification</span>
            )}
          </div>

          <div className="mt-6 w-full space-y-3 border-t border-border pt-5 text-left">
            <div className="flex items-center gap-2.5 text-sm text-muted">
              <Mail className="h-4 w-4 text-faint shrink-0" />
              <span className="truncate">{profile.user.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-muted">
              <Building2 className="h-4 w-4 text-faint shrink-0" />
              <span>{profile.department ?? "No department"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-muted">
              <Briefcase className="h-4 w-4 text-faint shrink-0" />
              <span>{profile.user.employee_id}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-muted">
              <Calendar className="h-4 w-4 text-faint shrink-0" />
              <span>Joined {formatDate(profile.joining_date)}</span>
            </div>
          </div>
        </Card>

        <Card delay={0.05} className="lg:col-span-2">
          <h3 className="mb-1 font-display text-lg font-semibold text-ink">Contact details</h3>
          <p className="mb-5 text-sm text-faint">You can update your phone and address. Other details are managed by HR.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Phone"
              icon={<Phone className="h-4 w-4" />}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 000 0000"
            />
            <Input
              label="Address"
              icon={<MapPin className="h-4 w-4" />}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="City, Country"
            />
          </div>
          <Button className="mt-5" onClick={handleSave} isLoading={saving}>
            <Save className="h-4 w-4" /> Save changes
          </Button>
        </Card>
      </div>
    </div>
  );
}
