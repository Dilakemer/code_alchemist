"""
Stack Overflow API Entegrasyonu
CodeAlchemist TestBed - Dinamik Soru Çekme Modülü

Bu modül, Stack Overflow API'sinden gerçek dünya programlama
sorularını çekerek TestBed veri setini zenginleştirir.
"""

import requests
import json
import time
from datetime import datetime
from typing import List, Dict, Optional


class StackOverflowFetcher:
    """Stack Overflow API üzerinden programlama sorularını çeker."""
    
    BASE_URL = "https://api.stackexchange.com/2.3"
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Args:
            api_key: Stack Overflow API anahtarı (opsiyonel, rate limit artırır)
        """
        self.api_key = api_key
        self.session = requests.Session()
        
    def _make_request(self, endpoint: str, params: Dict) -> Dict:
        """API isteği yapar ve sonucu döndürür."""
        params["site"] = "stackoverflow"
        if self.api_key:
            params["key"] = self.api_key
            
        url = f"{self.BASE_URL}/{endpoint}"
        response = self.session.get(url, params=params)
        response.raise_for_status()
        
        return response.json()
    
    def fetch_questions_by_tag(
        self,
        tags: List[str],
        min_score: int = 10,
        has_accepted_answer: bool = True,
        page_size: int = 20,
        max_pages: int = 5
    ) -> List[Dict]:
        """
        Belirli etiketlere sahip soruları çeker.
        
        Args:
            tags: Aranacak etiketler (örn: ["python", "algorithm"])
            min_score: Minimum soru puanı
            has_accepted_answer: Sadece kabul edilmiş cevabı olanlar
            page_size: Sayfa başına sonuç sayısı
            max_pages: Maksimum sayfa sayısı
            
        Returns:
            Soru listesi
        """
        questions = []
        
        for page in range(1, max_pages + 1):
            params = {
                "order": "desc",
                "sort": "votes",
                "tagged": ";".join(tags),
                "filter": "withbody",
                "pagesize": page_size,
                "page": page,
                "min": min_score
            }
            
            if has_accepted_answer:
                params["accepted"] = "True"
            
            try:
                result = self._make_request("questions", params)
                items = result.get("items", [])
                
                for item in items:
                    question = self._parse_question(item)
                    if question:
                        questions.append(question)
                
                # Rate limiting için bekle
                if result.get("quota_remaining", 0) < 10:
                    print("API quota düşük, bekleniyor...")
                    time.sleep(60)
                    
                if not result.get("has_more", False):
                    break
                    
                time.sleep(0.5)  # Rate limiting
                
            except requests.exceptions.RequestException as e:
                print(f"API hatası: {e}")
                break
                
        return questions
    
    def _parse_question(self, item: Dict) -> Optional[Dict]:
        """API yanıtından soru nesnesini oluşturur."""
        try:
            return {
                "source": "stackoverflow",
                "source_id": item["question_id"],
                "source_url": item["link"],
                "title": item["title"],
                "body": item.get("body", ""),
                "tags": item.get("tags", []),
                "score": item.get("score", 0),
                "view_count": item.get("view_count", 0),
                "answer_count": item.get("answer_count", 0),
                "is_answered": item.get("is_answered", False),
                "accepted_answer_id": item.get("accepted_answer_id"),
                "creation_date": datetime.fromtimestamp(
                    item.get("creation_date", 0)
                ).isoformat(),
                "fetched_at": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Soru parse hatası: {e}")
            return None
    
    def fetch_answer(self, answer_id: int) -> Optional[Dict]:
        """Belirli bir cevabı çeker."""
        params = {
            "filter": "withbody",
            "order": "desc",
            "sort": "votes"
        }
        
        try:
            result = self._make_request(f"answers/{answer_id}", params)
            items = result.get("items", [])
            
            if items:
                item = items[0]
                return {
                    "answer_id": item["answer_id"],
                    "body": item.get("body", ""),
                    "score": item.get("score", 0),
                    "is_accepted": item.get("is_accepted", False),
                    "creation_date": datetime.fromtimestamp(
                        item.get("creation_date", 0)
                    ).isoformat()
                }
        except Exception as e:
            print(f"Cevap çekme hatası: {e}")
            
        return None
    
    def fetch_questions_with_answers(
        self,
        tags: List[str],
        count: int = 50
    ) -> List[Dict]:
        """
        Soruları kabul edilmiş cevaplarıyla birlikte çeker.
        
        Args:
            tags: Aranacak etiketler
            count: Çekilecek soru sayısı
            
        Returns:
            Soru ve cevap çiftleri
        """
        questions = self.fetch_questions_by_tag(
            tags=tags,
            has_accepted_answer=True,
            page_size=min(count, 100),
            max_pages=(count // 20) + 1
        )[:count]
        
        for question in questions:
            if question.get("accepted_answer_id"):
                answer = self.fetch_answer(question["accepted_answer_id"])
                question["accepted_answer"] = answer
                time.sleep(0.5)  # Rate limiting
                
        return questions
    
    def save_to_json(self, questions: List[Dict], filepath: str):
        """Soruları JSON dosyasına kaydeder."""
        output = {
            "source": "Stack Overflow API",
            "fetched_at": datetime.now().isoformat(),
            "count": len(questions),
            "questions": questions
        }
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
            
        print(f"{len(questions)} soru '{filepath}' dosyasına kaydedildi.")


def fetch_programming_questions():
    """Farklı programlama konularından sorular çeker."""
    fetcher = StackOverflowFetcher()
    
    # Farklı kategorilerde sorular çek
    categories = {
        "python_algorithm": ["python", "algorithm"],
        "python_debugging": ["python", "debugging"],
        "javascript_async": ["javascript", "async-await"],
        "javascript_react": ["javascript", "reactjs"],
        "sql_optimization": ["sql", "query-optimization"],
        "data_structures": ["data-structures", "algorithm"]
    }
    
    all_questions = []
    
    for category, tags in categories.items():
        print(f"\n'{category}' kategorisi için sorular çekiliyor...")
        questions = fetcher.fetch_questions_with_answers(tags, count=10)
        
        for q in questions:
            q["category"] = category
            
        all_questions.extend(questions)
        print(f"  {len(questions)} soru çekildi.")
        time.sleep(2)  # Kategoriler arası bekleme
    
    # Sonuçları kaydet
    fetcher.save_to_json(
        all_questions,
        "stackoverflow_questions.json"
    )
    
    return all_questions


if __name__ == "__main__":
    print("Stack Overflow'dan programlama soruları çekiliyor...")
    print("=" * 50)
    
    questions = fetch_programming_questions()
    
    print("\n" + "=" * 50)
    print(f"Toplam {len(questions)} soru çekildi ve kaydedildi.")
    print("\nKategori dağılımı:")
    
    from collections import Counter
    categories = Counter(q["category"] for q in questions)
    for cat, count in categories.items():
        print(f"  {cat}: {count}")
