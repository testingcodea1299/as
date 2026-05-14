import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Wallet, Check, Loader2, Lock } from "lucide-react";
import type { Plan } from "@/lib/auth";

const PRICE: Record<Plan, number> = { free: 0, pro: 99000, premium: 299000 };
const PLAN_NAME: Record<Plan, string> = { free: "Free", pro: "Pro", premium: "Premium" };

type Method = "card" | "vnpay" | "momo" | "zalopay";

const EWALLETS: Array<{ id: Method; label: string; color: string; emoji: string }> = [
  { id: "vnpay", label: "VNPay", color: "bg-sky-500", emoji: "🏦" },
  { id: "momo", label: "Momo", color: "bg-pink-500", emoji: "💗" },
  { id: "zalopay", label: "ZaloPay", color: "bg-blue-600", emoji: "💙" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  plan: Plan;
  onSuccess: () => void;
};

export function PaymentDialog({ open, onClose, plan, onSuccess }: Props) {
  const [method, setMethod] = useState<Method>("card");
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvv: "" });
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => {
    setMethod("card");
    setCard({ number: "", name: "", exp: "", cvv: "" });
    setProcessing(false);
    setDone(false);
  };

  const handleClose = () => {
    if (processing) return;
    reset();
    onClose();
  };

  const formatCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");

  const validateCard = () => {
    const digits = card.number.replace(/\s/g, "");
    if (digits.length < 12) return "Số thẻ không hợp lệ";
    if (!card.name.trim()) return "Vui lòng nhập tên chủ thẻ";
    if (!/^\d{2}\/\d{2}$/.test(card.exp)) return "Hết hạn dạng MM/YY";
    if (!/^\d{3,4}$/.test(card.cvv)) return "CVV không hợp lệ";
    return null;
  };

  const pay = () => {
    if (method === "card") {
      const err = validateCard();
      if (err) { alert(err); return; }
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
      setTimeout(() => {
        onSuccess();
        reset();
        onClose();
      }, 1100);
    }, 1400);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            Thanh toán gói {PLAN_NAME[plan]}
          </DialogTitle>
          <DialogDescription>
            Tổng thanh toán: <span className="font-semibold text-foreground">{PRICE[plan].toLocaleString("vi-VN")}₫/tháng</span>
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
              <Check className="h-8 w-8" />
            </div>
            <p className="text-lg font-semibold">Thanh toán thành công!</p>
            <p className="text-sm text-muted-foreground">Đang kích hoạt gói {PLAN_NAME[plan]}...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Method tabs */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMethod("card")}
                className={`flex items-center justify-center gap-2 rounded-md border p-3 text-sm transition-colors ${method === "card" ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"}`}
              >
                <CreditCard className="h-4 w-4" /> Thẻ ngân hàng
              </button>
              <button
                onClick={() => setMethod("vnpay")}
                className={`flex items-center justify-center gap-2 rounded-md border p-3 text-sm transition-colors ${method !== "card" ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"}`}
              >
                <Wallet className="h-4 w-4" /> Ví điện tử
              </button>
            </div>

            {method === "card" ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">VISA</Badge>
                  <Badge variant="outline">Mastercard</Badge>
                  <Badge variant="outline">JCB</Badge>
                  <Badge variant="outline">Napas (ATM nội địa)</Badge>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardnum">Số thẻ</Label>
                  <Input
                    id="cardnum"
                    inputMode="numeric"
                    placeholder="1234 5678 9012 3456"
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardname">Tên chủ thẻ</Label>
                  <Input
                    id="cardname"
                    placeholder="NGUYEN VAN A"
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="exp">Hết hạn (MM/YY)</Label>
                    <Input
                      id="exp"
                      placeholder="12/28"
                      maxLength={5}
                      value={card.exp}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                        if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                        setCard({ ...card, exp: v });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      type="password"
                      maxLength={4}
                      placeholder="•••"
                      value={card.cvv}
                      onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  🔒 Thông tin thẻ được mã hoá qua cổng thanh toán (mô phỏng — không lưu thật).
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Chọn ví điện tử:</p>
                <div className="grid gap-2">
                  {EWALLETS.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setMethod(w.id)}
                      className={`flex items-center gap-3 rounded-md border p-3 text-left transition-colors ${method === w.id ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
                    >
                      <div className={`grid h-10 w-10 place-items-center rounded-md text-lg ${w.color} text-white`}>
                        {w.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{w.label}</div>
                        <div className="text-xs text-muted-foreground">Quét QR hoặc đăng nhập ví</div>
                      </div>
                      {method === w.id && <Check className="h-5 w-5 text-primary" />}
                    </button>
                  ))}
                </div>
                <div className="rounded-lg border border-dashed border-border p-4 text-center">
                  <div className="mx-auto grid h-32 w-32 place-items-center rounded-md bg-muted text-xs text-muted-foreground">
                    [QR Code mô phỏng]
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Mở app {EWALLETS.find((e) => e.id === method)?.label} → quét QR
                  </p>
                </div>
              </div>
            )}

            <Button onClick={pay} className="w-full" disabled={processing}>
              {processing ? (
                <><Loader2 className="animate-spin" /> Đang xử lý...</>
              ) : (
                <>Thanh toán {PRICE[plan].toLocaleString("vi-VN")}₫</>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
