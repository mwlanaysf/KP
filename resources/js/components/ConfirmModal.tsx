import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2, LogOut, HelpCircle } from 'lucide-react'

type ConfirmVariant = 'default' | 'destructive' | 'logout'

interface ConfirmModalProps {
  open: boolean
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title = 'Konfirmasi',
  description,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const isDestructive = variant === 'destructive'
  const isLogout = variant === 'logout'

  const Icon = isDestructive ? Trash2 : isLogout ? LogOut : HelpCircle

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) onCancel() }}>
      <DialogContent className="sm:max-w-[380px] p-0 gap-0 overflow-hidden rounded-md border border-border/60 shadow-lg" hideCloseButton>

        <div className="px-6 pt-6 pb-5">
          <DialogHeader className="gap-3 text-left">
            {/* Icon kecil inline dengan title */}
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md
                ${isDestructive
                  ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                  : isLogout
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2.2} />
              </span>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-base font-semibold leading-snug">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground leading-relaxed mt-1.5">
                  {description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Divider */}
        <div className="border-t border-border/50 mx-0" />

        <DialogFooter className="flex flex-row items-center justify-end gap-2 px-6 py-4 bg-muted/30">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            className="h-8 px-4 text-sm text-muted-foreground hover:text-foreground"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`h-8 px-4 text-sm gap-1.5 font-medium ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600'
                : isLogout
                ? 'bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-700 dark:hover:bg-amber-600'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}
