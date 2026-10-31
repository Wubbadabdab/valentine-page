// @ts-check
/**
 * index.html: send signed-in admins to the dashboard and everyone else to
 * the login page (requireSession handles the redirect to login).
 */
import { skipNextPageTransition } from '../core/motion.js';
import { qs } from '../core/dom.js';
import { requireSession } from '../core/session.js';
import { userMessage } from '../api/client.js';
import { errorState } from '../components/states.js';

const status = qs('[data-boot-status]');

function run() {
  requireSession()
    .then((admin) => {
      if (!admin) return;
      skipNextPageTransition();
      window.location.replace('dashboard.html');
    })
    .catch((error) => {
      status?.replaceChildren(errorState({
        title: "We couldn't check your sign-in",
        message: userMessage(error),
        onRetry: () => window.location.reload()
      }));
    });
}

run();
