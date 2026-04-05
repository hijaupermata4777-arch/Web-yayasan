(function () {
    'use strict';

    /* ══════════ 1. NAVBAR ══════════ */
    var nav = document.getElementById('mainNav');
    window.addEventListener('scroll', function () {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    /* ══════════ 2. SCROLL REVEAL ══════════ */
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var revealObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        reveals.forEach(function (el) { revealObs.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ══════════ 3. LIGHTBOX ══════════ */
    var lightbox   = document.getElementById('lightbox');
    var lbBackdrop = document.getElementById('lightboxBackdrop');
    var lbClose    = document.getElementById('lightboxClose');
    var lbPrev     = document.getElementById('lightboxPrev');
    var lbNext     = document.getElementById('lightboxNext');
    var lbImgWrap  = document.getElementById('lightboxImgWrap');
    var lbImg      = document.getElementById('lightboxImg');
    var lbCaption  = document.getElementById('lightboxCaption');
    var lbCounter  = document.getElementById('lightboxCounter');
    var galeriItems = Array.from(document.querySelectorAll('.galeri-item'));
    var currentIndex = 0, isAnimating = false;

    function openLightbox(index) {
        currentIndex = index;
        var item = galeriItems[index];
        var src = item.getAttribute('data-src') || item.querySelector('img').src;
        var caption = item.getAttribute('data-caption') || item.querySelector('img').alt || '';
        lbImg.src = src; lbImg.alt = caption;
        lbCaption.textContent = caption;
        lbCounter.textContent = (index + 1) + ' / ' + galeriItems.length;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
        setTimeout(function () { lbClose.focus(); }, 50);
    }
    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
        lbImg.src = '';
    }
    function goTo(index) {
        if (isAnimating) return;
        index = ((index % galeriItems.length) + galeriItems.length) % galeriItems.length;
        if (index === currentIndex) return;
        isAnimating = true;
        lbImgWrap.classList.add('swapping');
        var item = galeriItems[index];
        var src = item.getAttribute('data-src') || item.querySelector('img').src;
        var caption = item.getAttribute('data-caption') || item.querySelector('img').alt || '';
        setTimeout(function () {
            lbImg.src = src; lbImg.alt = caption;
            lbCaption.textContent = caption;
            lbCounter.textContent = (index + 1) + ' / ' + galeriItems.length;
            currentIndex = index;
        }, 120);
        setTimeout(function () { lbImgWrap.classList.remove('swapping'); isAnimating = false; }, 260);
    }
    galeriItems.forEach(function (item, i) { item.addEventListener('click', function () { openLightbox(i); }); });
    lbClose.addEventListener('click', closeLightbox);
    lbBackdrop.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function () { goTo(currentIndex - 1); });
    lbNext.addEventListener('click', function () { goTo(currentIndex + 1); });
    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') goTo(currentIndex - 1);
        if (e.key === 'ArrowRight') goTo(currentIndex + 1);
    });
    var touchStartX = 0, touchEndX = 0;
    lightbox.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        var diff = touchStartX - touchEndX;
        if (Math.abs(diff) >= 50) { if (diff > 0) goTo(currentIndex + 1); else goTo(currentIndex - 1); }
    }, { passive: true });

    /* ══════════ 4. MULTI-PDF DOWNLOAD ══════════ */

    // ── Daftar dokumen — tambah/hapus sesuai kebutuhan ──
    var PDF_DOCS = [
        {
            name: 'rencana layanan 3 desa (Cinangka, bj jengkol, Tegalwaru)',
            file: 'pdf/rencana layanan 3 desa (Cinangka, bj jengkol, Tegalwaru).pdf',
            download: 'Proposal-Tran-Mahsur-2026.pdf',
            tag: 'PDF',
        },
        {
            name: 'akta notaris Yay trah manshur',
            file: 'pdf/akta notaris Yay trah manshur.pdf',
            download: 'akta notaris Yay trah manshur.pdf',
            tag: 'PDF'
        },
        {
            name: 'المستلمين مساعدة ماء نظيف',
            file: 'pdf/المستلمين مساعدة ماء نظيف (AutoRecovered).pdf',
            download: 'المستلمين مساعدة ماء نظيف.pdf',
            tag: 'PDF'
        },
    ];

    var grid = document.getElementById('pdfGrid');
    if (grid) {
        PDF_DOCS.forEach(function (doc, i) {
            var card = document.createElement('div');
            card.className = 'pdf-item-card reveal reveal-delay-' + Math.min(i + 1, 4);
            card.innerHTML =
                '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">' +
                    '<div class="pdf-item-card__icon">' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
                        '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>' +
                        '<polyline points="14 2 14 8 20 8"/>' +
                        '<line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>' +
                        '</svg>' +
                    '</div>' +
                    '<span class="pdf-item-card__tag' + (doc.tagNew ? ' tag-new' : '') + '">' + doc.tag + '</span>' +
                '</div>' +
                '<div>' +
                    '<div class="pdf-item-card__name">' + doc.name + '</div>' +
                    '<div class="pdf-item-card__meta">' + doc.meta + '</div>' +
                '</div>' +
                '<div class="pdf-item-card__progress" id="prog-' + i + '">' +
                    '<div class="pdf-item-card__progress-bar" id="bar-' + i + '"></div>' +
                '</div>' +
                '<button class="btn-pdf-item" id="dlbtn-' + i + '">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '<path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17"/>' +
                    '</svg>' +
                    'Unduh' +
                '</button>';
            grid.appendChild(card);

            document.getElementById('dlbtn-' + i).addEventListener('click', function () {
                handlePdfDownload(i, doc);
            });
        });

        // Observe kartu yang baru dibuat
        if ('IntersectionObserver' in window) {
            grid.querySelectorAll('.reveal').forEach(function (el) { revealObs.observe(el); });
        } else {
            grid.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
        }
    }

    function handlePdfDownload(i, doc) {
        var btn  = document.getElementById('dlbtn-' + i);
        var prog = document.getElementById('prog-' + i);
        var bar  = document.getElementById('bar-' + i);
        if (btn.disabled) return;
        btn.disabled = true;
        btn.innerHTML = '<span>Mempersiapkan…</span>';
        prog.classList.add('show');
        var w = 0;
        var iv = setInterval(function () {
            w += Math.random() * 18 + 8;
            if (w > 92) w = 92;
            bar.style.width = w + '%';
        }, 160);
        setTimeout(function () {
            clearInterval(iv);
            bar.style.width = '100%';
            var a = document.createElement('a');
            a.href = doc.file;
            a.download = doc.download;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"/></svg> Diunduh';
            setTimeout(function () {
                btn.disabled = false;
                btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17"/></svg> Unduh';
                prog.classList.remove('show');
                bar.style.width = '0%';
            }, 3000);
        }, 1600);
    }

})();

const slider = document.getElementById('videoSlider');
const btnPrev = document.getElementById('slidePrev');
const btnNext = document.getElementById('slideNext');

// Fungsi untuk geser ke kanan
btnNext.addEventListener('click', () => {
    const cardWidth = slider.querySelector('.video-card').offsetWidth + 20; // lebar video + gap
    slider.scrollBy({ left: cardWidth, behavior: 'smooth' });
});

// Fungsi untuk geser ke kiri
btnPrev.addEventListener('click', () => {
    const cardWidth = slider.querySelector('.video-card').offsetWidth + 20;
    slider.scrollBy({ left: -cardWidth, behavior: 'smooth' });
});

// Opsional: Sembunyikan tombol jika sudah mentok (UX lebih baik)
slider.addEventListener('scroll', () => {
    const scrollLeft = slider.scrollLeft;
    const maxScroll = slider.scrollWidth - slider.clientWidth;

    btnPrev.style.opacity = scrollLeft <= 0 ? '0.3' : '1';
    btnNext.style.opacity = scrollLeft >= maxScroll - 5 ? '0.3' : '1';
});
