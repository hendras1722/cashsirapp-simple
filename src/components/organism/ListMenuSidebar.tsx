'use client'

import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { SquaresExclude, Link } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Else, If } from '../atoms/if'

export default function ListMenuSidebar({
  sidebarCollapsed,
}: {
  readonly sidebarCollapsed: boolean
}) {
  const pathName = usePathname()
  return (
    <nav className="!px-2 !py-4 space-y-1">
      <div className="space-y-1">
        <If condition={!sidebarCollapsed}>
          <Button
            variant={pathName === '/admin/product' ? 'contained' : 'text'}
            href="/admin/product"
            startIcon={<SquaresExclude />}
            size="small"
            className={`!shadow-none !w-full flex !justify-start`}
          >
            {!sidebarCollapsed && 'Product'}
          </Button>
          <Else key="else-1">
            <IconButton
              href="/admin/product"
              aria-label="dashboard"
              color={pathName === '/admin/product' ? 'primary' : 'default'}
            >
              <SquaresExclude />
            </IconButton>
          </Else>
        </If>
      </div>
      <div className="space-y-1">
        <If condition={!sidebarCollapsed}>
          <Button
            variant={pathName === '/' ? 'contained' : 'text'}
            href="/"
            startIcon={<Link />}
            size="small"
            className={`!shadow-none !w-full flex !justify-start`}
          >
            {!sidebarCollapsed && 'View'}
          </Button>
          <Else key="else-1">
            <IconButton
              href="/"
              aria-label="dashboard"
              color={pathName === '/' ? 'primary' : 'default'}
            >
              <Link />
            </IconButton>
          </Else>
        </If>
      </div>

      {/* <div
        onClick={handleLogout}
        className={
          pathName === '/logout'
            ? 'group flex !mb-2 items-center gap-1 !px-3 !py-2 text-sm font-medium rounded-lg transition-colors duration-150 !text-white bg-blue-500 hover:bg-blue-600'
            : 'group flex items-center gap-1 !px-3 !py-2 text-sm font-medium rounded-lg transition-colors !text-black duration-150 hover:bg-gray-100'
        }
      >
        <LogOut className="w-4 h-4" />
        {!sidebarCollapsed && (
          <span
            className={
              sidebarCollapsed
                ? 'lg:opacity-0 lg:w-0 overflow-hidden'
                : 'opacity-100'
            }
          >
            Logout
          </span>
        )}
      </div> */}
    </nav>
  )
}
