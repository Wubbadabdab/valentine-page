// @ts-check
// MASTER COPY of the inline script at the top of every page's <head>.
// It runs before the CSS paints, so pages never flash the wrong theme.
// If you change the line below, paste the identical line into every .html file —
// tests.html fails if any page's copy is different.
(function(){try{var t=localStorage.getItem('jci-admin-theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','dark')}})();
