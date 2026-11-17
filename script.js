/* ===== Mode terang/gelap ===== */
(function () {
  var root = document.documentElement, btn = document.getElementById("btn-tema");
  if (!btn) return;
  function sistem() { return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
  function sekarang() { return root.getAttribute("data-theme") || sistem(); }
  function tampil() {
    var gelap = sekarang() === "dark";
    btn.textContent = gelap ? "Mode terang" : "Mode gelap";
    btn.setAttribute("aria-pressed", gelap);
  }
  btn.addEventListener("click", function () {
    var baru = sekarang() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", baru);
    try { localStorage.setItem("tema", baru); } catch (e) {}
    tampil();
  });
  tampil();
})();

/* ===== Data ===== */
const POLI = { umum: "Poli Umum", gigi: "Poli Gigi", kia: "Poli Kesehatan Ibu dan Anak", gizi: "Poli Gizi" };
const DOKTER = [
  { nama: "dr. Ahmad Fauzi", poli: "umum", hari: "Senin, Rabu, Jumat", jam: "08.00–12.00" },
  { nama: "dr. Siti Rahmawati", poli: "umum", hari: "Selasa, Kamis, Sabtu", jam: "13.00–17.00" },
  { nama: "drg. Budi Santoso", poli: "gigi", hari: "Senin, Kamis", jam: "09.00–14.00" },
  { nama: "drg. Maya Putri", poli: "gigi", hari: "Selasa, Jumat", jam: "13.00–17.00" },
  { nama: "dr. Dewi Lestari, Sp.OG", poli: "kia", hari: "Senin, Rabu", jam: "08.00–12.00" },
  { nama: "dr. Rina Kusuma, Sp.A", poli: "kia", hari: "Selasa, Kamis", jam: "09.00–13.00" },
  { nama: "Hana Pratiwi, S.Gz", poli: "gizi", hari: "Rabu, Sabtu", jam: "08.00–12.00" },
  { nama: "Rudi Hartono, S.Gz", poli: "gizi", hari: "Senin, Jumat", jam: "13.00–16.00" }
];
const $ = (id) => document.getElementById(id);
const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const tglIndo = (s) => new Date(s + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

function sapaanWaktu(d) {
  const j = d.getHours();
  return j < 11 ? "pagi" : j < 15 ? "siang" : j < 18 ? "sore" : "malam";
}
function hitungUsia(str) {
  const l = new Date(str + "T00:00:00"), n = new Date();
  let u = n.getFullYear() - l.getFullYear();
  const m = n.getMonth() - l.getMonth();
  if (m < 0 || (m === 0 && n.getDate() < l.getDate())) u--;
  return u;
}

/* ===== Riwayat (disimpan di browser, bukan database) ===== */
const KUNCI = "riwayatPendaftaran";
let memori = null;
function bacaRiwayat() {
  if (memori) return memori;
  try { memori = JSON.parse(localStorage.getItem(KUNCI)) || []; } catch (e) { memori = []; }
  return memori;
}
function simpanRiwayat(item) {
  bacaRiwayat().push(item);
  try { localStorage.setItem(KUNCI, JSON.stringify(memori)); } catch (e) {}
}
function buatAntrean(poli, tgl) {
  const n = bacaRiwayat().filter((r) => r.poli === poli && r.kunjungan === tgl).length + 1;
  return poli.toUpperCase() + "-" + String(n).padStart(3, "0");
}
function renderRiwayat() {
  const tb = $("tbody-riwayat");
  if (!tb) return;
  const r = bacaRiwayat();
  tb.innerHTML = "";
  r.slice().reverse().forEach((x) => {
    const tr = document.createElement("tr");
    [x.antrean, x.nama, POLI[x.poli], x.dokter, tglIndo(x.kunjungan), new Date(x.dibuat).toLocaleString("id-ID")].forEach((v, i) => {
      const c = document.createElement(i === 0 ? "th" : "td");
      if (i === 0) c.scope = "row";
      c.textContent = v;
      tr.appendChild(c);
    });
    tb.appendChild(tr);
  });
  $("tabel-riwayat").hidden = !r.length;
  $("btn-hapus-riwayat").hidden = !r.length;
  $("info-riwayat").textContent = r.length ? "Total " + r.length + " pendaftaran pada perangkat ini." : "Belum ada pendaftaran.";
}

/* ===== Beranda: sapaan ===== */
const sp = $("sapaan");
if (sp) sp.textContent = "Selamat " + sapaanWaktu(new Date()) + "! Selamat datang di Klinik Pratama “Sehat Nusantara”.";

/* ===== Halaman Dokter: render, filter, tampil/sembunyi ===== */
const tbDokter = $("tbody-dokter");
if (tbDokter) {
  const filter = $("filter-poli"), info = $("info-hasil"), tabel = $("tabel-jadwal"), tombol = $("btn-toggle-jadwal");
  const m = location.hash.match(/^#jadwal-(\w+)$/);
  if (m && POLI[m[1]]) filter.value = m[1];
  const render = () => {
    const data = DOKTER.filter((d) => filter.value === "semua" || d.poli === filter.value);
    tbDokter.innerHTML = "";
    data.forEach((d) => {
      const tr = document.createElement("tr");
      tr.dataset.poli = d.poli;
      const th = document.createElement("th");
      th.scope = "row";
      const img = document.createElement("img");
      img.src = "img/dokter.svg"; img.alt = "Foto profil " + d.nama; img.width = 40; img.height = 40;
      th.append(img, " " + d.nama);
      tr.appendChild(th);
      [POLI[d.poli], d.hari, d.jam + " WIB"].forEach((v) => { const td = document.createElement("td"); td.textContent = v; tr.appendChild(td); });
      tbDokter.appendChild(tr);
    });
    info.textContent = "Menampilkan " + data.length + " dokter.";
  };
  filter.addEventListener("change", render);
  tombol.addEventListener("click", () => {
    tabel.hidden = !tabel.hidden;
    tombol.textContent = tabel.hidden ? "Tampilkan jadwal" : "Sembunyikan jadwal";
    tombol.setAttribute("aria-expanded", String(!tabel.hidden));
  });
  render();
}

/* ===== Halaman Pendaftaran ===== */
const form = $("form-pendaftaran");
if (form) {
  const poli = $("poli"), dok = $("dokter"), kel = $("keluhan"), sisa = $("sisa-karakter");
  const lahir = $("tgl-lahir"), usia = $("usia-pasien"), kun = $("tgl-kunjungan"), modal = $("modal-ringkasan");
  const hari = new Date(), maks = new Date();
  maks.setDate(maks.getDate() + 14);
  kun.min = iso(hari); kun.max = iso(maks); lahir.max = iso(hari);

  const resetDokter = () => {
    dok.innerHTML = "";
    dok.add(new Option("-- Pilih poliklinik terlebih dahulu --", ""));
    dok.disabled = true;
  };

  /* change: poliklinik -> isi pilihan dokter */
  poli.addEventListener("change", () => {
    if (!poli.value) { resetDokter(); return; }
    dok.innerHTML = "";
    dok.add(new Option("-- Pilih dokter --", ""));
    DOKTER.filter((d) => d.poli === poli.value).forEach((d) => dok.add(new Option(d.nama + " (" + d.hari + ", " + d.jam + ")", d.nama)));
    dok.disabled = false;
  });

  /* input: penghitung karakter dan usia */
  kel.addEventListener("input", () => { sisa.textContent = 200 - kel.value.length; });
  lahir.addEventListener("input", () => {
    usia.textContent = lahir.value && lahir.value <= iso(new Date()) ? hitungUsia(lahir.value) + " tahun" : "-";
  });

  /* Aturan validasi (tabel A.4); setiap fungsi mengembalikan pesan galat atau "" */
  const V = {
    nama: () => { const v = $("nama").value.trim(); if (!v) return "Nama lengkap wajib diisi."; if (!/^[A-Za-z\s]+$/.test(v)) return "Nama hanya boleh berisi huruf dan spasi."; if (v.length < 3) return "Nama minimal 3 karakter."; return ""; },
    nik: () => { const v = $("nik").value.trim(); if (!v) return "NIK wajib diisi."; if (!/^\d+$/.test(v)) return "NIK hanya boleh berisi angka."; if (v.length !== 16) return "NIK harus 16 digit."; return ""; },
    "tgl-lahir": () => { const v = lahir.value; if (!v) return "Tanggal lahir wajib diisi."; if (v > iso(new Date())) return "Tanggal lahir tidak boleh di masa depan."; return ""; },
    jk: () => (form.querySelector('input[name="jk"]:checked') ? "" : "Pilih jenis kelamin."),
    hp: () => { const v = $("hp").value.trim(); if (!v) return "Nomor HP wajib diisi."; if (!/^\d+$/.test(v)) return "Nomor HP hanya boleh berisi angka."; if (!/^(08|62)/.test(v)) return "Nomor HP harus diawali 08 atau 62."; if (v.length < 10 || v.length > 14) return "Nomor HP harus 10–14 digit."; return ""; },
    email: () => { const v = $("email").value.trim(); return v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Format email tidak benar." : ""; },
    poli: () => (poli.value ? "" : "Pilih poliklinik."),
    dokter: () => (dok.value ? "" : "Pilih dokter."),
    "tgl-kunjungan": () => { const v = kun.value; if (!v) return "Tanggal kunjungan wajib diisi."; if (v < iso(hari)) return "Tanggal kunjungan paling cepat hari ini."; if (v > iso(maks)) return "Tanggal kunjungan paling lambat 14 hari ke depan."; return ""; },
    keluhan: () => { const v = kel.value.trim(); if (!v) return "Keluhan wajib diisi."; if (v.length < 10) return "Keluhan minimal 10 karakter."; if (v.length > 200) return "Keluhan maksimal 200 karakter."; return ""; },
    setuju: () => ($("setuju").checked ? "" : "Anda harus menyetujui penggunaan data.")
  };
  const cek = (k) => {
    const pesan = V[k]();
    $("galat-" + k).textContent = pesan;
    const el = $(k);
    if (el) { el.classList.toggle("invalid", !!pesan); el.setAttribute("aria-invalid", String(!!pesan)); }
    return !pesan;
  };
  form.addEventListener("change", (e) => { if (V[e.target.name]) cek(e.target.name); });
  form.addEventListener("input", (e) => { if (V[e.target.name] && e.target.classList.contains("invalid")) cek(e.target.name); });

  const tampilModal = (d) => {
    const set = (k, v) => { $("ringkas-" + k).textContent = v; };
    set("antrean", d.antrean); set("nama", d.nama); set("nik", d.nik);
    set("lahir", tglIndo(d.lahir) + " (" + d.usia + " tahun)");
    set("jk", d.jk); set("hp", d.hp); set("email", d.email || "-");
    set("poli", POLI[d.poli]); set("dokter", d.dokter);
    set("kunjungan", tglIndo(d.kunjungan)); set("keluhan", d.keluhan);
    modal.hidden = false;
    $("btn-tutup-ringkasan").focus();
  };

  /* submit: validasi semua kolom, tahan pengiriman bila belum valid */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const salah = Object.keys(V).filter((k) => !cek(k));
    if (salah.length) {
      (($(salah[0])) || form.querySelector('[name="' + salah[0] + '"]')).focus();
      return;
    }
    const d = {
      nama: $("nama").value.trim(), nik: $("nik").value.trim(), lahir: lahir.value, usia: hitungUsia(lahir.value),
      jk: form.querySelector('input[name="jk"]:checked').value, hp: $("hp").value.trim(), email: $("email").value.trim(),
      poli: poli.value, dokter: dok.value, kunjungan: kun.value, keluhan: kel.value.trim()
    };
    d.antrean = buatAntrean(d.poli, d.kunjungan);
    /* riwayat hanya menyimpan data ringkas (tanpa NIK, HP, dan keluhan) */
    simpanRiwayat({ antrean: d.antrean, nama: d.nama, poli: d.poli, dokter: d.dokter, kunjungan: d.kunjungan, dibuat: new Date().toISOString() });
    tampilModal(d);
    renderRiwayat();
    form.reset(); resetDokter(); sisa.textContent = "200"; usia.textContent = "-";
  });

  /* click: tutup ringkasan, hapus riwayat */
  const tutup = () => { modal.hidden = true; };
  $("btn-tutup-ringkasan").addEventListener("click", tutup);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) tutup(); });
  $("btn-hapus-riwayat").addEventListener("click", () => {
    if (!confirm("Hapus seluruh riwayat pendaftaran di perangkat ini?")) return;
    memori = [];
    try { localStorage.removeItem(KUNCI); } catch (e) {}
    renderRiwayat();
  });
  renderRiwayat();
}
