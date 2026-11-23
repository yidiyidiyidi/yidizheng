/* ==========================================================
   AUTOPLAY — the NTS mix starts when someone enters the site
   and keeps going (from where it was) as they move between pages.

   - Every page loads this file. On the sound page it uses the NTS
     player that's already there; on other pages it adds a hidden one.
   - Entering the site starts the mix 20 seconds in; moving
     between pages picks it up where the last page left off.
   - If the visitor pauses the NTS mix (or starts another mix on the
     sound page), autoplay stays off for the rest of their visit.
   - Browsers often block sound until the visitor has clicked or
     pressed a key once; in that case the mix starts on their first
     click/keypress anywhere on the page.
   - Autoplay never shows the progress bar; it only appears when the
     visitor starts a mix themselves with a play button.
   ========================================================== */
(function () {
    var TRACK = 'https%3A//soundcloud.com/user-202286394-991268468/rooftop-variety-shop-mix-w';
    var POS_KEY = 'nts-autoplay-position';
    var OFF_KEY = 'nts-autoplay-off';
    var START_AT = 20000;   // autoplay begins 20 seconds into the mix (milliseconds)

    function store(key, val) {
        try { if (val === null) sessionStorage.removeItem(key); else sessionStorage.setItem(key, val); } catch (e) {}
    }
    function read(key) {
        try { return sessionStorage.getItem(key); } catch (e) { return null; }
    }

    var widget = null, auto = false, started = false, resumeAt = 0, lastPos = 0;

    window.NTSAuto = {
        // true while the NTS mix is playing because of autoplay (not a click on its button)
        isAuto: function () { return auto; },
        // the visitor clicked the NTS play button themselves
        userControl: function () { auto = false; },
        // the visitor paused the NTS mix: no more autoplay this visit
        userPaused: function () { auto = false; store(OFF_KEY, '1'); },
        // the visitor played the NTS mix themselves: autoplay may resume on other pages
        userPlayed: function () { store(OFF_KEY, null); },
        // another mix was started on the sound page: stop NTS and stay off
        stop: function () {
            store(OFF_KEY, '1');
            auto = false;
            if (widget) widget.pause();
        }
    };

    function init() {
        if (typeof SC === 'undefined' || !SC.Widget) return;

        var iframe = document.getElementById('nts-player');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'nts-player';
            iframe.className = 'sc-hidden-player';
            iframe.setAttribute('allow', 'autoplay');
            iframe.setAttribute('aria-hidden', 'true');
            iframe.setAttribute('tabindex', '-1');
            iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden;';
            iframe.src = 'https://w.soundcloud.com/player/?url=' + TRACK +
                '&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false';
            document.body.appendChild(iframe);
        }
        widget = SC.Widget(iframe);

        // Entering the site (typed address, link from elsewhere, bookmark, reload)
        // starts the mix at 0:20; only moving from one of these pages to another
        // picks it up where it left off.
        var nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
        var fromOwnPage = false;
        try { fromOwnPage = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) {}
        var entering = nav.type === 'reload' || !fromOwnPage;
        if (entering) { store(POS_KEY, null); store(OFF_KEY, null); }
        resumeAt = entering ? START_AT : (parseFloat(read(POS_KEY)) || START_AT);

        widget.bind(SC.Widget.Events.PLAY_PROGRESS, function (d) {
            lastPos = d.currentPosition;
            store(POS_KEY, String(lastPos));
        });
        widget.bind(SC.Widget.Events.PLAY, function () {
            started = true;
            if (auto && resumeAt > 1000) { var t = resumeAt; resumeAt = 0; widget.seekTo(t); }
        });
        widget.bind(SC.Widget.Events.FINISH, function () {
            store(POS_KEY, null);
            store(OFF_KEY, '1');
            auto = false;
        });
        widget.bind(SC.Widget.Events.READY, function () {
            if (read(OFF_KEY) === '1') return;     // visitor turned it off earlier in this visit
            auto = true;
            widget.play();
            // if the browser blocked it, start on the first click or keypress instead
            setTimeout(function () {
                if (started || read(OFF_KEY) === '1') return;
                function kick(e) {
                    if (e.target && e.target.closest && e.target.closest('.audio-control-btn')) return; // a play button handles itself
                    remove();
                    if (read(OFF_KEY) === '1' || started) return;
                    auto = true;
                    widget.play();
                }
                function remove() {
                    document.removeEventListener('pointerdown', kick, true);
                    document.removeEventListener('keydown', kick, true);
                }
                document.addEventListener('pointerdown', kick, true);
                document.addEventListener('keydown', kick, true);
            }, 1500);
        });

        window.addEventListener('pagehide', function () {
            if (lastPos) store(POS_KEY, String(lastPos));
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
