// @ts-check
/**
 * no-access.html: shown when the backend says this account isn't allowed
 * (HTTP 403). Offers a way back and a way to switch account.
 */
import { qs } from '../core/dom.js';
import { handleSignOut, renderBanners } from '../components/shell.js';

renderBanners(qs('[data-banners]'));
const button = /** @type {HTMLButtonElement | null} */ (qs('[data-sign-out]'));
button?.addEventListener('click', () => handleSignOut(button));
