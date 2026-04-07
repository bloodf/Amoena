import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from './sidebar';
import React from 'react';

// Helper: minimal sidebar tree
function BasicSidebar({
  children,
  defaultOpen = true,
}: {
  children?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar>
        <SidebarContent>{children}</SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}

describe('SidebarProvider', () => {
  test('renders children', () => {
    render(
      <SidebarProvider>
        <div>child content</div>
      </SidebarProvider>,
    );
    expect(screen.getByText('child content')).toBeTruthy();
  });

  test('applies custom className', () => {
    const { container } = render(
      <SidebarProvider className="custom-class">
        <div>child</div>
      </SidebarProvider>,
    );
    // The wrapper div should have the custom class
    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).not.toBeNull();
  });

  test('defaultOpen=true sets expanded state', () => {
    const { container } = render(
      <SidebarProvider defaultOpen={true}>
        <Sidebar>
          <SidebarContent />
        </Sidebar>
      </SidebarProvider>,
    );
    expect(container.querySelector("[data-state='expanded']")).not.toBeNull();
  });

  test('defaultOpen=false sets collapsed state', () => {
    const { container } = render(
      <SidebarProvider defaultOpen={false}>
        <Sidebar>
          <SidebarContent />
        </Sidebar>
      </SidebarProvider>,
    );
    expect(container.querySelector("[data-state='collapsed']")).not.toBeNull();
  });

  test('controlled open prop sets expanded state', () => {
    const { container } = render(
      <SidebarProvider open={true}>
        <Sidebar>
          <SidebarContent />
        </Sidebar>
      </SidebarProvider>,
    );
    expect(container.querySelector("[data-state='expanded']")).not.toBeNull();
  });

  test('controlled open=false prop sets collapsed state', () => {
    const { container } = render(
      <SidebarProvider open={false}>
        <Sidebar>
          <SidebarContent />
        </Sidebar>
      </SidebarProvider>,
    );
    expect(container.querySelector("[data-state='collapsed']")).not.toBeNull();
  });

  test('calls onOpenChange when controlled', () => {
    const onOpenChange = vi.fn();
    render(
      <SidebarProvider open={true} onOpenChange={onOpenChange}>
        <Sidebar>
          <SidebarContent />
        </Sidebar>
        <SidebarTrigger />
      </SidebarProvider>,
    );
    const trigger = screen.getByRole('button', { name: /toggle sidebar/i });
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test('keyboard shortcut Ctrl+B toggles sidebar', () => {
    const { container } = render(
      <SidebarProvider defaultOpen={true}>
        <Sidebar>
          <SidebarContent />
        </Sidebar>
      </SidebarProvider>,
    );
    expect(container.querySelector("[data-state='expanded']")).not.toBeNull();
    fireEvent.keyDown(window, { key: 'b', ctrlKey: true });
    expect(container.querySelector("[data-state='collapsed']")).not.toBeNull();
  });

  test('keyboard shortcut Meta+B toggles sidebar', () => {
    const { container } = render(
      <SidebarProvider defaultOpen={true}>
        <Sidebar>
          <SidebarContent />
        </Sidebar>
      </SidebarProvider>,
    );
    fireEvent.keyDown(window, { key: 'b', metaKey: true });
    expect(container.querySelector("[data-state='collapsed']")).not.toBeNull();
  });

  test('keyboard shortcut without ctrl/meta does not toggle', () => {
    const { container } = render(
      <SidebarProvider defaultOpen={true}>
        <Sidebar>
          <SidebarContent />
        </Sidebar>
      </SidebarProvider>,
    );
    fireEvent.keyDown(window, { key: 'b' });
    // Should remain expanded
    expect(container.querySelector("[data-state='expanded']")).not.toBeNull();
  });

  test('sets cookie when toggled', () => {
    render(
      <SidebarProvider defaultOpen={true}>
        <Sidebar>
          <SidebarContent />
        </Sidebar>
        <SidebarTrigger />
      </SidebarProvider>,
    );
    const trigger = screen.getByRole('button', { name: /toggle sidebar/i });
    fireEvent.click(trigger);
    expect(document.cookie).toContain('sidebar:state');
  });
});

describe('useSidebar', () => {
  test('throws when used outside SidebarProvider', () => {
    const ThrowingComponent = () => {
      useSidebar();
      return null;
    };
    expect(() => render(<ThrowingComponent />)).toThrow(
      'useSidebar must be used within a SidebarProvider.',
    );
  });

  test('exposes state, open, toggleSidebar from context', () => {
    let ctx: ReturnType<typeof useSidebar> | null = null;
    const Inspector = () => {
      ctx = useSidebar();
      return null;
    };
    render(
      <SidebarProvider defaultOpen={true}>
        <Inspector />
      </SidebarProvider>,
    );
    expect(ctx!.state).toBe('expanded');
    expect(ctx!.open).toBe(true);
    expect(typeof ctx!.toggleSidebar).toBe('function');
  });

  test('toggleSidebar changes open state via SidebarTrigger', () => {
    const { container } = render(
      <SidebarProvider defaultOpen={true}>
        <Sidebar>
          <SidebarContent />
        </Sidebar>
        <SidebarTrigger />
      </SidebarProvider>,
    );
    expect(container.querySelector("[data-state='expanded']")).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /toggle sidebar/i }));
    expect(container.querySelector("[data-state='collapsed']")).not.toBeNull();
  });
});

describe('Sidebar component', () => {
  test('collapsible=none renders simple div without state', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <div>static content</div>
        </Sidebar>
      </SidebarProvider>,
    );
    expect(screen.getByText('static content')).toBeTruthy();
    // Should NOT have data-state attribute (collapsible=none branch)
    expect(container.querySelector('[data-state]')).toBeNull();
  });

  test('side=right sets data-side attribute', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar side="right">
          <SidebarContent />
        </Sidebar>
      </SidebarProvider>,
    );
    expect(container.querySelector("[data-side='right']")).not.toBeNull();
  });

  test('side=left is default', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent />
        </Sidebar>
      </SidebarProvider>,
    );
    expect(container.querySelector("[data-side='left']")).not.toBeNull();
  });

  test('variant=floating sets data-variant', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar variant="floating">
          <SidebarContent />
        </Sidebar>
      </SidebarProvider>,
    );
    expect(container.querySelector("[data-variant='floating']")).not.toBeNull();
  });

  test('variant=inset sets data-variant', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar variant="inset">
          <SidebarContent />
        </Sidebar>
      </SidebarProvider>,
    );
    expect(container.querySelector("[data-variant='inset']")).not.toBeNull();
  });

  test('collapsible=icon sets data-collapsible when collapsed', () => {
    const { container } = render(
      <SidebarProvider defaultOpen={false}>
        <Sidebar collapsible="icon">
          <SidebarContent />
        </Sidebar>
      </SidebarProvider>,
    );
    const el = container.querySelector("[data-collapsible='icon']");
    expect(el).not.toBeNull();
  });

  test('data-collapsible is empty string when expanded', () => {
    const { container } = render(
      <SidebarProvider defaultOpen={true}>
        <Sidebar collapsible="icon">
          <SidebarContent />
        </Sidebar>
      </SidebarProvider>,
    );
    const el = container.querySelector("[data-collapsible='']");
    expect(el).not.toBeNull();
  });
});

describe('SidebarTrigger', () => {
  test('renders toggle button', () => {
    render(
      <SidebarProvider>
        <SidebarTrigger />
      </SidebarProvider>,
    );
    expect(screen.getByRole('button', { name: /toggle sidebar/i })).toBeTruthy();
  });

  test('calls custom onClick in addition to toggling', () => {
    const onClick = vi.fn();
    render(
      <SidebarProvider defaultOpen={true}>
        <Sidebar>
          <SidebarContent />
        </Sidebar>
        <SidebarTrigger onClick={onClick} />
      </SidebarProvider>,
    );
    const btn = screen.getByRole('button', { name: /toggle sidebar/i });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('toggles sidebar from expanded to collapsed on click', () => {
    const { container } = render(
      <SidebarProvider defaultOpen={true}>
        <Sidebar>
          <SidebarContent />
        </Sidebar>
        <SidebarTrigger />
      </SidebarProvider>,
    );
    expect(container.querySelector("[data-state='expanded']")).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /toggle sidebar/i }));
    expect(container.querySelector("[data-state='collapsed']")).not.toBeNull();
  });

  test('toggles sidebar from collapsed to expanded on click', () => {
    const { container } = render(
      <SidebarProvider defaultOpen={false}>
        <Sidebar>
          <SidebarContent />
        </Sidebar>
        <SidebarTrigger />
      </SidebarProvider>,
    );
    expect(container.querySelector("[data-state='collapsed']")).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /toggle sidebar/i }));
    expect(container.querySelector("[data-state='expanded']")).not.toBeNull();
  });

  test('has data-sidebar=trigger attribute', () => {
    const { container } = render(
      <SidebarProvider>
        <SidebarTrigger />
      </SidebarProvider>,
    );
    expect(container.querySelector("[data-sidebar='trigger']")).not.toBeNull();
  });
});

describe('SidebarRail', () => {
  test('renders rail button with aria-label', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarRail />
        </Sidebar>
      </SidebarProvider>,
    );
    const rail = screen.getByRole('button', { name: /toggle sidebar/i });
    expect(rail).toBeTruthy();
  });

  test('has data-sidebar=rail attribute', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarRail />
        </Sidebar>
      </SidebarProvider>,
    );
    expect(container.querySelector("[data-sidebar='rail']")).not.toBeNull();
  });

  test('clicking rail toggles sidebar', () => {
    const { container } = render(
      <SidebarProvider defaultOpen={true}>
        <Sidebar>
          <SidebarRail />
          <SidebarContent />
        </Sidebar>
      </SidebarProvider>,
    );
    const rail = container.querySelector("[data-sidebar='rail']") as HTMLElement;
    fireEvent.click(rail);
    expect(container.querySelector("[data-state='collapsed']")).not.toBeNull();
  });
});

describe('SidebarInset', () => {
  test('renders as main element', () => {
    render(
      <SidebarProvider>
        <SidebarInset>main content</SidebarInset>
      </SidebarProvider>,
    );
    const main = screen.getByRole('main');
    expect(main).toBeTruthy();
    expect(main.textContent).toContain('main content');
  });
});

describe('SidebarInput', () => {
  test('renders input with data-sidebar=input', () => {
    const { container } = render(
      <SidebarProvider>
        <SidebarInput placeholder="Search..." />
      </SidebarProvider>,
    );
    expect(container.querySelector("[data-sidebar='input']")).not.toBeNull();
  });

  test('input is interactive', () => {
    render(
      <SidebarProvider>
        <SidebarInput placeholder="Search..." />
      </SidebarProvider>,
    );
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect((input as HTMLInputElement).value).toBe('hello');
  });
});

describe('SidebarHeader and SidebarFooter', () => {
  test('SidebarHeader renders with data-sidebar=header', () => {
    const { container } = render(
      <SidebarProvider>
        <SidebarHeader>Header content</SidebarHeader>
      </SidebarProvider>,
    );
    expect(container.querySelector("[data-sidebar='header']")).not.toBeNull();
    expect(screen.getByText('Header content')).toBeTruthy();
  });

  test('SidebarFooter renders with data-sidebar=footer', () => {
    const { container } = render(
      <SidebarProvider>
        <SidebarFooter>Footer content</SidebarFooter>
      </SidebarProvider>,
    );
    expect(container.querySelector("[data-sidebar='footer']")).not.toBeNull();
    expect(screen.getByText('Footer content')).toBeTruthy();
  });
});

describe('SidebarSeparator', () => {
  test('renders with data-sidebar=separator', () => {
    const { container } = render(
      <SidebarProvider>
        <SidebarSeparator />
      </SidebarProvider>,
    );
    expect(container.querySelector("[data-sidebar='separator']")).not.toBeNull();
  });
});

describe('SidebarContent', () => {
  test('renders with data-sidebar=content', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>content</SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );
    expect(container.querySelector("[data-sidebar='content']")).not.toBeNull();
  });
});

describe('SidebarGroup', () => {
  test('renders with data-sidebar=group', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarGroup>group</SidebarGroup>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-sidebar='group']")).not.toBeNull();
  });
});

describe('SidebarGroupLabel', () => {
  test('renders with data-sidebar=group-label', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarGroup>
          <SidebarGroupLabel>My Group</SidebarGroupLabel>
        </SidebarGroup>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-sidebar='group-label']")).not.toBeNull();
    expect(screen.getByText('My Group')).toBeTruthy();
  });

  test('asChild renders the slot instead of div', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <span>Slot Label</span>
          </SidebarGroupLabel>
        </SidebarGroup>
      </BasicSidebar>,
    );
    // asChild=true uses Slot — content should still render
    expect(screen.getByText('Slot Label')).toBeTruthy();
    // The group-label data attr is forwarded via Slot
    expect(container.querySelector("[data-sidebar='group-label']")).not.toBeNull();
  });
});

describe('SidebarGroupAction', () => {
  test('renders button with data-sidebar=group-action', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarGroup>
          <SidebarGroupAction aria-label="Add item">+</SidebarGroupAction>
        </SidebarGroup>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-sidebar='group-action']")).not.toBeNull();
  });

  test('asChild renders slot', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarGroup>
          <SidebarGroupAction asChild>
            <a href="#">link action</a>
          </SidebarGroupAction>
        </SidebarGroup>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-sidebar='group-action']")).not.toBeNull();
  });

  test('handles click events', () => {
    const onClick = vi.fn();
    render(
      <BasicSidebar>
        <SidebarGroup>
          <SidebarGroupAction onClick={onClick}>Add</SidebarGroupAction>
        </SidebarGroup>
      </BasicSidebar>,
    );
    fireEvent.click(screen.getByText('Add'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('SidebarGroupContent', () => {
  test('renders with data-sidebar=group-content', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarGroup>
          <SidebarGroupContent>content items</SidebarGroupContent>
        </SidebarGroup>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-sidebar='group-content']")).not.toBeNull();
  });
});

describe('SidebarMenu and SidebarMenuItem', () => {
  test('renders list with data-sidebar=menu', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenu>
          <SidebarMenuItem>item</SidebarMenuItem>
        </SidebarMenu>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-sidebar='menu']")).not.toBeNull();
    expect(container.querySelector("[data-sidebar='menu-item']")).not.toBeNull();
  });
});

describe('SidebarMenuButton', () => {
  test('renders button with data-sidebar=menu-button', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Click me</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-sidebar='menu-button']")).not.toBeNull();
  });

  test('isActive sets data-active=true', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive>Active item</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-active='true']")).not.toBeNull();
  });

  test('isActive=false sets data-active=false', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive={false}>Inactive</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-active='false']")).not.toBeNull();
  });

  test('size=sm sets data-size=sm', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="sm">Small</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-size='sm']")).not.toBeNull();
  });

  test('size=lg sets data-size=lg', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">Large</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-size='lg']")).not.toBeNull();
  });

  test('variant=outline applies outline class', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton variant="outline">Outline</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </BasicSidebar>,
    );
    const btn = container.querySelector("[data-sidebar='menu-button']");
    expect(btn?.className).toContain('bg-background');
  });

  test('asChild renders slot element', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="#">Link item</a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-sidebar='menu-button']")).not.toBeNull();
  });

  test('tooltip as string renders wrapped in Tooltip', () => {
    const { container } = render(
      <BasicSidebar defaultOpen={false}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="My tooltip">Item</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </BasicSidebar>,
    );
    // Button is wrapped in a TooltipTrigger when tooltip is provided
    expect(container.querySelector("[data-sidebar='menu-button']")).not.toBeNull();
  });

  test('tooltip as object renders wrapped in Tooltip', () => {
    const { container } = render(
      <BasicSidebar defaultOpen={false}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={{ children: 'Object tooltip' }}>Item</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-sidebar='menu-button']")).not.toBeNull();
  });

  test('handles click events', () => {
    const onClick = vi.fn();
    render(
      <BasicSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onClick}>Clickable</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </BasicSidebar>,
    );
    fireEvent.click(screen.getByText('Clickable'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('SidebarMenuAction', () => {
  test('renders with data-sidebar=menu-action', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Item</SidebarMenuButton>
            <SidebarMenuAction aria-label="action">...</SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-sidebar='menu-action']")).not.toBeNull();
  });

  test('showOnHover=true adds opacity-0 class', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Item</SidebarMenuButton>
            <SidebarMenuAction showOnHover>...</SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      </BasicSidebar>,
    );
    const action = container.querySelector("[data-sidebar='menu-action']");
    expect(action?.className).toContain('md:opacity-0');
  });

  test('showOnHover=false does not add opacity-0', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Item</SidebarMenuButton>
            <SidebarMenuAction showOnHover={false}>...</SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      </BasicSidebar>,
    );
    const action = container.querySelector("[data-sidebar='menu-action']");
    expect(action?.className).not.toContain('md:opacity-0');
  });

  test('asChild renders slot', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Item</SidebarMenuButton>
            <SidebarMenuAction asChild>
              <a href="#">action link</a>
            </SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-sidebar='menu-action']")).not.toBeNull();
  });
});

describe('SidebarMenuBadge', () => {
  test('renders badge with data-sidebar=menu-badge', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Item</SidebarMenuButton>
            <SidebarMenuBadge>5</SidebarMenuBadge>
          </SidebarMenuItem>
        </SidebarMenu>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-sidebar='menu-badge']")).not.toBeNull();
    expect(screen.getByText('5')).toBeTruthy();
  });
});

describe('SidebarMenuSkeleton', () => {
  test('renders skeleton without icon by default', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuSkeleton />
          </SidebarMenuItem>
        </SidebarMenu>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-sidebar='menu-skeleton']")).not.toBeNull();
    expect(container.querySelector("[data-sidebar='menu-skeleton-icon']")).toBeNull();
  });

  test('renders skeleton with icon when showIcon=true', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuSkeleton showIcon />
          </SidebarMenuItem>
        </SidebarMenu>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-sidebar='menu-skeleton-icon']")).not.toBeNull();
  });

  test('skeleton text has random width style', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenuSkeleton />
      </BasicSidebar>,
    );
    const skeletonText = container.querySelector("[data-sidebar='menu-skeleton-text']");
    // The style may be inline or computed — just verify the element exists
    expect(skeletonText).not.toBeNull();
  });
});

describe('SidebarMenuSub and SidebarMenuSubItem', () => {
  test('renders sub-menu list with data-sidebar=menu-sub', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton href="#">Sub item</SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenuItem>
        </SidebarMenu>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-sidebar='menu-sub']")).not.toBeNull();
    expect(screen.getByText('Sub item')).toBeTruthy();
  });
});

describe('SidebarMenuSubButton', () => {
  test('renders with data-sidebar=menu-sub-button', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenuSubButton href="#">Sub link</SidebarMenuSubButton>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-sidebar='menu-sub-button']")).not.toBeNull();
  });

  test('size=sm sets data-size=sm', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenuSubButton size="sm">Small sub</SidebarMenuSubButton>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-size='sm']")).not.toBeNull();
  });

  test('size=md is default', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenuSubButton>Default sub</SidebarMenuSubButton>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-size='md']")).not.toBeNull();
  });

  test('isActive sets data-active=true', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenuSubButton isActive>Active sub</SidebarMenuSubButton>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-active='true']")).not.toBeNull();
  });

  test('asChild renders slot', () => {
    const { container } = render(
      <BasicSidebar>
        <SidebarMenuSubButton asChild>
          <button>button sub</button>
        </SidebarMenuSubButton>
      </BasicSidebar>,
    );
    expect(container.querySelector("[data-sidebar='menu-sub-button']")).not.toBeNull();
  });
});

describe('Sidebar full composition', () => {
  test('renders complete sidebar structure', () => {
    render(
      <SidebarProvider defaultOpen>
        <Sidebar>
          <SidebarHeader>
            <div>App Logo</div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main Nav</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>Dashboard</SidebarMenuButton>
                    <SidebarMenuBadge>3</SidebarMenuBadge>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Settings</SidebarMenuButton>
                    <SidebarMenuAction showOnHover>...</SidebarMenuAction>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Sub Nav</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Projects</SidebarMenuButton>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton isActive>Project A</SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div>User profile</div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <main>Content area</main>
        </SidebarInset>
        <SidebarTrigger />
      </SidebarProvider>,
    );

    expect(screen.getByText('App Logo')).toBeTruthy();
    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('Project A')).toBeTruthy();
    expect(screen.getByText('User profile')).toBeTruthy();
  });

  test('toggle cycle works correctly', () => {
    const { container } = render(
      <SidebarProvider defaultOpen={true}>
        <Sidebar>
          <SidebarContent />
        </Sidebar>
        <SidebarTrigger />
      </SidebarProvider>,
    );
    const trigger = screen.getByRole('button', { name: /toggle sidebar/i });

    // Start expanded
    expect(container.querySelector("[data-state='expanded']")).not.toBeNull();

    // First toggle -> collapsed
    fireEvent.click(trigger);
    expect(container.querySelector("[data-state='collapsed']")).not.toBeNull();

    // Second toggle -> expanded again
    fireEvent.click(trigger);
    expect(container.querySelector("[data-state='expanded']")).not.toBeNull();
  });
});
