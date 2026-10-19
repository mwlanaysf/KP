import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface AsyncComboboxItem {
  id: number | string
  label: string
  disabled?: boolean
}

interface AsyncComboboxProps {
  value?: string
  onChange: (value: string) => void
  searchUrl: string
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  excludeIds?: string[]
  className?: string
}

export function AsyncCombobox({
  value,
  onChange,
  searchUrl,
  placeholder = "Pilih...",
  searchPlaceholder = "Cari...",
  emptyText = "Tidak ada hasil.",
  disabled = false,
  excludeIds = [],
  className,
}: AsyncComboboxProps) {

  const [open, setOpen] = React.useState(false)
  const [items, setItems] = React.useState<AsyncComboboxItem[]>([])
  const [selected, setSelected] = React.useState<AsyncComboboxItem | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const fetchItems = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set("q", search || "")

      if (excludeIds.length > 0) {
        params.set("exclude", excludeIds.join(","))
      }

      const response = await fetch(`${searchUrl}?${params.toString()}`, {
        headers: { Accept: "application/json" },
      })

      if (response.ok) {
        const data = await response.json()
        setItems(Array.isArray(data) ? data : [])
      }

    } catch {
      setError("Gagal memuat data")
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch items immediately when dropdown opens (no debounce)
  React.useEffect(() => {
    if (!open) return
    fetchItems()
  }, [open])

  // Debounced search for typing
  React.useEffect(() => {
    if (!open) return
    const timer = setTimeout(fetchItems, 300)
    return () => clearTimeout(timer)
  }, [open, search])

  React.useEffect(() => {
    if (!value) {
      setSelected(null)
      return
    }

    const fetchSelected = async () => {
      try {
        const response = await fetch(`${searchUrl}?id=${value}`, {
          headers: { Accept: "application/json" },
        })

        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data) && data.length > 0) {
            setSelected(data[0])
          }
        }
      } catch {
        // ignore error silently for now
      }
    }

    fetchSelected()
  }, [value])

  const handleOpenChange = (state: boolean) => {
    setOpen(state)
    if (!state) setSearch("")
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", !selected && "text-muted-foreground", className)}
          disabled={disabled}
        >
          {selected?.label || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>

          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>

            {error ? (
              <CommandEmpty>{error}</CommandEmpty>

            ) : loading ? (
              <CommandEmpty>Memuat...</CommandEmpty>

            ) : items.length === 0 ? (
              <CommandEmpty>{emptyText}</CommandEmpty>

            ) : (

              items.map(item => (

                <CommandItem
                  key={String(item.id)}
                  value={String(item.id)}
                  disabled={item.disabled}
                  onSelect={() => {

                    if (item.disabled) return

                    onChange(String(item.id))
                    setSelected(item)
                    setOpen(false)
                    setSearch("")
                  }}
                >

                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === String(item.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />

                  {item.label}

                </CommandItem>

              ))

            )}

          </CommandList>

        </Command>
      </PopoverContent>
    </Popover>
  )
}
