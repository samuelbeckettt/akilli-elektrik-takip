const STORAGE_KEY = 'akilli-elektrik-kayitlari';

export function kayitlariYukle() {
  try {
    const veriler = localStorage.getItem(STORAGE_KEY);
    return veriler ? JSON.parse(veriler) : [];
  } catch (error) {
    console.error('Kayıtlar yüklenemedi:', error);
    return [];
  }
}

export function kayitlariKaydet(kayitlar) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(kayitlar)
    );
    return true;
  } catch (error) {
    console.error('Kayıtlar kaydedilemedi:', error);
    return false;
  }
}