"""
Tüm kullanıcıları ve gönderilerini silen temizlik scripti.
"""
import os
import sys

# Server dizinine geçiş
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, '.')

from app import app, db
from models import (
    User, Conversation, History, Answer, 
    PostLike, AnswerLike, Notification, NotificationRead, 
    NotificationHidden, Snippet, PasswordResetToken, UserFollow
)

def clear_all_users_and_posts():
    with app.app_context():
        print("=" * 50)
        print("Veritabanı Temizleme Başlıyor...")
        print("=" * 50)
        
        # Önce sayıları göster
        user_count = User.query.count()
        conv_count = Conversation.query.count()
        history_count = History.query.count()
        answer_count = Answer.query.count()
        
        print(f"Mevcut Kullanıcı Sayısı: {user_count}")
        print(f"Mevcut Konuşma Sayısı: {conv_count}")
        print(f"Mevcut History (Gönderi) Sayısı: {history_count}")
        print(f"Mevcut Answer (Yorum) Sayısı: {answer_count}")
        print("-" * 50)
        
        try:
            # Sırayla tüm tabloları temizle (foreign key bağımlılıklarına göre)
            
            # 1. Bildirim tabloları
            Notification.query.delete()
            NotificationRead.query.delete()
            NotificationHidden.query.delete()
            print("✓ Bildirimler silindi")
            
            # 2. Like tabloları
            PostLike.query.delete()
            AnswerLike.query.delete()
            print("✓ Beğeniler silindi")
            
            # 3. Answer (yorumlar)
            Answer.query.delete()
            print("✓ Yorumlar silindi")
            
            # 4. History (gönderiler)
            History.query.delete()
            print("✓ Gönderiler silindi")
            
            # 5. Conversation
            Conversation.query.delete()
            print("✓ Konuşmalar silindi")
            
            # 6. Takip ilişkileri
            UserFollow.query.delete()
            print("✓ Takip ilişkileri silindi")
            
            # 7. Snippetlar
            Snippet.query.delete()
            print("✓ Snippetlar silindi")
            
            # 8. Şifre sıfırlama tokenları
            PasswordResetToken.query.delete()
            print("✓ Şifre sıfırlama tokenları silindi")
            
            # 9. Kullanıcılar
            User.query.delete()
            print("✓ Kullanıcılar silindi")
            
            db.session.commit()
            print("=" * 50)
            print("TÜM VERİLER BAŞARIYLA SİLİNDİ!")
            print("=" * 50)
            
        except Exception as e:
            db.session.rollback()
            print(f"HATA: {e}")
            raise

if __name__ == "__main__":
    clear_all_users_and_posts()
