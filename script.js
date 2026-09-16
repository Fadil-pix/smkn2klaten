document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTop = document.getElementById('backToTop');
  const yearEl = document.getElementById('year');

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile menu toggle
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu after clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Highlight active menu item based on scroll position
  const sections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const setActiveLink = () => {
    let currentId = sections[0] ? sections[0].id : '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      if (section.offsetTop <= scrollPos) {
        currentId = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  };

  // Show/hide back-to-top button
  const toggleBackToTop = () => {
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', () => {
    setActiveLink();
    toggleBackToTop();
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  setActiveLink();
  toggleBackToTop();

  // ==========================================
  // HERO IMAGE SLIDER / CAROUSEL
  // ==========================================
  const heroSlider = document.getElementById('heroSlider');
  const slides = document.querySelectorAll('.hero-slider .slide');
  const dots = document.querySelectorAll('.slider-dots .dot');
  const btnPrev = document.getElementById('sliderPrev');
  const btnNext = document.getElementById('sliderNext');
  let currentSlide = 0;
  let slideInterval = null;
  const SLIDE_DURATION = 4500; // 4.5 detik per slide

  const showSlide = (index) => {
    if (!slides.length) return;
    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  };

  const startAutoSlide = () => {
    stopAutoSlide();
    slideInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, SLIDE_DURATION);
  };

  const stopAutoSlide = () => {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  };

  if (btnPrev && btnNext) {
    btnPrev.addEventListener('click', () => {
      showSlide(currentSlide - 1);
      startAutoSlide();
    });

    btnNext.addEventListener('click', () => {
      showSlide(currentSlide + 1);
      startAutoSlide();
    });

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const targetIndex = parseInt(dot.getAttribute('data-index'), 10);
        showSlide(targetIndex);
        startAutoSlide();
      });
    });

    if (heroSlider) {
      heroSlider.addEventListener('mouseenter', stopAutoSlide);
      heroSlider.addEventListener('mouseleave', startAutoSlide);

      // Navigasi keyboard saat slider fokus
      heroSlider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          showSlide(currentSlide - 1);
          startAutoSlide();
        } else if (e.key === 'ArrowRight') {
          showSlide(currentSlide + 1);
          startAutoSlide();
        }
      });
    }

    startAutoSlide();
  }

  // ==========================================
  // SISTEM CRUD BERITA SEKOLAH (ADMIN & PREVIEW)
  // ==========================================
  const BERITA_STORAGE_KEY = 'smkn2_berita_items';
  const ADMIN_SESSION_KEY = 'smkn2_admin_logged';
  const ADMIN_PASS = 'admin123';

  const DEFAULT_BERITA = [
    {
      id: 'berita-1',
      judul: 'Pemberitahuan Daftar Ulang Calon Murid Baru SMKN 2 Klaten TA 2026/2027',
      kategori: 'CMB 2026/2027',
      tanggal: '2026-06-25',
      gambar: 'Assets/gedung-sekolah-3.jpg',
      konten: 'SMK Negeri 2 Klaten menyampaikan informasi resmi terkait pelaksanaan daftar ulang bagi Calon Murid Baru (CMB) Tahun Pelajaran 2026/2027.\n\nSeluruh calon siswa yang dinyatakan diterima wajib melengkapi dokumen administrasi dan melakukan verifikasi berkas di kampus SMKN 2 Klaten sesuai jadwal yang telah ditentukan. Informasi persyaratan berkas lengkap dapat diperoleh melalui sekretariat panitia penerimaan siswa baru di ruang pendaftaran.'
    },
    {
      id: 'berita-2',
      judul: 'SPMB SMKN 2 Klaten Tahun Ajaran 2026/2027 Resmi Dibuka',
      kategori: 'SPMB',
      tanggal: '2026-05-10',
      gambar: 'Assets/gedung-sekolah-2.jpg',
      konten: 'SMK Negeri 2 Klaten resmi membuka Sistem Penerimaan Murid Baru (SPMB) Tahun Ajaran 2026/2027.\n\nTersedia berbagai konsentrasi keahlian kejuruan unggulan yang siap mencetak generasi muda berkompeten, berkarakter, dan siap kerja maupun wirausaha. Pendaftaran dibuka secara online dan terintegrasi melalui portal resmi dinas pendidikan.'
    }
  ];

  // Helper Escape HTML untuk keamanan
  const escapeHtml = (str) => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Helper Format Tanggal Indonesia
  const formatTanggalIndo = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const bulan = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const y = parts[0];
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return `${d} ${bulan[m] || ''} ${y}`;
  };

  // State Manajemen Berita
  const getBeritaList = () => {
    try {
      const stored = localStorage.getItem(BERITA_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(BERITA_STORAGE_KEY, JSON.stringify(DEFAULT_BERITA));
        return DEFAULT_BERITA;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_BERITA;
    }
  };

  const saveBeritaList = (list) => {
    try {
      localStorage.setItem(BERITA_STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.error('Gagal menyimpan berita:', err);
    }
  };

  let isAdmin = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';

  // Elemen DOM Berita & Admin
  const beritaContainer = document.getElementById('beritaContainer');
  const btnAdminAccess = document.getElementById('btnAdminAccess');
  const adminBtnText = document.getElementById('adminBtnText');
  const adminLockIcon = document.getElementById('adminLockIcon');
  const btnTambahBerita = document.getElementById('btnTambahBerita');

  // Modal Login Admin
  const modalAdminLogin = document.getElementById('modalAdminLogin');
  const formAdminLogin = document.getElementById('formAdminLogin');
  const adminPasswordInput = document.getElementById('adminPasswordInput');
  const loginErrorMsg = document.getElementById('loginErrorMsg');
  const btnCloseAdminLogin = document.getElementById('btnCloseAdminLogin');
  const btnCancelAdminLogin = document.getElementById('btnCancelAdminLogin');
  const backdropAdminLogin = document.getElementById('backdropAdminLogin');

  // Modal Form Berita (Tambah / Edit)
  const modalBeritaForm = document.getElementById('modalBeritaForm');
  const formBerita = document.getElementById('formBerita');
  const formModalTitle = document.getElementById('formModalTitle');
  const beritaIdInput = document.getElementById('beritaId');
  const beritaJudulInput = document.getElementById('beritaJudul');
  const beritaKategoriInput = document.getElementById('beritaKategori');
  const beritaTanggalInput = document.getElementById('beritaTanggal');
  const beritaGambarFileInput = document.getElementById('beritaGambarFile');
  const beritaGambarUrlInput = document.getElementById('beritaGambarUrl');
  const liveImagePreview = document.getElementById('liveImagePreview');
  const previewPlaceholder = document.getElementById('previewPlaceholder');
  const btnRemoveImage = document.getElementById('btnRemoveImage');
  const beritaKontenInput = document.getElementById('beritaKonten');
  const btnCloseBeritaForm = document.getElementById('btnCloseBeritaForm');
  const btnCancelBeritaForm = document.getElementById('btnCancelBeritaForm');
  const backdropBeritaForm = document.getElementById('backdropBeritaForm');

  // Modal Detail Berita
  const modalBeritaDetail = document.getElementById('modalBeritaDetail');
  const detailBadge = document.getElementById('detailBadge');
  const detailDate = document.getElementById('detailDate');
  const detailModalTitle = document.getElementById('detailModalTitle');
  const detailImage = document.getElementById('detailImage');
  const detailContent = document.getElementById('detailContent');
  const btnCloseBeritaDetail = document.getElementById('btnCloseBeritaDetail');
  const btnCloseDetailFooter = document.getElementById('btnCloseDetailFooter');
  const backdropBeritaDetail = document.getElementById('backdropBeritaDetail');

  let currentFormImageData = ''; // Menyimpan data gambar (base64 atau url)

  // Update Status Tampilan Admin
  const updateAdminUI = () => {
    if (isAdmin) {
      if (btnAdminAccess) {
        btnAdminAccess.classList.add('is-admin');
        if (adminBtnText) adminBtnText.textContent = 'Keluar (Admin)';
        if (adminLockIcon) adminLockIcon.textContent = '🔓';
        btnAdminAccess.title = 'Klik untuk keluar dari mode admin';
      }
      if (btnTambahBerita) btnTambahBerita.style.display = 'inline-block';
    } else {
      if (btnAdminAccess) {
        btnAdminAccess.classList.remove('is-admin');
        if (adminBtnText) adminBtnText.textContent = 'Kelola Berita';
        if (adminLockIcon) adminLockIcon.textContent = '🔐';
        btnAdminAccess.title = 'Klik untuk masuk mode admin berita';
      }
      if (btnTambahBerita) btnTambahBerita.style.display = 'none';
    }
  };

  // Render Kartu Berita
  const renderBerita = () => {
    if (!beritaContainer) return;
    const beritaList = getBeritaList();

    if (!beritaList.length) {
      beritaContainer.innerHTML = `
        <div class="berita-empty-state">
          <p>Belum ada artikel berita yang dipublikasikan.</p>
          ${isAdmin ? '<button class="btn btn-primary btn-sm" id="btnEmptyTambah">+ Tambah Berita Pertama</button>' : ''}
        </div>
      `;
      const emptyBtn = document.getElementById('btnEmptyTambah');
      if (emptyBtn) emptyBtn.addEventListener('click', openAddBeritaModal);
      return;
    }

    beritaContainer.innerHTML = beritaList.map(item => {
      const displayImg = item.gambar || 'Assets/gedung-sekolah-1.jpg';
      const categoryTag = item.kategori ? `<span class="thumb-badge">${escapeHtml(item.kategori)}</span>` : '';
      const dateTag = item.tanggal ? `<span class="card-date-badge">${formatTanggalIndo(item.tanggal)}</span>` : '';
      
      const adminActions = isAdmin ? `
        <div class="card-admin-actions">
          <button class="btn-card-action btn-card-edit" data-edit-id="${item.id}">✏️ Edit</button>
          <button class="btn-card-action btn-card-delete" data-delete-id="${item.id}">🗑️ Hapus</button>
        </div>
      ` : '';

      return `
        <article class="berita-card" data-id="${item.id}">
          <div class="berita-card-thumb">
            ${categoryTag}
            <img class="berita-card-img" src="${displayImg}" alt="${escapeHtml(item.judul)}" loading="lazy" onerror="this.src='Assets/gedung-sekolah-1.jpg'">
            ${dateTag}
          </div>
          <div class="berita-body">
            <h3>${escapeHtml(item.judul)}</h3>
            <p>${escapeHtml(item.konten)}</p>
            <div class="berita-card-footer">
              <button class="berita-link" data-read-id="${item.id}">Baca selengkapnya &rsaquo;</button>
            </div>
            ${adminActions}
          </div>
        </article>
      `;
    }).join('');

    // Event listeners untuk tombol Baca Selengkapnya & Gambar
    beritaContainer.querySelectorAll('[data-read-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-read-id');
        openDetailModal(id);
      });
    });

    beritaContainer.querySelectorAll('.berita-card-thumb').forEach(thumb => {
      thumb.style.cursor = 'pointer';
      thumb.addEventListener('click', (e) => {
        const card = thumb.closest('.berita-card');
        if (card) {
          const id = card.getAttribute('data-id');
          openDetailModal(id);
        }
      });
    });

    // Event listeners tombol Edit & Hapus jika admin
    if (isAdmin) {
      beritaContainer.querySelectorAll('[data-edit-id]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-edit-id');
          openEditBeritaModal(id);
        });
      });

      beritaContainer.querySelectorAll('[data-delete-id]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-delete-id');
          deleteBerita(id);
        });
      });
    }
  };

  // Buka Modal Login Admin
  const openLoginModal = () => {
    if (modalAdminLogin) {
      modalAdminLogin.classList.add('open');
      modalAdminLogin.setAttribute('aria-hidden', 'false');
      if (adminPasswordInput) {
        adminPasswordInput.value = '';
        adminPasswordInput.focus();
      }
      if (loginErrorMsg) loginErrorMsg.style.display = 'none';
    }
  };

  const closeLoginModal = () => {
    if (modalAdminLogin) {
      modalAdminLogin.classList.remove('open');
      modalAdminLogin.setAttribute('aria-hidden', 'true');
    }
  };

  // Toggle Admin Login / Logout
  if (btnAdminAccess) {
    btnAdminAccess.addEventListener('click', () => {
      if (isAdmin) {
        if (confirm('Keluar dari mode admin?')) {
          isAdmin = false;
          sessionStorage.removeItem(ADMIN_SESSION_KEY);
          updateAdminUI();
          renderBerita();
        }
      } else {
        openLoginModal();
      }
    });
  }

  if (btnCloseAdminLogin) btnCloseAdminLogin.addEventListener('click', closeLoginModal);
  if (btnCancelAdminLogin) btnCancelAdminLogin.addEventListener('click', closeLoginModal);
  if (backdropAdminLogin) backdropAdminLogin.addEventListener('click', closeLoginModal);

  if (formAdminLogin) {
    formAdminLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPass = adminPasswordInput ? adminPasswordInput.value : '';
      if (enteredPass === ADMIN_PASS) {
        isAdmin = true;
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        closeLoginModal();
        updateAdminUI();
        renderBerita();
      } else {
        if (loginErrorMsg) loginErrorMsg.style.display = 'block';
        if (adminPasswordInput) {
          adminPasswordInput.select();
        }
      }
    });
  }

  // Live Image Preview Controller
  const setLiveImagePreview = (src) => {
    currentFormImageData = src || '';
    if (src) {
      if (liveImagePreview) {
        liveImagePreview.src = src;
        liveImagePreview.style.display = 'block';
      }
      if (previewPlaceholder) previewPlaceholder.style.display = 'none';
      if (btnRemoveImage) btnRemoveImage.style.display = 'inline-block';
    } else {
      if (liveImagePreview) {
        liveImagePreview.src = '';
        liveImagePreview.style.display = 'none';
      }
      if (previewPlaceholder) previewPlaceholder.style.display = 'flex';
      if (btnRemoveImage) btnRemoveImage.style.display = 'none';
    }
  };

  if (beritaGambarFileInput) {
    beritaGambarFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setLiveImagePreview(event.target.result);
          if (beritaGambarUrlInput) beritaGambarUrlInput.value = '';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (beritaGambarUrlInput) {
    beritaGambarUrlInput.addEventListener('input', (e) => {
      const url = e.target.value.trim();
      if (url) {
        setLiveImagePreview(url);
        if (beritaGambarFileInput) beritaGambarFileInput.value = '';
      } else if (!beritaGambarFileInput.value) {
        setLiveImagePreview('');
      }
    });
  }

  if (btnRemoveImage) {
    btnRemoveImage.addEventListener('click', () => {
      setLiveImagePreview('');
      if (beritaGambarFileInput) beritaGambarFileInput.value = '';
      if (beritaGambarUrlInput) beritaGambarUrlInput.value = '';
    });
  }

  // Modal Form Berita (Create & Update)
  const openAddBeritaModal = () => {
    if (!modalBeritaForm) return;
    modalBeritaForm.classList.add('open');
    modalBeritaForm.setAttribute('aria-hidden', 'false');
    if (formModalTitle) formModalTitle.textContent = 'Tambah Berita Baru';
    if (beritaIdInput) beritaIdInput.value = '';
    if (beritaJudulInput) beritaJudulInput.value = '';
    if (beritaKategoriInput) beritaKategoriInput.value = 'Pengumuman';
    
    // Set default tanggal hari ini (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    if (beritaTanggalInput) beritaTanggalInput.value = today;

    if (beritaKontenInput) beritaKontenInput.value = '';
    if (beritaGambarFileInput) beritaGambarFileInput.value = '';
    if (beritaGambarUrlInput) beritaGambarUrlInput.value = '';
    setLiveImagePreview('');

    if (beritaJudulInput) beritaJudulInput.focus();
  };

  const openEditBeritaModal = (id) => {
    const list = getBeritaList();
    const item = list.find(b => b.id === id);
    if (!item || !modalBeritaForm) return;

    modalBeritaForm.classList.add('open');
    modalBeritaForm.setAttribute('aria-hidden', 'false');
    if (formModalTitle) formModalTitle.textContent = 'Edit Berita';
    if (beritaIdInput) beritaIdInput.value = item.id;
    if (beritaJudulInput) beritaJudulInput.value = item.judul || '';
    if (beritaKategoriInput) beritaKategoriInput.value = item.kategori || '';
    if (beritaTanggalInput) beritaTanggalInput.value = item.tanggal || '';
    if (beritaKontenInput) beritaKontenInput.value = item.konten || '';
    if (beritaGambarFileInput) beritaGambarFileInput.value = '';
    if (beritaGambarUrlInput) beritaGambarUrlInput.value = (item.gambar && item.gambar.startsWith('http')) ? item.gambar : '';

    setLiveImagePreview(item.gambar || '');
    if (beritaJudulInput) beritaJudulInput.focus();
  };

  const closeBeritaFormModal = () => {
    if (modalBeritaForm) {
      modalBeritaForm.classList.remove('open');
      modalBeritaForm.setAttribute('aria-hidden', 'true');
    }
  };

  if (btnTambahBerita) btnTambahBerita.addEventListener('click', openAddBeritaModal);
  if (btnCloseBeritaForm) btnCloseBeritaForm.addEventListener('click', closeBeritaFormModal);
  if (btnCancelBeritaForm) btnCancelBeritaForm.addEventListener('click', closeBeritaFormModal);
  if (backdropBeritaForm) backdropBeritaForm.addEventListener('click', closeBeritaFormModal);

  // Simpan Berita (Create / Update)
  if (formBerita) {
    formBerita.addEventListener('submit', (e) => {
      e.preventDefault();
      const judul = beritaJudulInput ? beritaJudulInput.value.trim() : '';
      const konten = beritaKontenInput ? beritaKontenInput.value.trim() : '';
      const kategori = beritaKategoriInput ? beritaKategoriInput.value.trim() : 'Berita';
      const tanggal = beritaTanggalInput ? beritaTanggalInput.value : '';
      const editId = beritaIdInput ? beritaIdInput.value : '';

      if (!judul || !konten) {
        alert('Judul dan isi berita wajib diisi!');
        return;
      }

      const list = getBeritaList();
      const finalImage = currentFormImageData || 'Assets/gedung-sekolah-1.jpg';

      if (editId) {
        // Update
        const idx = list.findIndex(b => b.id === editId);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            judul,
            kategori,
            tanggal,
            gambar: finalImage,
            konten
          };
        }
      } else {
        // Create Baru
        const newBerita = {
          id: 'berita-' + Date.now(),
          judul,
          kategori,
          tanggal: tanggal || new Date().toISOString().split('T')[0],
          gambar: finalImage,
          konten
        };
        list.unshift(newBerita);
      }

      saveBeritaList(list);
      closeBeritaFormModal();
      renderBerita();
    });
  }

  // Hapus Berita (Delete)
  const deleteBerita = (id) => {
    const list = getBeritaList();
    const item = list.find(b => b.id === id);
    if (!item) return;

    if (confirm(`Yakin ingin menghapus berita:\n"${item.judul}"?`)) {
      const filtered = list.filter(b => b.id !== id);
      saveBeritaList(filtered);
      renderBerita();
    }
  };

  // Modal Detail Berita (Read / Detail Preview)
  const openDetailModal = (id) => {
    const list = getBeritaList();
    const item = list.find(b => b.id === id);
    if (!item || !modalBeritaDetail) return;

    if (detailBadge) detailBadge.textContent = item.kategori || 'Berita';
    if (detailDate) detailDate.textContent = item.tanggal ? formatTanggalIndo(item.tanggal) : '';
    if (detailModalTitle) detailModalTitle.textContent = item.judul || '';
    if (detailImage) {
      detailImage.src = item.gambar || 'Assets/gedung-sekolah-1.jpg';
      detailImage.alt = item.judul || 'Gambar Berita';
    }
    if (detailContent) {
      detailContent.textContent = item.konten || '';
    }

    modalBeritaDetail.classList.add('open');
    modalBeritaDetail.setAttribute('aria-hidden', 'false');
  };

  const closeDetailModal = () => {
    if (modalBeritaDetail) {
      modalBeritaDetail.classList.remove('open');
      modalBeritaDetail.setAttribute('aria-hidden', 'true');
    }
  };

  if (btnCloseBeritaDetail) btnCloseBeritaDetail.addEventListener('click', closeDetailModal);
  if (btnCloseDetailFooter) btnCloseDetailFooter.addEventListener('click', closeDetailModal);
  if (backdropBeritaDetail) backdropBeritaDetail.addEventListener('click', closeDetailModal);

  // Inisialisasi Berita dan UI Admin
  updateAdminUI();
  renderBerita();
});


