// @ts-check
/**
 * The page shell shared by every signed-in page: sidebar (desktop/tablet),
 * top bar + navigation drawer (phones), demo and offline banners, tooltips for
 * the collapsed sidebar, and the session check that runs before page content
 * is shown.
 */
import { el, qs, qsa } from '../core/dom.js';
import { icon } from '../icons.js';
import { getPref, setPref } from '../core/storage.js';
import { requireSession, signOut } from '../core/session.js';
import { initials } from '../api/adapters.js';
import { isDemoMode } from '../api/index.js';
import { userMessage } from '../api/client.js';
import { createThemeSwitch } from './theme-switch.js';
import { setButtonLoading } from './button.js';
import { toast } from './toast.js';
import { errorState, skeleton } from './states.js';

/** @typedef {import('../types.js').Admin} Admin */
/** @typedef {'dashboard' | 'quizzes' | 'question-bank' | 'results' | 'settings'} PageId */

export const NAV_ITEMS = Object.freeze([
  { id: 'dashboard', label: 'Dashboard', href: 'dashboard.html', icon: 'dashboard' },
  { id: 'quizzes', label: 'Quizzes', href: 'quizzes.html', icon: 'quizzes' },
  { id: 'question-bank', label: 'Question Bank', href: 'question-bank.html', icon: 'bank' },
  { id: 'results', label: 'Results', href: 'results.html', icon: 'results' },
  { id: 'settings', label: 'Settings', href: 'settings.html', icon: 'settings' }
]);

const TABLET = window.matchMedia('(min-width: 768px) and (max-width: 1199.98px)');

/**
 * Demo-mode and offline banners. Used by every page, including login.
 * @param {HTMLElement | null} host
 */
export function renderBanners(host) {
  if (!host) return;
  if (isDemoMode) {
    host.append(el('div', { class: 'banner banner--demo', attrs: { role: 'note' } },
      icon('info'),
      el('p', {}, el('strong', { text: 'Demo mode:' }), ' data is stored in this browser only and is not saved to the server.')
    ));
  }
  const offline = el('div', { class: 'banner banner--offline', attrs: { role: 'status' }, hidden: navigator.onLine },
    icon('wifiOff'),
    el('p', { text: "You're offline. Your changes will save when you're back online, as long as this page stays open." })
  );
  host.append(offline);
  window.addEventListener('offline', () => { offline.hidden = false; });
  window.addEventListener('online', () => { offline.hidden = true; });
}

/**
 * Brand, navigation and account area — shared by the sidebar and the drawer.
 * @param {PageId} page
 * @param {'sidebar' | 'drawer'} variant
 */
function buildPanel(page, variant) {
  const isSidebar = variant === 'sidebar';
  const brand = el('a', { class: 'brand', href: 'dashboard.html' },
    el('img', { class: 'brand__logo', src: 'assets/logo.svg', alt: '', width: 36, height: 36 }),
    el('span', { class: 'brand__text' },
      el('span', { class: 'brand__name', text: 'Quiz Admin' }),
      el('span', { class: 'brand__org', text: 'JCI Uniben' }))
  );

  const nav = el('nav', { class: 'nav', attrs: { 'aria-label': 'Main' } },
    el('ul', { class: 'nav__list' }, NAV_ITEMS.map((item) => {
      const current = item.id === page;
      return el('li', {},
        el('a', {
          class: 'nav-link',
          href: item.href,
          attrs: { 'aria-current': current ? 'page' : null, 'data-tooltip': isSidebar ? item.label : null }
        },
        icon(item.icon),
        el('span', { class: 'nav-link__label', text: item.label }),
        current && el('span', { class: 'nav-link__indicator', attrs: { 'aria-hidden': 'true' } }))
      );
    }))
  );

  const userName = el('span', { class: 'user-chip__name' }, el('span', { class: 'skeleton skeleton--line', attrs: { style: 'width:96px' } }));
  const userEmail = el('span', { class: 'user-chip__email' });
  const avatar = el('span', { class: 'avatar', attrs: { 'aria-hidden': 'true' } }, icon('user', { size: 16 }));
  const signOutButton = el('button', {
    type: 'button',
    class: 'btn btn--ghost',
    attrs: { 'data-tooltip': isSidebar ? 'Sign out' : null }
  }, icon('logout'), el('span', { class: 'btn__label collapsible-label', text: 'Sign out' }));
  signOutButton.addEventListener('click', () => handleSignOut(signOutButton));

  const footer = el('div', { class: 'sidebar__footer' },
    createThemeSwitch({ tooltips: isSidebar }),
    el('div', { class: 'user-chip' }, avatar, el('span', { class: 'user-chip__text' }, userName, userEmail)),
    signOutButton
  );

  return { brand, nav, footer, userName, userEmail, avatar };
}

/**
 * Sign out with feedback: the button shows progress, and if the server can't
 * be reached the admin is told (they stay signed in until it succeeds).
 * @param {HTMLButtonElement} button
 */
export async function handleSignOut(button) {
  setButtonLoading(button, true);
  try {
    await signOut();
  } catch (error) {
    setButtonLoading(button, false);
    toast({ type: 'error', message: `Couldn't sign out. ${userMessage(error)}` });
  }
}

/**
 * @param {{ page: PageId, title: string }} options
 */
export function initShell({ page, title }) {
  const body = document.body;
  renderBanners(qs('[data-banners]'));

  // Sidebar (tablet and desktop) ------------------------------------------------
  const sidebarParts = buildPanel(page, 'sidebar');
  const toggle = el('button', { type: 'button', class: 'btn btn--ghost btn--icon sidebar__toggle', attrs: { 'aria-controls': 'sidebar' } });
  const syncToggle = () => {
    const expanded = body.classList.contains('is-sidebar-expanded');
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? 'Collapse sidebar' : 'Expand sidebar');
    toggle.setAttribute('data-tooltip', expanded ? 'Collapse sidebar' : 'Expand sidebar');
    toggle.replaceChildren(icon(expanded ? 'panelClose' : 'panelOpen'));
  };
  body.classList.toggle('is-sidebar-expanded', getPref('sidebar') === 'expanded');
  toggle.addEventListener('click', () => {
    body.classList.toggle('is-sidebar-expanded');
    setPref('sidebar', body.classList.contains('is-sidebar-expanded') ? 'expanded' : 'collapsed');
    syncToggle();
    hideTooltip();
  });
  syncToggle();

  const sidebarHost = qs('[data-sidebar]');
  if (sidebarHost) {
    sidebarHost.id = 'sidebar';
    sidebarHost.replaceChildren(el('div', { class: 'sidebar__inner' },
      el('div', { class: 'sidebar__head' }, sidebarParts.brand, toggle),
      sidebarParts.nav,
      sidebarParts.footer));
  }

  // Phone: top bar + drawer --------------------------------------------------------
  const drawerParts = buildPanel(page, 'drawer');
  const closeDrawer = el('button', { type: 'button', class: 'btn btn--ghost btn--icon', attrs: { 'aria-label': 'Close menu' } }, icon('close'));
  const drawer = el('dialog', { class: 'drawer', id: 'nav-drawer', attrs: { 'aria-label': 'Menu' } },
    el('div', { class: 'sidebar__inner' },
      el('div', { class: 'drawer__head' }, drawerParts.brand, closeDrawer),
      drawerParts.nav,
      drawerParts.footer));
  document.body.appendChild(drawer);

  const menuButton = el('button', {
    type: 'button',
    class: 'btn btn--ghost btn--icon',
    attrs: { 'aria-label': 'Open menu', 'aria-controls': 'nav-drawer', 'aria-expanded': 'false', 'aria-haspopup': 'dialog' }
  }, icon('menu'));
  menuButton.addEventListener('click', () => {
    drawer.showModal();
    menuButton.setAttribute('aria-expanded', 'true');
  });
  closeDrawer.addEventListener('click', () => drawer.close());
  drawer.addEventListener('click', (event) => { if (event.target === drawer) drawer.close(); });
  drawer.addEventListener('close', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.focus({ preventScroll: true });
  });
  // Close the drawer if the screen grows past phone size while it's open.
  window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
    if (event.matches && drawer.open) drawer.close();
  });

  const topbarHost = qs('[data-topbar]');
  topbarHost?.replaceChildren(
    menuButton,
    el('img', { class: 'topbar__logo', src: 'assets/logo.svg', alt: 'JCI Uniben', width: 32, height: 32 }),
    el('span', { class: 'topbar__title', text: title })
  );

  initTooltips(sidebarHost);

  return {
    /** @param {Admin} admin */
    setAdmin(admin) {
      for (const parts of [sidebarParts, drawerParts]) {
        parts.userName.textContent = admin.name;
        parts.userEmail.textContent = admin.email;
        parts.avatar.textContent = initials(admin.name);
      }
    }
  };
}

// Tooltips for the collapsed tablet sidebar --------------------------------------
/** @type {HTMLElement | null} */
let tooltip = null;

function hideTooltip() {
  if (tooltip) tooltip.hidden = true;
}

/** @param {HTMLElement | null} sidebar */
function initTooltips(sidebar) {
  if (!sidebar) return;
  tooltip = el('div', { class: 'tooltip', attrs: { 'aria-hidden': 'true' }, hidden: true });
  document.body.appendChild(tooltip);

  /** @param {Element} target */
  const show = (target) => {
    if (!tooltip || !TABLET.matches || document.body.classList.contains('is-sidebar-expanded')) return;
    const text = target.getAttribute('data-tooltip');
    if (!text) return;
    tooltip.textContent = text;
    tooltip.hidden = false;
    const rect = target.getBoundingClientRect();
    tooltip.style.left = `${rect.right + 10}px`;
    tooltip.style.top = `${rect.top + rect.height / 2 - tooltip.offsetHeight / 2}px`;
  };
  /** @param {Event} event */
  const fromEvent = (event) => (event.target instanceof Element ? event.target.closest('[data-tooltip]') : null);

  sidebar.addEventListener('pointerover', (event) => { const target = fromEvent(event); if (target) show(target); });
  sidebar.addEventListener('pointerout', hideTooltip);
  sidebar.addEventListener('focusin', (event) => {
    const target = fromEvent(event);
    if (target && target.matches(':focus-visible')) show(target);
  });
  sidebar.addEventListener('focusout', hideTooltip);
  sidebar.addEventListener('scroll', hideTooltip, { passive: true });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') hideTooltip(); });
}

/**
 * Standard start-up for a signed-in page:
 * 1. draw the shell immediately (with a loading skeleton in the page),
 * 2. check the session with the backend,
 * 3. only then reveal the page content and call onReady.
 * If the check fails for network/server reasons, show an error with Retry
 * instead of the page — never the protected content.
 * @param {{ page: PageId, title: string, onReady?: (admin: Admin) => void }} options
 */
export function bootPage({ page, title, onReady }) {
  const shell = initShell({ page, title });
  const loading = qs('[data-page-loading]');
  const content = qs('[data-page-content]');

  const run = async () => {
    try {
      const admin = await requireSession();
      if (!admin) return; // redirecting to login or no-access
      shell.setAdmin(admin);
      if (loading) loading.hidden = true;
      if (content) {
        content.hidden = false;
        content.classList.add('fade-in');
      }
      qsa('[data-admin-first-name]').forEach((node) => { node.textContent = admin.name.split(' ')[0]; });
      qsa('[data-admin-greeting]').forEach((node) => { node.hidden = false; });
      onReady?.(admin);
    } catch (error) {
      if (!loading) return;
      loading.replaceChildren(errorState({
        title: "We couldn't check your sign-in",
        message: userMessage(error),
        onRetry: () => {
          loading.replaceChildren(skeleton());
          run();
        }
      }));
    }
  };

  run();
  return shell;
}
