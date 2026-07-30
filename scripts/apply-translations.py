#!/usr/bin/env python3
"""
Apply translations to all locale files.
Uses a built-in dictionary for known translations and falls back to English.
"""
import json
from pathlib import Path

MSG_DIR = Path(__file__).parent.parent / "src" / "messages"
EN_DIR  = MSG_DIR / "en"

LOCALES = [
    "de","fr","es","zh",  # pre-existing
    "it","pt","ja",        # Phase 1
    "nl","pl","ru",        # Phase 2
    "sv","da","fi","no",
    "cs","el","tr","hu",
    "ro","ko","hi","ar",
    "th","vi","id",
]

# Minimal dictionary - most common strings
# Only includes strings that are DIFFERENT from English
T = {
    "Loading...": {
        "de":"Wird geladen...","fr":"Chargement...","es":"Cargando...","zh":"加载中...",
        "it":"Caricamento...","pt":"A carregar...","ja":"読み込み中...","nl":"Laden...",
        "pl":"Ładowanie...","ru":"Загрузка...","sv":"Laddar...","da":"Indlæser...",
        "fi":"Ladataan...","no":"Laster...","cs":"Načítání...","el":"Φόρτωση...",
        "tr":"Yükleniyor...","hu":"Betöltés...","ro":"Se încarcă...","ko":"로딩 중...",
        "hi":"लोड हो रहा है...","ar":"جارٍ التحميل...","th":"กำลังโหลด...","vi":"Đang tải...",
        "id":"Memuat...",
    },
    "Error": {
        "de":"Fehler","fr":"Erreur","es":"Error","zh":"错误",
        "it":"Errore","pt":"Erro","ja":"エラー","nl":"Fout",
        "pl":"Błąd","ru":"Ошибка","sv":"Fel","da":"Fejl",
        "fi":"Virhe","no":"Feil","cs":"Chyba","el":"Σφάλμα",
        "tr":"Hata","hu":"Hiba","ro":"Eroare","ko":"오류",
        "hi":"त्रुटि","ar":"خطأ","th":"ข้อผิดพลาด","vi":"Lỗi",
        "id":"Kesalahan",
    },
    "Warning": {
        "de":"Warnung","fr":"Avertissement","es":"Advertencia","zh":"警告",
        "it":"Avviso","pt":"Aviso","ja":"警告","nl":"Waarschuwing",
        "pl":"Ostrzeżenie","ru":"Предупреждение","sv":"Varning","da":"Advarsel",
        "fi":"Varoitus","no":"Advarsel","cs":"Varování","el":"Προειδοποίηση",
        "tr":"Uyarı","hu":"Figyelmeztetés","ro":"Avertisment","ko":"경고",
        "hi":"चेतावन","ar":"تحذير","th":"คำเตือน","vi":"Cảnh báo",
        "id":"Peringatan",
    },
    "Success": {
        "de":"Erfolg","fr":"Succès","es":"Éxito","zh":"成功",
        "it":"Successo","pt":"Sucesso","ja":"成功","nl":"Succes",
        "pl":"Sukces","ru":"Успех","sv":"Framgång","da":"Succes",
        "fi":"Onnistui","no":"Succes","cs":"Úspěch","el":"Επιτυχία",
        "tr":"Başarı","hu":"Siker","ro":"Succes","ko":"성공",
        "hi":"सफलता","ar":"نجاح","th":"สำเร็จ","vi":"Thành công",
        "id":"Keberhasilan",
    },
    "Info": {
        "de":"INfo","fr":"Info","es":"Información","zh":"信息",
        "it":"Informazione","pt":"Informação","ja":"情報","nl":"Informatie",
        "pl":"Informacja","ru":"Информация","sv":"Information","da":"Information",
        "fi":"Tietoa","no":"Informasjon","cs":"Informace","el":"Πληροφορία",
        "tr":"Bilgi","hu":"Információ","ro":"Informații","ko":"정보",
        "hi":"जानकारी","ar":"معلومات","th":"ข้อมูล","vi":"Thông tin",
        "id":"Informasi",
    },
    "Cancel": {
        "de":"Abbrechen","fr":"Annuler","es":"Cancelar","zh":"取消",
        "it":"Annulla","pt":"Cancelar","ja":"キャンセル","nl":"Annuleren",
        "pl":"Anuluj","ru":"Отмена","sv":"Avbryt","da":"Annuller",
        "fi":"Peruuta","no":"Avbryt","cs":"Zrušit","el":"Ακύρωση",
        "tr":"İptal","hu":"Mégsem","ro":"Anulează","ko":"취소",
        "hi":"रद्द करें","ar":"إلغاء","th":"ยกเลิก","vi":"Hủy",
        "id":"Batal",
    },
    "Save": {
        "de":"Speichern","fr":"Enregistrer","es":"Guardar","zh":"保存",
        "it":"Salva","pt":"Salvar","ja":"保存","nl":"Opslaan",
        "pl":"Zapisz","ru":"Сохранить","sv":"Spara","da":"Gem",
        "fi":"Tallenna","no":"Lagre","cs":"Uložit","el":"Αποθήκευση",
        "tr":"Kaydet","hu":"Mentés","ro":"Salvează","ko":"저장",
        "hi":"सहेजें","ar":"حفظ","th":"บันทึก","vi":"Lưu",
        "id":"Simpan",
    },
    "Delete": {
        "de":"Löschen","fr":"Supprimer","es":"Eliminar","zh":"删除",
        "it":"Elimina","pt":"Eliminar","ja":"削除","nl":"Verwijderen",
        "pl":"Usuń","ru":"Удалить","sv":"Ta bort","da":"Slet",
        "fi":"Poista","no":"Slett","cs":"Smazat","el":"Διαγραφή",
        "tr":"Sil","hu":"Töröl","ro":"Șterge","ko":"삭제",
        "hi":"हटाएँ","ar":"حذف","th":"ลบ","vi":"Xóa",
        "id":"Hapus",
    },
    "Edit": {
        "de":"Bearbeiten","fr":"Modifier","es":"Editar","zh":"编辑",
        "it":"Modifica","pt":"Editar","ja":"編集","nl":"Bewerken",
        "pl":"Edytuj","ru":"Редактировать","sv":"Redigera","da":"Redigerer",
        "fi":"Muokkaa","no":"Rediger","cs":"Upravit","el":"Επεξεργασία",
        "tr":"Düzenle", "hu":"Szerkeszt","ro":"Modifică","ko":"편집",
        "hi":"संपादित करें","ar":"تعديل","th":"แก้ไข","vi":"Chỉnh sửa",
        "id":"Edit",
    },
    "Create": {
        "de":"Erstellen","fr":"Créer","es":"Crear","zh":"创建",
        "it":"Crea","pt":"Criar","ja":"作成","nl":"Maken",
        "pl":"Utwórz","ru":"Создать","sv":"Skapa","da":"Opret",
        "fi":"Luo","no":"Opprett","cs":"Vytvořit","el":"Δημιουργία",
        "tr":"Oluştur","hu":"Létrehoz","ro":"Creează","ko":"만들기",
        "hi":"बनाएँ","ar":"إنشاء","th":"สร้าง","vi":"Tạo",
        "id":"Buat",
    },
    "Add": {
        "de":"Hinzufügen","fr":"Ajouter","es":"Añadir","zh":"添加",
        "it":"Aggiungi","pt":"Adicionar","ja":"追加","nl":"Toevoegen",
        "pl":"Dodaj","ru":"Добавить","sv":"Lägg till","da":"Tilføj",
        "fi":"Lisää","no":"Legg til","cs":"Přidat","el":"Προσθήκη",
        "tr":"Ekle","hu":"Hozzáadás","ro":"Adaugă","ko":"추가",
        "hi":"जोड़ें","ar":"إضافة","th":"เพิ่ม","vi":"Thêm",
        "id":"Tambah",
    },
    "Search": {
        "de":"Suche","fr":"Rechercher","es":"Buscar","zh":"搜索",
        "it":"Cerca","pt":"Pesquisar","ja":"検索","nl":"Zoeken",
        "pl":"Szukaj","ru":"Поиск","sv":"Sök","da":"Søg",
        "fi":"Hae","no":"Søk","cs":"Hledat","el":"Αναζήτηση",
        "tr":"Ara","hu":"Keresés","ro":"Căutare","ko":"검색",
        "hi":"खोजें","ar":"بحث","th":"ค้นหา","vi":"Tìm kiếm",
        "id":"Cari",
    },
    "Settings": {
        "de":"Einstellungen","fr":"Paramètres","es":"Ajustes","zh":"设置",
        "it":"Impostazioni","pt":"Configurações","ja":"設定","nl":"Instellingen",
        "pl":"Ustawienia","ru":"Настройки","sv":"Inställningar","da":"Indstillinger",
        "fi":"Asetukset","no":"Innstillinger","cs":"Nastavení","el":"Ρυθμίσεις",
        "tr":"Ayarlar","hu":"Beállítások","ro":"Setări","ko":"설정",
        "hi":"सेटिंग्स","ar":"إعدادات","th":"การตั้งค่า","vi":"Cài đặt",
        "id":"Pengaturan",
    },
    "Back": {
        "de":"Zurück","fr":"Retour","es":"Atrás","zh":"返回",
        "it":"Indietro","pt":"Voltar","ja":"戻る","nl":"Terug",
        "pl":"Wstecz","ru":"Назад","sv":"Tillbaka","da":"Tilbage",
        "fi":"Takaisin","no":"Tilbake","cs":"Zpět","el":"Πίσω",
        "tr":"Geri","hu":"Vissza","ro":"Înapoi","ko":"뒤로",
        "hi":"पीछे","ar":"رجوع","th":"ย้อนกลับ","vi":"Quay lại",
        "id":"Kembali",
    },
    "Next": {
        "de":"Weiter","fr":"Suivant","es":"Siguiente","zh":"下一步",
        "it":"Avanti","pt":"Próximo","ja":"次へ","nl":"Volgende",
        "pl":"Dalej","ru":"Далее","sv":"Nästa","da":"Næste",
        "fi":"Seuraava","no":"Neste","cs":"Další","el":"Επόμενο",
        "tr":"Sonraki","hu":"Következő","ro":"Următorul","ko":"다음",
        "hi":"अगला","ar":"التالي","th":"ถัดไป","vi":"Tiếp theo",
        "id":"Berikutnya",
    },
    "Previous": {
        "de":"Zurück","fr":"Précédent","es":"Anterior","zh":"上一步",
        "it":"Precedente","pt":"Anterior","ja":"前へ","nl":"Vorige",
        "pl":"Poprzedni","ru":"Предыд","sv":"Föregående","da":"Forrige",
        "fi":"Edellinen","no":"Forrige","cs":"Předchozí","el":"Προηγούμενο",
        "tr":"Önceki","hu":"Előző","ro":"Anterior","ko":"이전",
        "hi":"पिछला","ar":"السابق","th":"ก่อนหน้า","vi":"Trước đó",
        "id":"Sebelumnya",
    },
    "Close": {
        "de":"Schließen","fr":"Fermer","es":"Cerrar","zh":"关闭",
        "it":"Chiudi","pt":"Fechar","ja":"閉じる","nl":"Sluiten",
        "pl":"Zamknij","ru":"Закрыть","sv":"Stäng","da":"Luk",
        "fi":"Sulje","no":"Lukk","cs":"Zavřít","el":"Κλείσιμο",
        "tr":"Kapat","hu":"Bezárás","ro":"Închide","ko":"닫기",
        "hi":"बंद करें","ar":"إغلاق","th":"ปิด","vi":"Đóng",
        "id":"Tutup",
    },
    "Open": {
        "de":"Öffnen","fr":"Ouvrir","es":"Abrir","zh":"打开",
        "it":"Apri","pt":"Abrir","ja":"開く","nl":"Openen",
        "pl":"Otwórz","ru":"Открыть","sv":"Öppna","da":"Åbn",
        "fi":"Avaa","no":"Åpne","cs":"Otevřít","el":"Άνοιγμα",
        "tr":"Aç","hu":"Megnyitás","ro":"Deschide","ko":"열기",
        "hi":"खोलें","ar":"فتح","th":"เปิด","vi":"Mở",
        "id":"Buka",
    },
}

def get_translation(en, locale):
    """Get translation for a string, defaults to English."""
    if en in T and locale in T[en]:
        return T[en][locale]
    return en

def translate_file(locale, en_file):
    """Translate a single file."""
    rel = en_file.relative_to(EN_DIR)
    loc_file = MSG_DIR / locale / rel
    
    if not loc_file.exists():
        loc_file.parent.mkdir(parents=True, exist_ok=True)
        import shutil
        shutil.copy2(str(en_file), str(loc_file))
    
    with open(loc_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    count = 0
    
    def walk(obj):
        nonlocal count
        if isinstance(obj, dict):
            for key, value in list(obj.items()):
                if key == "string" and isinstance(value, str):
                    translated = get_translation(value, locale)
                    if translated != value:
                        obj[key] = translated
                        count += 1
                elif isinstance(value, (dict, list)):
                    walk(value)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                if isinstance(item, str):
                    translated = get_translation(item, locale)
                    if translated != item:
                        obj[i] = translated
                        count += 1
                elif isinstance(item, (dict, list)):
                    walk(item)
    
    walk(data)
    
    if count > 0:
        with open(loc_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
    
    return count

def main():
    print("Translating all locale files...")
    print(f"Dictionary: {len(T)} entries")
    print(f"Locales: {len(LOCALES)}")
    
    en_files = sorted(EN_DIR.glob("**/*.json"))
    print(f"Files: {len(en_files)}")
    
    total = 0
    for i, en_file in enumerate(en_files):
        for loc in LOCALES:
            total += translate_file(loc, en_file)
    
    print(f"\n✅ Translated {total} strings across all files and locales")

if __name__ == "__main__":
    main()
