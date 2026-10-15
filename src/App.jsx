
import { useEffect, useState } from 'react'
import { kayitlariYukle, kayitlariKaydet } from './storage'
import './App.css'

function App() {
  const [kayitlar, setKayitlar] = useState(kayitlariYukle)
  const [cihaz, setCihaz] = useState('')
  const [tarih, setTarih] = useState('')
  const [tuketim, setTuketim] = useState('')
  const [aciklama, setAciklama] = useState('')
  const [duzenlenenId, setDuzenlenenId] = useState(null)
  const [arama, setArama] = useState('')
  const [sirala, setSirala] = useState('yeni')

  const toplamTuketim = kayitlar.reduce(
    (toplam, kayit) => toplam + Number(kayit.tuketim),
    0
  )

  const enYuksekKayit = kayitlar.reduce(
    (enYuksek, kayit) =>
      !enYuksek || Number(kayit.tuketim) > Number(enYuksek.tuketim)
        ? kayit
        : enYuksek,
    null
  )

  useEffect(() => {
    kayitlariKaydet(kayitlar)
  }, [kayitlar])

  function formuTemizle() {
    setCihaz('')
    setTarih('')
    setTuketim('')
    setAciklama('')
    setDuzenlenenId(null)
  }

  function kayitEkle(e) {
    e.preventDefault()

    if (
      !cihaz.trim() ||
      !tarih ||
      tuketim === '' ||
      !Number.isFinite(Number(tuketim)) ||
      Number(tuketim) < 0
    ) {
      alert('Lütfen gerekli alanları doğru doldurun.')
      return
    }

    if (duzenlenenId !== null) {
      setKayitlar((mevcutKayitlar) =>
        mevcutKayitlar.map((kayit) =>
          kayit.id === duzenlenenId
            ? {
                ...kayit,
                cihaz: cihaz.trim(),
                tarih,
                tuketim: Number(tuketim),
                aciklama: aciklama.trim(),
              }
            : kayit
        )
      )

      alert('Kayıt güncellendi.')
    } else {
      const yeniKayit = {
        id: Date.now(),
        cihaz: cihaz.trim(),
        tarih,
        tuketim: Number(tuketim),
        aciklama: aciklama.trim(),
      }

      setKayitlar((mevcutKayitlar) => [
        ...mevcutKayitlar,
        yeniKayit,
      ])

      alert('Yeni kayıt eklendi.')
    }

    formuTemizle()
  }

  function kaydiDuzenle(kayit) {
    setCihaz(kayit.cihaz)
    setTarih(kayit.tarih)
    setTuketim(String(kayit.tuketim))
    setAciklama(kayit.aciklama || '')
    setDuzenlenenId(kayit.id)

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function kaydiSil(id) {
    const onay = window.confirm(
      'Bu kaydı silmek istediğinizden emin misiniz?'
    )

    if (onay) {
      setKayitlar((mevcutKayitlar) =>
        mevcutKayitlar.filter((kayit) => kayit.id !== id)
      )

      if (duzenlenenId === id) {
        formuTemizle()
      }
    }
  }

  
const aranan = arama.toLocaleLowerCase('tr-TR').trim()

const filtrelenmisKayitlar = kayitlar
  .filter((kayit) => {
    return (
      kayit.cihaz.toLocaleLowerCase('tr-TR').includes(aranan) ||
      kayit.tarih.includes(aranan) ||
      (kayit.aciklama || '')
        .toLocaleLowerCase('tr-TR')
        .includes(aranan)
    )
  })
  .sort((a, b) => {
    if (sirala === 'tuketimAzalan') {
      return Number(b.tuketim) - Number(a.tuketim)
    }

    if (sirala === 'tuketimArtan') {
      return Number(a.tuketim) - Number(b.tuketim)
    }

    if (sirala === 'tarih') {
      return b.tarih.localeCompare(a.tarih)
    }

    return Number(b.id) - Number(a.id)
  })


  return (
    <main className="container">
      <header className="header">
        <p className="eyebrow">ENERJİ YÖNETİMİ</p>
        <h1>Akıllı Elektrik Takip</h1>
        <p>Elektrik tüketim kayıtlarını kolayca yönet.</p>
      </header>

      <section className="summary-grid">
        <div className="summary-card">
          <span className="summary-label">Toplam Kayıt</span>
          <strong>{kayitlar.length}</strong>
          <span className="summary-note">Kayıtlı ölçüm sayısı</span>
        </div>

        <div className="summary-card">
          <span className="summary-label">Toplam Tüketim</span>
          <strong>{toplamTuketim.toLocaleString('tr-TR')} Wh</strong>
          <span className="summary-note">Tüm kayıtların toplamı</span>
        </div>

        <div className="summary-card">
          <span className="summary-label">En Yüksek Tüketim</span>
          <strong>
            {enYuksekKayit
              ? `${Number(enYuksekKayit.tuketim).toLocaleString('tr-TR')} Wh`
              : '—'}
          </strong>
          <span className="summary-note">
            {enYuksekKayit ? enYuksekKayit.cihaz : 'Henüz kayıt yok'}
          </span>
        </div>
      </section>

      <section className="search-section">
        <label htmlFor="kayitArama">Kayıt Ara</label>
        <input
          id="kayitArama"
          type="search"
          placeholder="Cihaz adı, tarih veya açıklama yazın..."
          value={arama}
          onChange={(e) => setArama(e.target.value)}
        />

        <p className="search-result">
          {aranan
            ? `${filtrelenmisKayitlar.length} kayıt bulundu`
            : `Toplam ${kayitlar.length} kayıt`}
        </p>
        
        <label className="sort-label" htmlFor="kayitSirala">
          Kayıtları sırala
        </label>

        <select
          id="kayitSirala"
          value={sirala}
          onChange={(e) => setSirala(e.target.value)}
        >
          <option value="yeni">En yeni kayıt</option>
          <option value="tuketimAzalan">En yüksek tüketim</option>
          <option value="tuketimArtan">En düşük tüketim</option>
          <option value="tarih">Ölçüm tarihi (yeniden eskiye)</option>
        </select>

      </section>

      <section className="panel">
        <h2>
          {duzenlenenId !== null
            ? 'Tüketim Kaydını Düzenle'
            : 'Yeni Tüketim Kaydı'}
        </h2>

        <form onSubmit={kayitEkle}>
          <label>
            Cihaz adı
            <input
              value={cihaz}
              onChange={(e) => setCihaz(e.target.value)}
              placeholder="Örn. Buzdolabı"
              required
            />
          </label>

          <label>
            Ölçüm tarihi
            <input
              type="date"
              value={tarih}
              onChange={(e) => setTarih(e.target.value)}
              required
            />
          </label>

          <label>
            Tüketim (Wh)
            <input
              type="number"
              min="0"
              step="any"
              value={tuketim}
              onChange={(e) => setTuketim(e.target.value)}
              placeholder="Örn. 350"
              required
            />
          </label>

          <label>
            Açıklama
            <input
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              placeholder="İsteğe bağlı"
            />
          </label>

          <button type="submit">
            {duzenlenenId !== null
              ? 'Değişiklikleri Kaydet'
              : 'Kaydı Ekle'}
          </button>

          {duzenlenenId !== null && (
            <button
              type="button"
              className="cancel-button"
              onClick={formuTemizle}
            >
              Vazgeç
            </button>
          )}
        </form>
      </section>

      <section className="panel">
        <h2>Tüketim Kayıtları ({filtrelenmisKayitlar.length})</h2>

        {filtrelenmisKayitlar.length === 0 ? (
          <p className="empty">
            {aranan
              ? 'Aramanızla eşleşen kayıt bulunamadı.'
              : 'Henüz kayıt eklenmedi.'}
          </p>
        ) : (
          <ul className="record-list">
            {filtrelenmisKayitlar.map((kayit) => (
              <li key={kayit.id}>
                <strong>{kayit.cihaz}</strong>
                <span>Ölçüm tarihi: {kayit.tarih}</span>
                <span>
                  Tüketim: {Number(kayit.tuketim).toLocaleString('tr-TR')} Wh
                </span>

                {kayit.aciklama && <p>{kayit.aciklama}</p>}

                <div className="record-actions">
                  <button
                    type="button"
                    onClick={() => kaydiDuzenle(kayit)}
                  >
                    Düzenle
                  </button>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => kaydiSil(kayit.id)}
                  >
                    Sil
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
