#!/usr/bin/env python3
"""
Mass translate all email files for all 21 locales.
This script contains all translations and applies them to all locale files.
"""
import json
import shutil
from pathlib import Path

MSG_DIR = Path(__file__).parent.parent / "src" / "messages"
EN_DIR = MSG_DIR / "en"

# All 21 target locales
LOCALES = [
    "it", "pt", "ja", "nl", "pl", "ru",
    "sv", "da", "fi", "no", "cs",
    "el", "tr", "hu", "ro", "ko",
    "hi", "ar", "th", "vi", "id"
]

# Email files to translate
EMAIL_FILES = [
    "mails/compose.json",
    "mails/list.json",
    "mails/snooze.json",
    "mails/commons.json"
]

# Translation dictionaries for common strings
# Format: {english_string: {locale: translated_string}}
COMMON_TRANS = {
    "From": {
        "it": "Da", "pt": "De", "ja": "送信者", "nl": "Van", "pl": "Od", "ru": "От",
        "sv": "Från", "da": "Fra", "fi": "Lähettäjä", "no": "Fra", "cs": "Od",
        "el": "Από", "tr": "Gönderen", "hu": "Feladó", "ro": "De la",
        "ko": "보내는 사람", "hi": "प्रेषक", "ar": "من", "th": "จาก", "vi": "Từ", "id": "Dari"
    },
    "To": {
        "it": "A", "pt": "Para", "ja": "受信者", "nl": "Aan", "pl": "Do", "ru": "Кому",
        "sv": "Till", "da": "Til", "fi": "Vastaanottaja", "no": "Til", "cs": "Komu",
        "el": "Προς", "tr": "Kime", "hu": "Címzett", "ro": "Către",
        "ko": "받는 사람", "hi": "प्रापक", "ar": "إلى", "th": "ถึง", "vi": "Đến", "id": "Untuk"
    },
    "Cc": {
        "it": "Cc", "pt": "Cc", "ja": "Cc", "nl": "Cc", "pl": "Cc", "ru": "Копия",
        "sv": "Cc", "da": "Cc", "fi": "Cc", "no": "Cc", "cs": "Cc",
        "el": "Κα", "tr": "Bilgi", "hu": "Másolat", "ro": "Cc",
        "ko": "참조", "hi": "Cc", "ar": "نسخة", "th": "สำเนา", "vi": "Cc", "id": "Cc"
    },
    "Bcc": {
        "it": "Ccn", "pt": "Cco", "ja": "Bcc", "nl": "Bcc", "pl": "Uk", "ru": "Скрытая копия",
        "sv": "Bcc", "da": "Bcc", "fi": "Kk", "no": "Bcc", "cs": "Skrytá kopie",
        "el": "ΑΚ", "tr": "Gizli", "hu": "Titrált", "ro": "Bcc",
        "ko": "참조(비밀)", "hi": "Bcc", "ar": "نسخة مخفية", "th": "สำเนาลับ", "vi": "Bcc", "id": "Bcc"
    },
    "Subject": {
        "it": "Oggetto", "pt": "Assunto", "ja": "件名", "nl": "Onderwerp", "pl": "Temat", "ru": "Тема",
        "sv": "Ämne", "da": "Emne", "fi": "Aihe", "no": "Emne", "cs": "Předmět",
        "el": "Θέμα", "tr": "Konu", "hu": "Tárgy", "ro": "Subiect",
        "ko": "제목", "hi": "विषय", "ar": "الموضوع", "th": "เรื่อง", "vi": "Tiêu đề", "id": "Subjek"
    },
    "Send": {
        "it": "Invia", "pt": "Enviar", "ja": "送信", "nl": "Versturen", "pl": "Wyślij", "ru": "Отправить",
        "sv": "Skicka", "da": "Send", "fi": "Lähetä", "no": "Send", "cs": "Odeslat",
        "el": "Αποστολή", "tr": "Gönder", "hu": "Küldés", "ro": "Trimite",
        "ko": "보내기", "hi": "भेजें", "ar": "إرسال", "th": "ส่ง", "vi": "Gửi", "id": "Kirim"
    },
    "OK": {
        "it": "OK", "pt": "OK", "ja": "OK", "nl": "OK", "pl": "OK", "ru": "OK",
        "sv": "OK", "da": "OK", "fi": "OK", "no": "OK", "cs": "OK",
        "el": "OK", "tr": "Tamam", "hu": "Rendben", "ro": "OK",
        "ko": "확인", "hi": "ठीक", "ar": "موافق", "th": "ตกลง", "vi": "OK", "id": "OK"
    },
    "Cancel": {
        "it": "Annulla", "pt": "Cancelar", "ja": "キャンセル", "nl": "Annuleren", "pl": "Anuluj", "ru": "Отмена",
        "sv": "Avbryt", "da": "Annuller", "fi": "Peruuta", "no": "Avbryt", "cs": "Zrušit",
        "el": "Ακύρωση", "tr": "İptal", "hu": "Mégse", "ro": "Anulare",
        "ko": "취소", "hi": "रद्द करें", "ar": "إلغاء", "th": "ยกเลิก", "vi": "Hủy", "id": "Batal"
    },
    "Save": {
        "it": "Salva", "pt": "Salvar", "ja": "保存", "nl": "Opslaan", "pl": "Zapisz", "ru": "Сохранить",
        "sv": "Spara", "da": "Gem", "fi": "Tallenna", "no": "Lagre", "cs": "Uložit",
        "el": "Αποθήκευση", "tr": "Kaydet", "hu": "Mentés", "ro": "Salvează",
        "ko": "저장", "hi": "सहेजें", "ar": "حفظ", "th": "บันทึก", "vi": "Lưu", "id": "Simpan"
    },
    "Delete": {
        "it": "Elimina", "pt": "Excluir", "ja": "削除", "nl": "Verwijder", "pl": "Usuń", "ru": "Удалить",
        "sv": "Radera", "da": "Slet", "fi": "Poista", "no": "Slett", "cs": "Odstranit",
        "el": "Διαγραφή", "tr": "Sil", "hu": "Törlés", "ro": "Șterge",
        "ko": "삭제", "hi": "हटाएं", "ar": "حذف", "th": "ลบ", "vi": "Xóa", "id": "Hapus"
    },
    "Close": {
        "it": "Chiudi", "pt": "Fechar", "ja": "閉じる", "nl": "Sluiten", "pl": "Zamknij", "ru": "Закрыть",
        "sv": "Stäng", "da": "Luk", "fi": "Sulje", "no": "Lukk", "cs": "Zavřít",
        "el": "Κλείσιμο", "tr": "Kapat", "hu": "Bezárás", "ro": "Închide",
        "ko": "닫기", "hi": "बंद करें", "ar": "إغلاق", "th": "ปิด", "vi": "Đóng", "id": "Tutup"
    },
    "Download": {
        "it": "Scarica", "pt": "Baixar", "ja": "ダウンロード", "nl": "Downloaden", "pl": "Pobierz", "ru": "Скачать",
        "sv": "Ladda ner", "da": "Download", "fi": "Lataa", "no": "Last ned", "cs": "Stáhnout",
        "el": "Λήψη", "tr": "İndir", "hu": "Letöltés", "ro": "Descarcă",
        "ko": "다운로드", "hi": "डाउनलोड", "ar": "تنزيل", "th": "ดาวน์โหลด", "vi": "Tải xuống", "id": "Unduh"
    },
    "Search": {
        "it": "Cerca", "pt": "Pesquisar", "ja": "検索", "nl": "Zoeken", "pl": "Szukaj", "ru": "Поиск",
        "sv": "Sök", "da": "Søg", "fi": "Etsi", "no": "Søk", "cs": "Hledat",
        "el": "Αναζήτηση", "tr": "Ara", "hu": "Keresés", "ro": "Caută",
        "ko": "검색", "hi": "खोजें", "ar": "بحث", "th": "ค้นหา", "vi": "Tìm kiếm", "id": "Cari"
    },
    "Error": {
        "it": "Errore", "pt": "Erro", "ja": "エラー", "nl": "Fout", "pl": "Błąd", "ru": "Ошибка",
        "sv": "Fel", "da": "Fejl", "fi": "Virhe", "no": "Feil", "cs": "Chyba",
        "el": "Σφάλμα", "tr": "Hata", "hu": "Hiba", "ro": "Eroare",
        "ko": "오류", "hi": "त्रुटि", "ar": "خطأ", "th": "ข้อผิดพลาด", "vi": "Lỗi", "id": "Kesalahan"
    },
    "New message": {
        "it": "Nuovo messaggio", "pt": "Nova mensagem", "ja": "新規メッセージ", "nl": "Nieuw bericht", "pl": "Nowa wiadomość", "ru": "Новое сообщение",
        "sv": "Nytt meddelande", "da": "Nyt meddelelse", "fi": "Uusi viesti", "no": "Nytt melding", "cs": "Nová zpráva",
        "el": "Νέο μήνυμα", "tr": "Yeni mesaj", "hu": "Új üzenet", "ro": "Mesaj nou",
        "ko": "새 메시지", "hi": "नया संदेश", "ar": "رسالة جديدة", "th": "ข้อความใหม่", "vi": "Tin nhắn mới", "id": "Pesan baru"
    },
    "Inbox": {
        "it": "Posta in arrivo", "pt": "Caixa de entrada", "ja": "受信トレイ", "nl": "Postvak IN", "pl": "Skrzynka odbiorcza", "ru": "Входящие",
        "sv": "Inbox", "da": "Indbakke", "fi": "Saapuneet", "no": "Innboks", "cs": "Příchozí",
        "el": "Φάκελος εισερχομένων", "tr": "Gelen kutusu", "hu": "Bejövő", "ro": "Inbox",
        "ko": "收件箱", "hi": "इनबॉक्स", "ar": "الصندوق الوارد", "th": "กล่องจดหมายเข้า", "vi": "Hộp thư đến", "id": "Kotak masuk"
    },
    "Sent": {
        "it": "Inviati", "pt": "Enviados", "ja": "送信済み", "nl": "Verzonden", "pl": "Wysłane", "ru": "Отправленные",
        "sv": "Skickade", "da": "Sendt", "fi": "Lähetetyt", "no": "Sendt", "cs": "Odeslané",
        "el": "Απεσταλμένα", "tr": "Gönderilenler", "hu": "Elküldött", "ro": "Trimise",
        "ko": "보낸 편지함", "hi": "भेजा गया", "ar": "المُرسل", "th": "ที่ส่งแล้ว", "vi": "Đã gửi", "id": "Terkirim"
    },
    "Drafts": {
        "it": "Bozze", "pt": "Rascunhos", "ja": "下書き", "nl": "Concepten", "pl": "Szkice", "ru": "Черновики",
        "sv": "Utkast", "da": "Klodser", "fi": "Luonnokset", "no": "Kladder", "cs": "Koncepty",
        "el": "Πρόχειρα", "tr": "Taslaklar", "hu": "Vázlatok", "ro": "Schițe",
        "ko": "임시 저장", "hi": "खसड़े", "ar": "المسودات", "th": "ร่าง", "vi": "Nháp", "id": "Draf"
    },
    "Trash": {
        "it": "Cestino", "pt": "Lixeira", "ja": "ごみ箱", "nl": "Prullenbak", "pl": "Kosz", "ru": "Корзина",
        "sv": "Papperskorg", "da": "Skraldespand", "fi": "Roskakori", "no": "Papirkurv", "cs": "Koš",
        "el": "Κάδος", "tr": "Çöp", "hu": "Kuka", "ro": "Coș",
        "ko": "휴지통", "hi": "कूद", "ar": "سلة المهملات", "th": "ถังขยะ", "vi": "Thùng rác", "id": "Sampah"
    },
    "Junk": {
        "it": "Posta indesiderata", "pt": "Lixo eletrônico", "ja": "スパム", "nl": "Ongewenst", "pl": "Śmieci", "ru": "Спам",
        "sv": "Skräp", "da": "Skrammel", "fi": "Roskaposti", "no": "Søppel", "cs": "Nežádoucí",
        "el": "Ανεπιθύμητα", "tr": "İstenmeyen", "hu": "Spam", "ro": "Nedorite",
        "ko": "스팸", "hi": "जंक", "ar": "المهملات", "th": "สแปม", "vi": "Rác", "id": "Junk"
    },
    "Archive": {
        "it": "Archivia", "pt": "Arquivar", "ja": "アーカイブ", "nl": "Archiveren", "pl": "Archiwum", "ru": "Архив",
        "sv": "Arkiv", "da": "Arkiv", "fi": "Arkisto", "no": "Arkiv", "cs": "Archiv",
        "el": "Αρχείο", "tr": "Arşiv", "hu": "Archívum", "ro": "Arhivă",
        "ko": "보관", "hi": "संग्रह", "ar": "الأرشيف", "th": "เก็บถาวร", "vi": "Lưu trữ", "id": "Arsip"
    },
    "Folder": {
        "it": "Cartella", "pt": "Pasta", "ja": "フォルダ", "nl": "Map", "pl": "Folder", "ru": "Папка",
        "sv": "Mapp", "da": "Mappe", "fi": "Kansio", "no": "Mappe", "cs": "Složka",
        "el": "Φάκελος", "tr": "Klasör", "hu": "Mappa", "ro": "Dosar",
        "ko": "폴더", "hi": "फ़ोल्डर", "ar": "مجلد", "th": "โฟลเดอร์", "vi": "Thư mục", "id": "Folder"
    },
    "Folders": {
        "it": "Cartelle", "pt": "Pastas", "ja": "フォルダ", "nl": "Mappen", "pl": "Foldery", "ru": "Папки",
        "sv": "Mappar", "da": "Mapper", "fi": "Kansiot", "no": "Mapper", "cs": "Složky",
        "el": "Φάκελοι", "tr": "Klasörler", "hu": "Mappák", "ro": "Dosare",
        "ko": "폴더", "hi": "फ़ोल्डर", "ar": "مجلدات", "th": "โฟลเดอร์", "vi": "Thư mục", "id": "Folder"
    },
    "New folder": {
        "it": "Nuova cartella", "pt": "Nova pasta", "ja": "新規フォルダ", "nl": "Nieuwe map", "pl": "Nowy folder", "ru": "Новая папка",
        "sv": "Ny mapp", "da": "Ny mappe", "fi": "Uusi kansio", "no": "Ny mappe", "cs": "Nová složka",
        "el": "Νέος φάκελος", "tr": "Yeni klasör", "hu": "Új mappa", "ro": "Dosar nou",
        "ko": "새 폴더", "hi": "नया फ़ोल्डर", "ar": "مجلد جديد", "th": "โฟลเดอร์ใหม่", "vi": "Thư mục mới", "id": "Folder baru"
    },
    "Rename": {
        "it": "Rinomina", "pt": "Renomear", "ja": "名前変更", "nl": "Hernoemen", "pl": "Zmień nazwę", "ru": "Переименовать",
        "sv": "Byt namn", "da": "Omdøb", "fi": "Nimeä uudelleen", "no": "Gi nytt navn", "cs": "Přejmenovat",
        "el": "Μετονομασία", "tr": "Yeniden adlandır", "hu": "Átnevezés", "ro": "Redenumește",
        "ko": "이름 변경", "hi": "नाम बदलें", "ar": "إعادة تسمية", "th": "เปลี่ยนชื่อ", "vi": "Đổi tên", "id": "Ubah nama"
    },
    "Move": {
        "it": "Sposta", "pt": "Mover", "ja": "移動", "nl": "Verplaatsen", "pl": "Przenieś", "ru": "Переместить",
        "sv": "Flytta", "da": "Flyt", "fi": "Siirrä", "no": "Flytt", "cs": "Přesunout",
        "el": "Μετακίνηση", "tr": "Taşı", "hu": "Mozgatás", "ro": "Mută",
        "ko": "이동", "hi": "स्थानांतरित करें", "ar": "نقل", "th": "ย้าย", "vi": "Di chuyển", "id": "Pindahkan"
    },
    "Move to": {
        "it": "Sposta in", "pt": "Mover para", "ja": "移動先", "nl": "Verplaatsen naar", "pl": "Przenieś do", "ru": "Переместить в",
        "sv": "Flytta till", "da": "Flyt til", "fi": "Siirrä kohteeseen", "no": "Flytt til", "cs": "Přesunout do",
        "el": "Μετακίνηση σε", "tr": "Şuraya taşı", "hu": "Mozgatás ide", "ro": "Mută în",
        "ko": "이동 위치", "hi": "यहां स्थानांतरित करें", "ar": "نقل إلى", "th": "ย้ายไปยัง", "vi": "Di chuyển đến", "id": "Pindahkan ke"
    },
    "Mark as read": {
        "it": "Contrassegna come letto", "pt": "Marcar como lido", "ja": "既読にする", "nl": "Als gelezen markeren", "pl": "Oznacz jako przeczytane", "ru": "Отметить как прочитанное",
        "sv": "Markera som läst", "da": "Markér som læst", "fi": "Merkitse luetuksi", "no": "Merk som lest", "cs": "Označit jako přečtené",
        "el": "Σημείωση ως αναγνωσμένο", "tr": "Okundu olarak işaretle", "hu": "Megjelölés olvasottként", "ro": "Marchează ca citit",
        "ko": "읽음으로 표시", "hi": "पढ़ा हुआ चिह्नित करें", "ar": "تحديد كمقروء", "th": "ทำเครื่องหมายว่าอ่านแล้ว", "vi": "Đánh dấu đã đọc", "id": "Tandai sudah dibaca"
    },
    "Mark as unread": {
        "it": "Contrassegna come non letto", "pt": "Marcar como não lido", "ja": "未読にする", "nl": "Als ongelezen markeren", "pl": "Oznacz jako nieprzeczytane", "ru": "Отметить как непрочитанное",
        "sv": "Markera som oläst", "da": "Markér som ulæst", "fi": "Merkitse lukemattomaksi", "no": "Merk som ulest", "cs": "Označit jako nepřečtené",
        "el": "Σημείωση ως μη αναγνωσμένο", "tr": "Okunmadı olarak işaretle", "hu": "Megjelölés olvasatlanként", "ro": "Marchează ca necitit",
        "ko": "안 읽음으로 표시", "hi": "अनपढ़ा चिह्नित करें", "ar": "تحديد كغير مقروء", "th": "ทำเครื่องหมายว่ายังไม่ได้อ่าน", "vi": "Đánh dấu chưa đọc", "id": "Tandai belum dibaca"
    },
    "Print": {
        "it": "Stampa", "pt": "Imprimir", "ja": "印刷", "nl": "Afdrukken", "pl": "Drukuj", "ru": "Печать",
        "sv": "Skriv ut", "da": "Udskriv", "fi": "Tulosta", "no": "Skriv ut", "cs": "Tisknout",
        "el": "Εκτύπωση", "tr": "Yazdır", "hu": "Nyomtatás", "ro": "Tipărește",
        "ko": "인쇄", "hi": "प्रिंट", "ar": "طباعة", "th": "พิมพ์", "vi": "In", "id": "Cetak"
    },
    "View source": {
        "it": "Visualizza sorgente", "pt": "Ver fonte", "ja": "ソースを表示", "nl": "Bron bekijken", "pl": "Zobacz źródło", "ru": "Посмотреть исходник",
        "sv": "Visa källa", "da": "Vis kilde", "fi": "Näytä lähde", "no": "Vis kilde", "cs": "Zobrazit zdroj",
        "el": "Προβολή πηγαίου", "tr": "Kaynağı görüntüle", "hu": "Forrás megtekintése", "ro": "Vezi sursa",
        "ko": "소스 보기", "hi": "स्रोत देखें", "ar": "عرض المصدر", "th": "ดูแหล่งที่มา", "vi": "Xem nguồn", "id": "Lihat sumber"
    },
    "More actions": {
        "it": "Altre azioni", "pt": "Mais ações", "ja": "その他のアクション", "nl": "Meer acties", "pl": "Więcej akcji", "ru": "Другие действия",
        "sv": "Fler åtgärder", "da": "Flere handlinger", "fi": "Lisää toimintoja", "no": "Flere handlinger", "cs": "Více akcí",
        "el": "Περισσότερες ενέργειες", "tr": "Daha fazla işlem", "hu": "További műveletek", "ro": "Mai multe acțiuni",
        "ko": "더 많은 작업", "hi": "अधिक कार्यवाही", "ar": "إجراءات أخرى", "th": "การดำเนินการอื่น", "vi": "Thao tác khác", "id": "Tindakan lainnya"
    },
    "Next mail": {
        "it": "Messaggio successivo", "pt": "Próximo email", "ja": "次のメール", "nl": "Volgende mail", "pl": "Następny mail", "ru": "Следующее письмо",
        "sv": "Nästa mail", "da": "Næste mail", "fi": "Seuraava sähköposti", "no": "Neste e-post", "cs": "Další e-mail",
        "el": "Επόμενο μήνυμα", "tr": "Sonraki mail", "hu": "Következő levél", "ro": "Email următor",
        "ko": "다음 메일", "hi": "अगला मेल", "ar": "البريد التالي", "th": "อีเมลถัดไป", "vi": "Email tiếp theo", "id": "Mail berikutnya"
    },
    "Previous mail": {
        "it": "Messaggio precedente", "pt": "Email anterior", "ja": "前のメール", "nl": "Vorige mail", "pl": "Poprzedni mail", "ru": "Предыдущее письмо",
        "sv": "Föregående mail", "da": "Forrige mail", "fi": "Edellinen sähköposti", "no": "Forrige e-post", "cs": "Předchozí e-mail",
        "el": "Προηγούμενο μήνυμα", "tr": "Önceki mail", "hu": "Előző levél", "ro": "Email anterior",
        "ko": "이전 메일", "hi": "पिछला मेल", "ar": "البريد السابق", "th": "อีเมลก่อนหน้า", "vi": "Email trước", "id": "Mail sebelumnya"
    },
    "More Options": {
        "it": "Altre opzioni", "pt": "Mais opções", "ja": "その他のオプション", "nl": "Meer opties", "pl": "Więcej opcji", "ru": "Другие опции",
        "sv": "Fler alternativ", "da": "Flere muligheder", "fi": "Lisää asetuksia", "no": "Flere alternativer", "cs": "Více možností",
        "el": "Περισσότερες επιλογές", "tr": "Daha fazla seçenek", "hu": "További beállítások", "ro": "Mai multe opțiuni",
        "ko": "더 많은 옵션", "hi": "अधिक विकल्प", "ar": "خيارات أخرى", "th": "ตัวเลือกเพิ่มเติม", "vi": "Tùy chọn khác", "id": "Opsi lainnya"
    },
    "With Attachments": {
        "it": "Con allegati", "pt": "Com anexos", "ja": "添付ファイル付き", "nl": "Met bijlagen", "pl": "Z załącznikami", "ru": "С вложениями",
        "sv": "Med bilagor", "da": "Med bilag", "fi": "Liitteillä", "no": "Med vedlegg", "cs": "S přílohami",
        "el": "Με συνημμένα", "tr": "Ekli", "hu": "Mellékletekkel", "ro": "Cu atașamente",
        "ko": "첨부파일 포함", "hi": "संलग्नक के साथ", "ar": "مع المرفقات", "th": "พร้อมไฟล์แนบ", "vi": "Kèm tệp đính kèm", "id": "Dengan lampiran"
    },
    "In favorites": {
        "it": "Nei preferiti", "pt": "Nos favoritos", "ja": "お気に入り", "nl": "In favorieten", "pl": "W ulubionych", "ru": "В избранном",
        "sv": "I favoriter", "da": "I favoritter", "fi": "Suosikeissa", "no": "I favoritter", "cs": "Ve favoritcích",
        "el": "Στα αγαπημένα", "tr": "Favorilerde", "hu": "Kedvencekben", "ro": "La favorite",
        "ko": "즐겨찾기", "hi": "पसंदीदा में", "ar": "في المفضلة", "th": "ในรายการโปรด", "vi": "Trong mục yêu thích", "id": "Di favorit"
    },
    "Unseen only": {
        "it": "Solo non letti", "pt": "Apenas não lidos", "ja": "未読のみ", "nl": "Alleen ongezien", "pl": "Tylko niewidoczne", "ru": "Только невидимые",
        "sv": "Endast osedda", "da": "Kun usete", "fi": "Vain näkymättömät", "no": "Kun usette", "cs": "Pouze neviditelné",
        "el": "Μόνο αόρατα", "tr": "Sadece görünmeyen", "hu": "Csak láthatatlan", "ro": "Doar nevăzute",
        "ko": "안 본 것만", "hi": "केवल अनदेखा", "ar": "غير المرئي فقط", "th": "เห็นเฉพาะที่ไม่เห็น", "vi": "Chỉ chưa xem", "id": "Hanya tak terlihat"
    },
    "Body": {
        "it": "Corpo", "pt": "Corpo", "ja": "本文", "nl": "Lichaam", "pl": "Ciało", "ru": "Тело",
        "sv": "Kropp", "da": "Krop", "fi": "Runko", "no": "Kropp", "cs": "Tělo",
        "el": "Σώμα", "tr": "Gövde", "hu": "Test", "ro": "Corp",
        "ko": "본문", "hi": "शरीर", "ar": "الجسم", "th": "ร่างกาย", "vi": "Cơ thể", "id": "Tubuh"
    },
    "Date from": {
        "it": "Data da", "pt": "Data de", "ja": "日付から", "nl": "Datum van", "pl": "Data od", "ru": "Дата от",
        "sv": "Datum från", "da": "Dato fra", "fi": "Päivämäärä alkaen", "no": "Dato fra", "cs": "Datum od",
        "el": "Ημερομηνία από", "tr": "Tarih itibaren", "hu": "Dátumtól", "ro": "Dată de la",
        "ko": "날짜부터", "hi": "दिनांक से", "ar": "التاريخ من", "th": "วันที่จาก", "vi": "Ngày từ", "id": "Tanggal dari"
    },
    "Date to": {
        "it": "Data a", "pt": "Data até", "ja": "日付まで", "nl": "Datum tot", "pl": "Data do", "ru": "Дата до",
        "sv": "Datum till", "da": "Dato til", "fi": "Päivämäärä asti", "no": "Dato til", "cs": "Datum do",
        "el": "Ημερομηνία έως", "tr": "Tarih kadar", "hu": "Dátumig", "ro": "Dată până la",
        "ko": "날짜까지", "hi": "दिनांक तक", "ar": "التاريخ إلى", "th": "วันที่ถึง", "vi": "Ngày đến", "id": "Tanggal sampai"
    },
    "Others": {
        "it": "Altri", "pt": "Outros", "ja": "その他", "nl": "Andere", "pl": "Inne", "ru": "Другие",
        "sv": "Andra", "da": "Andre", "fi": "Muut", "no": "Andre", "cs": "Jiní",
        "el": "Άλλοι", "tr": "Diğerleri", "hu": "Egyéb", "ro": "Alții",
        "ko": "기타", "hi": "अन्य", "ar": "آخرون", "th": "อื่นๆ", "vi": "Khác", "id": "Lainnya"
    },
    "Search emails": {
        "it": "Cerca email", "pt": "Pesquisar emails", "ja": "メールを検索", "nl": "Zoek e-mails", "pl": "Szukaj e-maili", "ru": "Поиск писем",
        "sv": "Sök e-post", "da": "Søg mails", "fi": "Etsi sähköposteja", "no": "Søk e-post", "cs": "Hledat e-maily",
        "el": "Αναζήτηση emails", "tr": "E-posta ara", "hu": "Levelek keresése", "ro": "Caută emailuri",
        "ko": "이메일 검색", "hi": "ईमेल खोजें", "ar": "البحث في البريد", "th": "ค้นหาอีเมล", "vi": "Tìm kiếm email", "id": "Cari email"
    },
    "In message content": {
        "it": "Nel contenuto del messaggio", "pt": "No conteúdo da mensagem", "ja": "メッセージ本文", "nl": "In berichtinhoud", "pl": "W treści wiadomości", "ru": "В содержании сообщения",
        "sv": "I meddelandeinnehåll", "da": "I meddelelseindhold", "fi": "Viestin sisällössä", "no": "I meldingsinnhold", "cs": "V obsahu zprávy",
        "el": "Στο περιεχόμενο μηνύματος", "tr": "Mesaj içeriğinde", "hu": "Üzenet tartalmában", "ro": "În conținutul mesajului",
        "ko": "메시지 내용", "hi": "संदेश सामग्री में", "ar": "في محتوى الرسالة", "th": "ในเนื้อหาข้อความ", "vi": "Trong nội dung tin nhắn", "id": "Dalam konten pesan"
    },
    "In favorites": {
        "it": "Nei preferiti", "pt": "Nos favoritos", "ja": "お気に入り", "nl": "In favorieten", "pl": "W ulubionych", "ru": "В избранном",
        "sv": "I favoriter", "da": "I favoritter", "fi": "Suosikeissa", "no": "I favoritter", "cs": "Ve favoritcích",
        "el": "Στα αγαπημένα", "tr": "Favorilerde", "hu": "Kedvencekben", "ro": "La favorite",
        "ko": "즐겨찾기", "hi": "पसंदीदा में", "ar": "في المفضلة", "th": "ในรายการโปรด", "vi": "Trong mục yêu thích", "id": "Di favorit"
    },
    "Unseen only": {
        "it": "Solo non letti", "pt": "Apenas não lidos", "ja": "未読のみ", "nl": "Alleen ongezien", "pl": "Tylko niewidoczne", "ru": "Только невидимые",
        "sv": "Endast osedda", "da": "Kun usete", "fi": "Vain näkymättömät", "no": "Kun usette", "cs": "Pouze neviditelné",
        "el": "Μόνο αόρατα", "tr": "Sadece görünmeyen", "hu": "Csak láthatatlan", "ro": "Doar nevăzute",
        "ko": "안 본 것만", "hi": "केवल अनदेखा", "ar": "غير المرئي فقط", "th": "เห็นเฉพาะที่ไม่เห็น", "vi": "Chỉ chưa xem", "id": "Hanya tak terlihat"
    },
}

def translate_string(text, locale):
    """Translate a single English string to target locale."""
    # Check common translations
    if text in COMMON_TRANS and locale in COMMON_TRANS[text]:
        return COMMON_TRANS[text][locale]
    # Return original if no translation found
    return text

def translate_object(obj, locale):
    """Recursively translate all 'string' values in JSON object."""
    if isinstance(obj, dict):
        result = {}
        for key, value in obj.items():
            if key == "string" and isinstance(value, str):
                result[key] = translate_string(value, locale)
            else:
                result[key] = translate_object(value, locale)
        return result
    elif isinstance(obj, list):
        return [translate_object(item, locale) for item in obj]
    else:
        return obj

def main():
    print("=" * 70)
    print(" MASS TRANSLATION - Email Files")
    print("=" * 70)
    print()
    
    total_files = 0
    total_translations = 0
    
    for locale in LOCALES:
        print(f"🌍 Processing locale: {locale}")
        
        for file_rel in EMAIL_FILES:
            en_file = EN_DIR / file_rel
            loc_file = MSG_DIR / locale / file_rel
            
            if not en_file.exists():
                print(f"  ⚠️  English file missing: {file_rel}")
                continue
            
            # Ensure directory exists
            loc_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Load English
            with open(en_file, "r", encoding="utf-8") as f:
                en_data = json.load(f)
            
            # Translate
            loc_data = translate_object(en_data, locale)
            
            # Save
            with open(loc_file, "w", encoding="utf-8") as f:
                json.dump(loc_data, f, ensure_ascii=False, indent=4)
            
            total_files += 1
            print(f"  ✅ {file_rel}")
        
        print()
    
    print("=" * 70)
    print(f"✅ Completed: {total_files} files translated")
    print("=" * 70)

if __name__ == "__main__":
    main()
