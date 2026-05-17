import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApplications } from "@/lib/applications-store";
import { useAuth } from "@/lib/auth";
import { pushNotification } from "@/lib/notifications";
import { toast } from "sonner";
import { Upload, Send } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  job: { id: string; title: string; company: string };
};

export function ApplyDialog({ open, onOpenChange, job }: Props) {
  const { user } = useAuth();
  const { addApplication } = useApplications(user?.email);
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [coverLetter, setCoverLetter] = useState("");
  const [cvName, setCvName] = useState<string | undefined>();
  const [cvDataUrl, setCvDataUrl] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const onFile = (f?: File) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File CV tối đa 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCvName(f.name);
      setCvDataUrl(String(reader.result));
    };
    reader.readAsDataURL(f);
  };

  const submit = async () => {
    if (!user) return;
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      toast.error("Vui lòng nhập đầy đủ Họ tên, SĐT và Email");
      return;
    }
    if (!cvName) {
      toast.error("Vui lòng đính kèm CV (PDF/DOC)");
      return;
    }
    setSubmitting(true);
    addApplication({
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      userEmail: user.email,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      coverLetter: coverLetter.trim(),
      cvName,
      cvDataUrl,
    });
    pushNotification({
      type: "success",
      title: "Đã gửi đơn ứng tuyển",
      description: `${job.title} · ${job.company}`,
      link: `/profile`,
    });
    toast.success("Đã gửi đơn ứng tuyển! Theo dõi tiến trình trong Hồ sơ.");
    setSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ứng tuyển: {job.title}</DialogTitle>
          <DialogDescription>{job.company} · Hoàn tất thông tin để gửi đơn ngay</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Họ và tên *</Label>
              <Input className="mt-1.5" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
            </div>
            <div>
              <Label>Số điện thoại *</Label>
              <Input className="mt-1.5" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} placeholder="09xx xxx xxx" />
            </div>
          </div>
          <div>
            <Label>Email liên hệ *</Label>
            <Input className="mt-1.5" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
          </div>
          <div>
            <Label>Thư giới thiệu (tuỳ chọn)</Label>
            <Textarea
              className="mt-1.5"
              rows={4}
              maxLength={1000}
              placeholder="Giới thiệu ngắn về bản thân, kinh nghiệm phù hợp với vị trí..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
            <div className="mt-1 text-xs text-muted-foreground">{coverLetter.length}/1000</div>
          </div>
          <div>
            <Label>Đính kèm CV * (PDF/DOC, tối đa 5MB)</Label>
            <label className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-3 text-sm hover:bg-accent">
              <Upload className="h-4 w-4 text-primary" />
              <span className="flex-1 truncate">{cvName ?? "Chọn file CV…"}</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button onClick={submit} disabled={submitting}>
            <Send /> Gửi đơn ứng tuyển
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
