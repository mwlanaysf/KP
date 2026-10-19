import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { router } from '@inertiajs/react'

type PaginationLink = {
  url: string | null
  label: string
  active: boolean
}

type PaginationProps = {
  links: PaginationLink[]
  currentPage: number
  lastPage: number
  from: number
  to: number
  total: number
  /** Override navigate behavior (defaults to router.get) */
  onNavigate?: (url: string) => void
}

/**
 * Generates a compact page range like: 1 2 3 ... 27 28 (around active page)
 */
function getPageNumbers(current: number, last: number): (number | '...')[] {
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1)
  }

  const delta = 2
  const range: (number | '...')[] = []
  const left = Math.max(2, current - delta)
  const right = Math.min(last - 1, current + delta)

  range.push(1)

  if (left > 2) range.push('...')

  for (let i = left; i <= right; i++) {
    range.push(i)
  }

  if (right < last - 1) range.push('...')

  range.push(last)

  return range
}

export function Pagination({
  links,
  currentPage,
  lastPage,
  from,
  to,
  total,
  onNavigate,
}: PaginationProps) {
  if (lastPage <= 1) return null

  const navigate = (url: string | null) => {
    if (!url) return
    if (onNavigate) {
      onNavigate(url)
    } else {
      router.get(url, {}, { preserveScroll: true })
    }
  }

  // Extract URL for page number from links array
  const getPageUrl = (pageNum: number): string | null => {
    // links[0] = Previous, links[1..n-1] = pages, links[n] = Next
    const pageLink = links.find(
      (l) => l.label === String(pageNum) && !l.label.includes('Previous') && !l.label.includes('Next')
    )
    return pageLink?.url ?? null
  }

  const prevLink = links.find((l) => l.label.includes('Previous'))
  const nextLink = links.find((l) => l.label.includes('Next'))

  const pageNumbers = getPageNumbers(currentPage, lastPage)

  return (
    <div className="flex items-center justify-between px-4 py-4 border-t border-border/40">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Menampilkan <span className="font-medium text-gray-700 dark:text-gray-300">{from}</span>–<span className="font-medium text-gray-700 dark:text-gray-300">{to}</span> dari{' '}
        <span className="font-medium text-gray-700 dark:text-gray-300">{total}</span> data
      </div>

      <div className="flex items-center gap-1">
        {/* Previous */}
        <Button
          variant="outline"
          size="sm"
          disabled={!prevLink?.url}
          onClick={() => navigate(prevLink?.url ?? null)}
          className="h-8 w-8 p-0"
          title="Halaman sebelumnya"
        >
          <ChevronLeft size={15} />
        </Button>

        {/* Page numbers */}
        {pageNumbers.map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-sm text-gray-400 select-none">
              …
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => navigate(getPageUrl(page))}
              className={`h-8 min-w-[32px] px-2 text-xs ${page === currentPage ? 'disabled:opacity-100' : ''}`}
              disabled={page === currentPage}
            >
              {page}
            </Button>
          )
        )}

        {/* Next */}
        <Button
          variant="outline"
          size="sm"
          disabled={!nextLink?.url}
          onClick={() => navigate(nextLink?.url ?? null)}
          className="h-8 w-8 p-0"
          title="Halaman berikutnya"
        >
          <ChevronRight size={15} />
        </Button>
      </div>
    </div>
  )
}
