#!/usr/bin/env python3
"""
Mass translate ALL remaining SOGo6 UI files for all 21 locales.

Strategy: For each locale, define a dictionary of common English→Translated mappings.
Apply to ALL JSON files in that locale.
"""
import json
from pathlib import Path

MSG_DIR = Path(__file__).parent.parent / "src" / "messages"
EN_DIR = MSG_DIR / "en"

LOCALES = [
    "it", "pt", "ja", "nl", "pl", "ru",
    "sv", "da", "fi", "no", "cs",
    "el", "tr", "hu", "ro", "ko",
    "hi", "ar", "th", "vi", "id"
]

# ============================================================
# LOCALE TRANSLATION DICTIONARIES
# Format: {locale: {english_string: translated_string}}
# ============================================================
# These contain common admin/UI terms. The script applies
# ALL of them to ALL files in each locale.
# When a translation is found, it replaces the English string.
# When not found, the English string stays (to be done later).

# Helper to build locale dicts
def ld(locale, pairs):
    """Build a locale→translation dict from a list of (en, tr) pairs."""
    return {locale: {en: tr for en, tr in pairs}}

LOCALE_DICTS = {}

# ==================== ITALIAN ====================
LOCALE_DICTS["it"] = {
    "Attivo": "Active", "Inattivo": "Inactive",
    "Abilitato": "Enabled", "Disabilitato": "Disabled",
    "Crea": "Create", "Modifica": "Edit",
    "Aggiorna": "Update", "Elimina": "Delete",
    "Aggiungi": "Add", "Rimuovi": "Remove",
    "Salva": "Save", "Annulla": "Cancel",
    "Caricamento": "Loading",
    "Filtra...": "Filter...",
    "Nessun risultato.": "No results.",
    "Precedente": "Previous", "Successivo": "Next",
    "Nome": "Name", "Descrizione": "Description",
    "Tipo": "Type", "Stato": "Status",
    "Impostazioni": "Settings",
    "Configurazione": "Configuration",
    "Amministrazione": "Administration",
    "Sistema": "System", "Dominio": "Domain",
    "Utenti": "Users", "Risorse": "Resources",
    "Abilita": "Enable", "Disabilita": "Disable",
    "Predefinito": "Default",
    "Tutti": "All", "Nessuno": "None",
    "OK": "OK",
}

# ==================== PORTUGUESE ====================
LOCALE_DICTS["pt"] = {
    "Ativo": "Active", "Inativo": "Inactive",
    "Ativado": "Enabled", "Desativado": "Disabled",
    "Criar": "Create", "Editar": "Edit",
    "Atualizar": "Update", "Excluir": "Delete",
    "Adicionar": "Add", "Remover": "Remove",
    "Salvar": "Save", "Cancelar": "Cancel",
    "Carregando": "Loading",
    "Filtrar...": "Filter...",
    "Nenhum resultado.": "No results.",
    "Anterior": "Previous", "Próximo": "Next",
    "Nome": "Name", "Descrição": "Description",
    "Tipo": "Type", "Status": "Status",
    "Configurações": "Settings",
    "Configuração": "Configuration",
    "Administração": "Administration",
    "Sistema": "System", "Domínio": "Domain",
    "Usuários": "Users", "Recursos": "Resources",
    "Ativar": "Enable", "Desativar": "Disable",
    "Padrão": "Default",
    "Todos": "All", "Nenhum": "None",
    "OK": "OK",
    "Filtrar domínios...": "Filter domains...",
    "Adicionar novo domínio personalizado": "Add new custom domain",
    "Selecionar tudo": "Select all",
    "Selecionar linha": "Select row",
    "Domínios personalizados": "Custom domains",
    "Tema": "Theme", "Cotas": "Quotas",
    "Usuários em Massa": "Bulk Users",
}

# ==================== JAPANESE ====================
LOCALE_DICTS["ja"] = {
    "有効": "Active", "無効": "Inactive",
    "有効": "Enabled", "無効": "Disabled",
    "作成": "Create", "編集": "Edit",
    "更新": "Update", "削除": "Delete",
    "追加": "Add", "削除": "Remove",
    "保存": "Save", "キャンセル": "Cancel",
    "読み込み中": "Loading",
    "フィルター...": "Filter...",
    "結果がありません。": "No results.",
    "前へ": "Previous", "次へ": "Next",
    "名前": "Name", "説明": "Description",
    "種類": "Type", "ステータス": "Status",
    "設定": "Settings",
    "設定": "Configuration",
    "管理": "Administration",
    "システム": "System", "ドメイン": "Domain",
    "ユーザー": "Users", "リソース": "Resources",
    "有効にする": "Enable", "無効にする": "Disable",
    "デフォルト": "Default",
    "すべて": "All", "なし": "None",
    "OK": "OK",
}

# ==================== DUTCH ====================
LOCALE_DICTS["nl"] = {
    "Actief": "Active", "Inactief": "Inactive",
    "Ingeschakeld": "Enabled", "Uitgeschakeld": "Disabled",
    "Aanmaken": "Create", "Bewerken": "Edit",
    "Bijwerken": "Update", "Verwijder": "Delete",
    "Toevoegen": "Add", "Verwijderen": "Remove",
    "Opslaan": "Save", "Annuleren": "Cancel",
    "Laden": "Loading",
    "Filter...": "Filter...",
    "Geen resultaten.": "No results.",
    "Vorige": "Previous", "Volgende": "Next",
    "Naam": "Name", "Beschrijving": "Description",
    "Type": "Type", "Status": "Status",
    "Instellingen": "Settings",
    "Configuratie": "Configuration",
    "Beheer": "Administration",
    "Systeem": "System", "Domein": "Domain",
    "Gebruikers": "Users", "Bronnen": "Resources",
    "Inschakelen": "Enable", "Uitschakelen": "Disable",
    "Standaard": "Default",
    "Alle": "All", "Geen": "None",
    "OK": "OK",
}

# ==================== POLISH ====================
LOCALE_DICTS["pl"] = {
    "Aktywny": "Active", "Nieaktywny": "Inactive",
    "Włączone": "Enabled", "Wyłączone": "Disabled",
    "Utwórz": "Create", "Edytuj": "Edit",
    "Aktualizuj": "Update", "Usuń": "Delete",
    "Dodaj": "Add", "Usuń": "Remove",
    "Zapisz": "Save", "Anuluj": "Cancel",
    "Ładowanie": "Loading",
    "Filtruj...": "Filter...",
    "Brak wyników.": "No results.",
    "Poprzedni": "Previous", "Następny": "Next",
    "Nazwa": "Name", "Opis": "Description",
    "Typ": "Type", "Status": "Status",
    "Ustawienia": "Settings",
    "Konfiguracja": "Configuration",
    "Administracja": "Administration",
    "System": "System", "Domena": "Domain",
    "Użytkownicy": "Users", "Zasoby": "Resources",
    "Włącz": "Enable", "Wyłącz": "Disable",
    "Domyślny": "Default",
    "Wszystkie": "All", "Brak": "None",
    "OK": "OK",
}

# ==================== RUSSIAN ====================
LOCALE_DICTS["ru"] = {
    "Активный": "Active", "Неактивный": "Inactive",
    "Включено": "Enabled", "Отключено": "Disabled",
    "Создать": "Create", "Редактировать": "Edit",
    "Обновить": "Update", "Удалить": "Delete",
    "Добавить": "Add", "Удалить": "Remove",
    "Сохранить": "Save", "Отмена": "Cancel",
    "Загрузка": "Loading",
    "Фильтр...": "Filter...",
    "Нет результатов.": "No results.",
    "Предыдущий": "Previous", "Следующий": "Next",
    "Имя": "Name", "Описание": "Description",
    "Тип": "Type", "Статус": "Status",
    "Настройки": "Settings",
    "Конфигурация": "Configuration",
    "Администрирование": "Administration",
    "Система": "System", "Домен": "Domain",
    "Пользователи": "Users", "Ресурсы": "Resources",
    "Включить": "Enable", "Отключить": "Disable",
    "По умолчанию": "Default",
    "Все": "All", "Нет": "None",
    "OK": "OK",
}

# ==================== SWEDISH ====================
LOCALE_DICTS["sv"] = {
    "Aktiv": "Active", "Inaktiv": "Inactive",
    "Aktiverad": "Enabled", "Inaktiverad": "Disabled",
    "Skapa": "Create", "Redigera": "Edit",
    "Uppdatera": "Update", "Radera": "Delete",
    "Lägg till": "Add", "Ta bort": "Remove",
    "Spara": "Save", "Avbryt": "Cancel",
    "Laddar": "Loading",
    "Filtrera...": "Filter...",
    "Inga resultat.": "No results.",
    "Föregående": "Previous", "Nästa": "Next",
    "Namn": "Name", "Beskrivning": "Description",
    "Typ": "Type", "Status": "Status",
    "Inställningar": "Settings",
    "Konfiguration": "Configuration",
    "Administration": "Administration",
    "System": "System", "Domän": "Domain",
    "Användare": "Users", "Resurser": "Resources",
    "Aktivera": "Enable", "Inaktivera": "Disable",
    "Standard": "Default",
    "Alla": "All", "Ingen": "None",
    "OK": "OK",
}

# ==================== DANISH ====================
LOCALE_DICTS["da"] = {
    "Aktiv": "Active", "Inaktiv": "Inactive",
    "Aktiveret": "Enabled", "Deaktiveret": "Disabled",
    "Opret": "Create", "Rediger": "Edit",
    "Opdater": "Update", "Slet": "Delete",
    "Tilføj": "Add", "Fjern": "Remove",
    "Gem": "Save", "Annuller": "Cancel",
    "Indlæser": "Loading",
    "Filter...": "Filter...",
    "Ingen resultater.": "No results.",
    "Forrige": "Previous", "Næste": "Next",
    "Navn": "Name", "Beskrivelse": "Description",
    "Type": "Type", "Status": "Status",
    "Indstillinger": "Settings",
    "Konfiguration": "Configuration",
    "Administration": "Administration",
    "System": "System", "Domæne": "Domain",
    "Brugere": "Users", "Ressourcer": "Resources",
    "Aktiver": "Enable", "Deaktiver": "Disable",
    "Standard": "Default",
    "Alle": "All", "Ingen": "None",
    "OK": "OK",
}

# ==================== FINNISH ====================
LOCALE_DICTS["fi"] = {
    "Aktiivinen": "Active", "Ei aktiivinen": "Inactive",
    "Käytössä": "Enabled", "Pois käytöstä": "Disabled",
    "Luo": "Create", "Muokkaa": "Edit",
    "Päivitä": "Update", "Poista": "Delete",
    "Lisää": "Add", "Poista": "Remove",
    "Tallenna": "Save", "Peruuta": "Cancel",
    "Lataa": "Loading",
    "Suodata...": "Filter...",
    "Ei tuloksia.": "No results.",
    "Edellinen": "Previous", "Seuraava": "Next",
    "Nimi": "Name", "Kuvaus": "Description",
    "Tyyppi": "Type", "Tila": "Status",
    "Asetukset": "Settings",
    "Konfiguraatio": "Configuration",
    "Hallinta": "Administration",
    "Järjestelmä": "System", "Verkkotunnus": "Domain",
    "Käyttäjät": "Users", "Resurssit": "Resources",
    "Ota käyttöön": "Enable", "Poista käytöstä": "Disable",
    "Oletus": "Default",
    "Kaikki": "All", "Ei mitään": "None",
    "OK": "OK",
}

# ==================== NORWEGIAN ====================
LOCALE_DICTS["no"] = {
    "Aktiv": "Active", "Inaktiv": "Inactive",
    "Aktivert": "Enabled", "Deaktivert": "Disabled",
    "Opprett": "Create", "Rediger": "Edit",
    "Oppdater": "Update", "Slett": "Delete",
    "Legg til": "Add", "Fjern": "Remove",
    "Lagre": "Save", "Avbryt": "Cancel",
    "Laster": "Loading",
    "Filter...": "Filter...",
    "Ingen resultater.": "No results.",
    "Forrige": "Previous", "Neste": "Next",
    "Navn": "Name", "Beskrivelse": "Description",
    "Type": "Type", "Status": "Status",
    "Innstillinger": "Settings",
    "Konfigurasjon": "Configuration",
    "Administrasjon": "Administration",
    "System": "System", "Domene": "Domain",
    "Brukere": "Users", "Ressurser": "Resources",
    "Aktiver": "Enable", "Deaktiver": "Disable",
    "Standard": "Default",
    "Alle": "All", "Ingen": "None",
    "OK": "OK",
}

# ==================== CZECH ====================
LOCALE_DICTS["cs"] = {
    "Aktivní": "Active", "Neaktivní": "Inactive",
    "Povoleno": "Enabled", "Zakázáno": "Disabled",
    "Vytvořit": "Create", "Upravit": "Edit",
    "Aktualizovat": "Update", "Odstranit": "Delete",
    "Přidat": "Add", "Odebrat": "Remove",
    "Uložit": "Save", "Zrušit": "Cancel",
    "Načítání": "Loading",
    "Filtrovat...": "Filter...",
    "Žádné výsledky.": "No results.",
    "Předchozí": "Previous", "Další": "Next",
    "Název": "Name", "Popis": "Description",
    "Typ": "Type", "Stav": "Status",
    "Nastavení": "Settings",
    "Konfigurace": "Configuration",
    "Správa": "Administration",
    "Systém": "System", "Doména": "Domain",
    "Uživatelé": "Users", "Zdroje": "Resources",
    "Povolit": "Enable", "Zakázat": "Disable",
    "Výchozí": "Default",
    "Vše": "All", "Žádný": "None",
    "OK": "OK",
}

# ==================== GREEK ====================
LOCALE_DICTS["el"] = {
    "Ενεργό": "Active", "Ανενεργό": "Inactive",
    "Ενεργοποιημένο": "Enabled", "Απενεργοποιημένο": "Disabled",
    "Δημιουργία": "Create", "Επεξεργασία": "Edit",
    "Ενημέρωση": "Update", "Διαγραφή": "Delete",
    "Προσθήκη": "Add", "Αφαίρεση": "Remove",
    "Αποθήκευση": "Save", "Ακύρωση": "Cancel",
    "Φόρτωση": "Loading",
    "Φίλτρο...": "Filter...",
    "Κανένα αποτέλεσμα.": "No results.",
    "Προηγούμενο": "Previous", "Επόμενο": "Next",
    "Όνομα": "Name", "Περιγραφή": "Description",
    "Τύπος": "Type", "Κατάσταση": "Status",
    "Ρυθμίσεις": "Settings",
    "Διαμόρφωση": "Configuration",
    "Διαχείριση": "Administration",
    "Σύστημα": "System", "Τομέας": "Domain",
    "Χρήστες": "Users", "Πόροι": "Resources",
    "Ενεργοποίηση": "Enable", "Απενεργοποίηση": "Disable",
    "Προεπιλογή": "Default",
    "Όλα": "All", "Κανένα": "None",
    "OK": "OK",
}

# ==================== TURKISH ====================
LOCALE_DICTS["tr"] = {
    "Aktif": "Active", "Pasif": "Inactive",
    "Etkin": "Enabled", "Devre dışı": "Disabled",
    "Oluştur": "Create", "Düzenle": "Edit",
    "Güncelle": "Update", "Sil": "Delete",
    "Ekle": "Add", "Kaldır": "Remove",
    "Kaydet": "Save", "İptal": "Cancel",
    "Yükleniyor": "Loading",
    "Filtrele...": "Filter...",
    "Sonuç yok.": "No results.",
    "Önceki": "Previous", "Sonraki": "Next",
    "Ad": "Name", "Açıklama": "Description",
    "Tür": "Type", "Durum": "Status",
    "Ayarlar": "Settings",
    "Yapılandırma": "Configuration",
    "Yönetim": "Administration",
    "Sistem": "System", "Alan": "Domain",
    "Kullanıcılar": "Users", "Kaynaklar": "Resources",
    "Etkinleştir": "Enable", "Devre dışı bırak": "Disable",
    "Varsayılan": "Default",
    "Tümü": "All", "Hiçbiri": "None",
    "Tamam": "OK",
}

# ==================== HUNGARIAN ====================
LOCALE_DICTS["hu"] = {
    "Aktív": "Active", "Inaktív": "Inactive",
    "Engedélyezve": "Enabled", "Letiltva": "Disabled",
    "Létrehozás": "Create", "Szerkesztés": "Edit",
    "Frissítés": "Update", "Törlés": "Delete",
    "Hozzáadás": "Add", "Eltávolítás": "Remove",
    "Mentés": "Save", "Mégse": "Cancel",
    "Betöltés": "Loading",
    "Szűrés...": "Filter...",
    "Nincsenek eredmények.": "No results.",
    "Előző": "Previous", "Következő": "Next",
    "Név": "Name", "Leírás": "Description",
    "Típus": "Type", "Állapot": "Status",
    "Beállítások": "Settings",
    "Konfiguráció": "Configuration",
    "Adminisztráció": "Administration",
    "Rendszer": "System", "Tartomány": "Domain",
    "Felhasználók": "Users", "Erőforrások": "Resources",
    "Engedélyez": "Enable", "Letilt": "Disable",
    "Alapértelmezett": "Default",
    "Összes": "All", "Egyik sem": "None",
    "OK": "OK",
}

# ==================== ROMANIAN ====================
LOCALE_DICTS["ro"] = {
    "Activ": "Active", "Inactiv": "Inactive",
    "Activat": "Enabled", "Dezactivat": "Disabled",
    "Creează": "Create", "Editează": "Edit",
    "Actualizează": "Update", "Șterge": "Delete",
    "Adaugă": "Add", "Elimină": "Remove",
    "Salvează": "Save", "Anulare": "Cancel",
    "Se încarcă": "Loading",
    "Filtrează...": "Filter...",
    "Niciun rezultat.": "No results.",
    "Anterior": "Previous", "Următorul": "Next",
    "Nume": "Name", "Descriere": "Description",
    "Tip": "Type", "Status": "Status",
    "Setări": "Settings",
    "Configurație": "Configuration",
    "Administrare": "Administration",
    "Sistem": "System", "Domeniu": "Domain",
    "Utilizatori": "Users", "Resurse": "Resources",
    "Activează": "Enable", "Dezactivează": "Disable",
    "Implicit": "Default",
    "Toate": "All", "Niciunul": "None",
    "OK": "OK",
}

# ==================== KOREAN ====================
LOCALE_DICTS["ko"] = {
    "활성": "Active", "비활성": "Inactive",
    "활성화됨": "Enabled", "비활성화됨": "Disabled",
    "생성": "Create", "편집": "Edit",
    "업데이트": "Update", "삭제": "Delete",
    "추가": "Add", "제거": "Remove",
    "저장": "Save", "취소": "Cancel",
    "로딩 중": "Loading",
    "필터...": "Filter...",
    "결과 없음.": "No results.",
    "이전": "Previous", "다음": "Next",
    "이름": "Name", "설명": "Description",
    "유형": "Type", "상태": "Status",
    "설정": "Settings",
    "구성": "Configuration",
    "관리": "Administration",
    "시스템": "System", "도메인": "Domain",
    "사용자": "Users", "리소스": "Resources",
    "활성화": "Enable", "비활성화": "Disable",
    "기본": "Default",
    "모두": "All", "없음": "None",
    "확인": "OK",
}

# ==================== HINDI ====================
LOCALE_DICTS["hi"] = {
    "सक्रिय": "Active", "निष्क्रिय": "Inactive",
    "सक्षम": "Enabled", "अक्षम": "Disabled",
    "बनाएँ": "Create", "संपादित करें": "Edit",
    "अद्यतन करें": "Update", "हटाएं": "Delete",
    "जोड़ें": "Add", "निकालें": "Remove",
    "सहेजें": "Save", "रद्द करें": "Cancel",
    "लोड हो रहा है": "Loading",
    "फ़िल्टर...": "Filter...",
    "कोई परिणाम नहीं।": "No results.",
    "पिछला": "Previous", "अगला": "Next",
    "नाम": "Name", "विवरण": "Description",
    "प्रकार": "Type", "स्थिति": "Status",
    "सेटिंग्स": "Settings",
    "कॉन्फ़िगरेशन": "Configuration",
    "प्रशासन": "Administration",
    "सिस्टम": "System", "डोमेन": "Domain",
    "उपयोगकर्ता": "Users", "संसाधन": "Resources",
    "सक्षम करें": "Enable", "अक्षम करें": "Disable",
    "डिफ़ॉल्ट": "Default",
    "सभी": "All", "कोई नहीं": "None",
    "ठीक": "OK",
}

# ==================== ARABIC ====================
LOCALE_DICTS["ar"] = {
    "نشط": "Active", "غير نشط": "Inactive",
    "ممكّن": "Enabled", "معطل": "Disabled",
    "إنشاء": "Create", "تعديل": "Edit",
    "تحديث": "Update", "حذف": "Delete",
    "إضافة": "Add", "إزالة": "Remove",
    "حفظ": "Save", "إلغاء": "Cancel",
    "جارٍ التحميل": "Loading",
    "تصفية...": "Filter...",
    "لا توجد نتائج.": "No results.",
    "السابق": "Previous", "التالي": "Next",
    "الاسم": "Name", "الوصف": "Description",
    "النوع": "Type", "الحالة": "Status",
    "الإعدادات": "Settings",
    "التكوين": "Configuration",
    "الإدارة": "Administration",
    "النظام": "System", "المجال": "Domain",
    "المستخدمون": "Users", "الموارد": "Resources",
    "تمكين": "Enable", "تعطيل": "Disable",
    "الافتراضي": "Default",
    "الكل": "All", "لا شيء": "None",
    "موافق": "OK",
}

# ==================== THAI ====================
LOCALE_DICTS["th"] = {
    "เปิดใช้งาน": "Active", "ปิดใช้งาน": "Inactive",
    "เปิด": "Enabled", "ปิด": "Disabled",
    "สร้าง": "Create", "แก้ไข": "Edit",
    "อัปเดต": "Update", "ลบ": "Delete",
    "เพิ่ม": "Add", "ลบออก": "Remove",
    "บันทึก": "Save", "ยกเลิก": "Cancel",
    "กำลังโหลด": "Loading",
    "กรอง...": "Filter...",
    "ไม่มีผลลัพธ์": "No results.",
    "ก่อนหน้า": "Previous", "ถัดไป": "Next",
    "ชื่อ": "Name", "คำอธิบาย": "Description",
    "ประเภท": "Type", "สถานะ": "Status",
    "การตั้งค่า": "Settings",
    "การกำหนดค่า": "Configuration",
    "การดูแลระบบ": "Administration",
    "ระบบ": "System", "โดเมน": "Domain",
    "ผู้ใช้": "Users", "ทรัพยากร": "Resources",
    "เปิดใช้งาน": "Enable", "ปิดใช้งาน": "Disable",
    "ค่าเริ่มต้น": "Default",
    "ทั้งหมด": "All", "ไม่มี": "None",
    "ตกลง": "OK",
}

# ==================== VIETNAMESE ====================
LOCALE_DICTS["vi"] = {
    "Hoạt động": "Active", "Không hoạt động": "Inactive",
    "Đã bật": "Enabled", "Đã tắt": "Disabled",
    "Tạo": "Create", "Chỉnh sửa": "Edit",
    "Cập nhật": "Update", "Xóa": "Delete",
    "Thêm": "Add", "Xóa bỏ": "Remove",
    "Lưu": "Save", "Hủy": "Cancel",
    "Đang tải": "Loading",
    "Lọc...": "Filter...",
    "Không có kết quả.": "No results.",
    "Trước": "Previous", "Tiếp theo": "Next",
    "Tên": "Name", "Mô tả": "Description",
    "Loại": "Type", "Trạng thái": "Status",
    "Cài đặt": "Settings",
    "Cấu hình": "Configuration",
    "Quản trị": "Administration",
    "Hệ thống": "System", "Miền": "Domain",
    "Người dùng": "Users", "Tài nguyên": "Resources",
    "Bật": "Enable", "Tắt": "Disable",
    "Mặc định": "Default",
    "Tất cả": "All", "Không có": "None",
    "OK": "OK",
}

# ==================== INDONESIAN ====================
LOCALE_DICTS["id"] = {
    "Aktif": "Active", "Tidak aktif": "Inactive",
    "Diaktifkan": "Enabled", "Dinonaktifkan": "Disabled",
    "Buat": "Create", "Sunting": "Edit",
    "Perbarui": "Update", "Hapus": "Delete",
    "Tambah": "Add", "Hapus": "Remove",
    "Simpan": "Save", "Batal": "Cancel",
    "Memuat": "Loading",
    "Filter...": "Filter...",
    "Tidak ada hasil.": "No results.",
    "Sebelumnya": "Previous", "Selanjutnya": "Next",
    "Nama": "Name", "Deskripsi": "Description",
    "Tipe": "Type", "Status": "Status",
    "Pengaturan": "Settings",
    "Konfigurasi": "Configuration",
    "Administrasi": "Administration",
    "Sistem": "System", "Domain": "Domain",
    "Pengguna": "Users", "Sumber daya": "Resources",
    "Aktifkan": "Enable", "Nonaktifkan": "Disable",
    "Bawaan": "Default",
    "Semua": "All", "Tidak ada": "None",
    "OK": "OK",
}

# ============================================================
# TRANSLATION ENGINE
# ============================================================

def build_reverse_map(locale):
    """Build a mapping: English string -> Translated string for this locale."""
    rev = {}
    for trans, en in LOCALE_DICTS.get(locale, {}).items():
        rev[en] = trans
    return rev

def translate_object(obj, rev_map):
    """Recursively translate all 'string' values in JSON object."""
    if isinstance(obj, dict):
        result = {}
        for key, value in obj.items():
            if key == "string" and isinstance(value, str) and value in rev_map:
                result[key] = rev_map[value]
            else:
                result[key] = translate_object(value, rev_map)
        return result
    elif isinstance(obj, list):
        return [translate_object(item, rev_map) for item in obj]
    else:
        return obj

def count_translations(en_data, translated_data):
    """Count how many strings were changed."""
    changes = 0
    total = 0
    
    def compare(e, t):
        nonlocal changes, total
        if isinstance(e, dict) and isinstance(t, dict):
            for k in e:
                if k == "string" and isinstance(e[k], str):
                    total += 1
                    if t.get(k) != e[k]:
                        changes += 1
                if k in t:
                    compare(e[k], t[k])
        elif isinstance(e, list) and isinstance(t, list):
            for i in range(min(len(e), len(t))):
                compare(e[i], t[i])
    
    compare(en_data, translated_data)
    return changes, total

def main():
    print("=" * 70)
    print(" MASS TRANSLATION - ALL FILES FOR ALL 21 LOCALES")
    print("=" * 70)
    
    # Collect all English files (skip the 'en' directory itself)
    all_files = sorted([f for f in EN_DIR.glob("**/*.json")])
    print(f"Found {len(all_files)} English JSON files\n")
    
    grand_total_added = 0
    grand_total_strings = 0
    grand_files_changed = 0
    
    for locale in LOCALES:
        rev_map = build_reverse_map(locale)
        if not rev_map:
            print(f"  {locale:5s}: ⚠️  No translations defined")
            continue
        
        locale_added = 0
        locale_total = 0
        locale_files = 0
        
        for en_file in all_files:
            rel = en_file.relative_to(EN_DIR)
            loc_file = MSG_DIR / locale / rel
            
            if not loc_file.exists():
                continue
            
            try:
                en_data = json.loads(en_file.read_text())
                loc_data = json.loads(loc_file.read_text())
            except:
                continue
            
            # Apply translations on top of existing locale data
            new_data = translate_object(loc_data, rev_map)
            
            # Count new translations
            old_trans, _ = count_translations(en_data, loc_data)
            new_trans, total = count_translations(en_data, new_data)
            added = new_trans - old_trans
            
            if added > 0:
                loc_file.write_text(json.dumps(new_data, ensure_ascii=False, indent=4))
                locale_added += added
                locale_total += total
                locale_files += 1
        
        if locale_total > 0:
            pct = (locale_added * 100) // locale_total if locale_added > 0 else 0
            print(f"  {locale:5s}: +{locale_added:4d} new translations in {locale_files:3d} files")
        else:
            print(f"  {locale:5s}: no files found")
        
        grand_total_added += locale_added
        grand_total_strings += locale_total
        grand_files_changed += locale_files
    
    print("\n" + "=" * 70)
    print(f"✅ TOTAL: +{grand_total_added} new translations across {grand_files_changed} file-operations")
    if grand_total_strings > 0:
        print(f"   Files processed: {grand_files_changed}")
    print("=" * 70)

if __name__ == "__main__":
    main()
