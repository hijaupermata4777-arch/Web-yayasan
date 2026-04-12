(function () {
    'use strict';

    /* ══════════ 1. NAVBAR ══════════ */
    var nav = document.getElementById('mainNav');
    if (nav) {
        window.addEventListener('scroll', function () {
            nav.classList.toggle('scrolled', window.scrollY > 60);
        }, { passive: true });
    }

    /* ══════════ 2. SCROLL REVEAL ══════════ */
    var revealObs = null;

    function observeEl(el) {
        if (revealObs) {
            revealObs.observe(el);
        } else {
            el.classList.add('visible');
        }
    }

    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        revealObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    revealObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        reveals.forEach(function (el) { revealObs.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ══════════ 3. GALERI TAB TOGGLE ══════════
     *
     *  FIX: Gunakan CSS class .galeri-panel--hidden alih-alih toggle
     *       display:none/grid langsung. Ini mencegah layout thrashing
     *       dan memastikan IntersectionObserver bisa mendeteksi elemen
     *       dengan benar saat panel menjadi visible.
     *
     *  FIX: requestAnimationFrame sebelum observe agar browser selesai
     *       paint ulang layout sebelum observer dihitung.
    ══════════ */
    var tabs        = document.querySelectorAll('#galeri .galeri-tab');
    var galeriPhoto = document.getElementById('galeriPhoto');
    var galeriVideo = document.getElementById('galeriVideo');

    if (tabs.length && galeriPhoto && galeriVideo) {
        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                var target = tab.getAttribute('data-tab');

                // Update active tab
                tabs.forEach(function (t) { t.classList.remove('active'); });
                tab.classList.add('active');

                if (target === 'foto') {
                    galeriPhoto.style.display = 'grid';
                    galeriVideo.style.display = 'none';
                } else {
                    galeriPhoto.style.display = 'none';
                    galeriVideo.style.display = 'grid';

                    // Trigger reveal for video cards that haven't animated yet
                    if (revealObs) {
                        galeriVideo.querySelectorAll('.reveal:not(.visible)').forEach(function (el) {
                            revealObs.observe(el);
                        });
                    } else {
                        galeriVideo.querySelectorAll('.reveal').forEach(function (el) {
                            el.classList.add('visible');
                        });
                    }
                }
            });
        });
    }

    /* ══════════ 4. LIGHTBOX ══════════ */
    var lightbox    = document.getElementById('lightbox');
    var lbBackdrop  = document.getElementById('lightboxBackdrop');
    var lbClose     = document.getElementById('lightboxClose');
    var lbPrev      = document.getElementById('lightboxPrev');
    var lbNext      = document.getElementById('lightboxNext');
    var lbImgWrap   = document.getElementById('lightboxImgWrap');
    var lbImg       = document.getElementById('lightboxImg');
    var lbCaption   = document.getElementById('lightboxCaption');
    var lbCounter   = document.getElementById('lightboxCounter');
    var galeriItems = Array.from(document.querySelectorAll('.galeri-item'));
    var currentIndex = 0;
    var isAnimating  = false;

    function openLightbox(index) {
        currentIndex = index;
        var item    = galeriItems[index];
        var src     = item.getAttribute('data-src') || item.querySelector('img').src;
        var caption = item.getAttribute('data-caption') || item.querySelector('img').alt || '';
        lbImg.src           = src;
        lbImg.alt           = caption;
        lbCaption.textContent = caption;
        lbCounter.textContent = (index + 1) + ' / ' + galeriItems.length;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
        setTimeout(function () { lbClose && lbClose.focus(); }, 50);
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
        var item    = galeriItems[index];
        var src     = item.getAttribute('data-src') || item.querySelector('img').src;
        var caption = item.getAttribute('data-caption') || item.querySelector('img').alt || '';
        setTimeout(function () {
            lbImg.src             = src;
            lbImg.alt             = caption;
            lbCaption.textContent = caption;
            lbCounter.textContent = (index + 1) + ' / ' + galeriItems.length;
            currentIndex = index;
        }, 120);
        setTimeout(function () {
            lbImgWrap.classList.remove('swapping');
            isAnimating = false;
        }, 260);
    }

    if (lightbox) {
        galeriItems.forEach(function (item, i) {
            item.addEventListener('click', function () { openLightbox(i); });
        });
        lbClose   && lbClose.addEventListener('click', closeLightbox);
        lbBackdrop && lbBackdrop.addEventListener('click', closeLightbox);
        lbPrev    && lbPrev.addEventListener('click', function () { goTo(currentIndex - 1); });
        lbNext    && lbNext.addEventListener('click', function () { goTo(currentIndex + 1); });

        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape')      closeLightbox();
            if (e.key === 'ArrowLeft')   goTo(currentIndex - 1);
            if (e.key === 'ArrowRight')  goTo(currentIndex + 1);
        });

        var touchStartX = 0;
        lightbox.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        lightbox.addEventListener('touchend', function (e) {
            var diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) >= 50) { diff > 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1); }
        }, { passive: true });
    }

    /* ══════════ 5. MULTI-PDF DOWNLOAD ══════════ */
    var PDF_DOCS = [
        {
            name: 'Rencana Layanan 3 Desa (Cinangka, Bojong Jengkol, Tegalwaru)',
            file: 'pdf/rencana layanan 3 desa (Cinangka, bj jengkol, Tegalwaru).pdf',
            download: 'Proposal-Trah-Manshur-2026.pdf',
            tag: 'PDF'
        },
        {
            name: 'Akta Notaris Yayasan Trah Manshur',
            file: 'pdf/akta notaris Yay trah manshur.pdf',
            download: 'akta notaris Yay trah manshur.pdf',
            tag: 'PDF'
        },
        {
            name: 'المستلمين مساعدة ماء نظيف',
            file: 'pdf/المستلمين مساعدة ماء نظيف (AutoRecovered).pdf',
            download: 'المستلمين مساعدة ماء نظيف.pdf',
            tag: 'PDF'
        }
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
                    '<span class="pdf-item-card__tag">' + doc.tag + '</span>' +
                '</div>' +
                '<div>' +
                    '<div class="pdf-item-card__name">' + doc.name + '</div>' +
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

        // Observe kartu PDF yang baru dibuat
        grid.querySelectorAll('.reveal').forEach(function (el) { observeEl(el); });
    }

    function handlePdfDownload(i, doc) {
        var btn  = document.getElementById('dlbtn-' + i);
        var prog = document.getElementById('prog-' + i);
        var bar  = document.getElementById('bar-' + i);
        if (!btn || btn.disabled) return;
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
            a.href     = doc.file;
            a.download = doc.download;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><polyline points="20 6 9 17 4 12"/></svg> Diunduh';
            setTimeout(function () {
                btn.disabled  = false;
                btn.innerHTML =
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px">' +
                    '<path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17"/>' +
                    '</svg> Unduh';
                prog.classList.remove('show');
                bar.style.width = '0%';
            }, 3000);
        }, 1600);
    }

    /* ══════════ 6. VIDEO SLIDER — halaman ID/EN ══════════
     *
     * FIX: Sekarang slider wrapper adalah .video-slider-wrapper (bukan
     *      .video-slider), sehingga tidak ada konflik class CSS dengan
     *      #videoSlider yang memang menggunakan overflow scroll.
    ══════════ */
    var slider  = document.getElementById('videoSlider');
    var btnPrev = document.getElementById('slidePrev');
    var btnNext = document.getElementById('slideNext');

    if (slider && btnPrev && btnNext) {
        function getCardWidth() {
            var card = slider.querySelector('.video-card');
            if (!card) return 320;
            return card.offsetWidth + 20; // 20 = gap
        }

        btnNext.addEventListener('click', function () {
            slider.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
        });
        btnPrev.addEventListener('click', function () {
            slider.scrollBy({ left: -getCardWidth(), behavior: 'smooth' });
        });

        function updateSliderBtns() {
            var scrollLeft = slider.scrollLeft;
            var maxScroll  = slider.scrollWidth - slider.clientWidth;
            btnPrev.style.opacity = scrollLeft <= 2             ? '0.3' : '1';
            btnNext.style.opacity = scrollLeft >= maxScroll - 2 ? '0.3' : '1';
        }

        slider.addEventListener('scroll', updateSliderBtns, { passive: true });
        updateSliderBtns(); // inisialisasi state tombol
    }

    /* ══════════ 7. VIDEO SLIDER — halaman AR ══════════ */
    var sliderAr  = document.getElementById('videoSliderAr');
    var btnPrevAr = document.getElementById('slidePrevAr');
    var btnNextAr = document.getElementById('slideNextAr');

    if (sliderAr && btnPrevAr && btnNextAr) {
        function getCardWidthAr() {
            var card = sliderAr.querySelector('.video-card');
            return card ? card.offsetWidth + 20 : 320;
        }
        btnNextAr.addEventListener('click', function () {
            sliderAr.scrollBy({ left: getCardWidthAr(), behavior: 'smooth' });
        });
        btnPrevAr.addEventListener('click', function () {
            sliderAr.scrollBy({ left: -getCardWidthAr(), behavior: 'smooth' });
        });
        sliderAr.addEventListener('scroll', function () {
            var scrollLeft = Math.abs(sliderAr.scrollLeft);
            var maxScroll  = sliderAr.scrollWidth - sliderAr.clientWidth;
            btnPrevAr.style.opacity = scrollLeft <= 2             ? '0.3' : '1';
            btnNextAr.style.opacity = scrollLeft >= maxScroll - 2 ? '0.3' : '1';
        }, { passive: true });
        btnPrevAr.style.opacity = '0.3';
    }

    /* ══════════ 8. HASIL TAB TOGGLE + LIGHTBOX FIX ══════════ */
    var hasilTabs  = document.querySelectorAll('#hasil-tabs .hasil-tab');
    var hasilPhoto = document.getElementById('hasilPhoto');
    var hasilVideo = document.getElementById('hasilVideo');

    // Daftarkan foto hasil ke galeriItems agar lightbox berfungsi

    // Tab toggle
    if (hasilTabs.length && hasilPhoto && hasilVideo) {
        hasilTabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                var target = tab.getAttribute('data-hasil');
                hasilTabs.forEach(function (t) { t.classList.remove('active'); });
                tab.classList.add('active');

                if (target === 'foto') {
                    hasilPhoto.style.display = 'grid';
                    hasilVideo.style.display = 'none';
                } else {
                    hasilPhoto.style.display = 'none';
                    hasilVideo.style.display = 'grid';
                    hasilVideo.querySelectorAll('.reveal').forEach(function (el) {
                        el.classList.add('visible');
                    });
                }
            });
        });
    }

    // Daftarkan foto artikel ke galeriItems agar lightbox berfungsi


    

})();

