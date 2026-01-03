# 🧪 CodeAlchemist TestBed

**TestBed**, LLM tabanlı kod asistanlarının performansını objektif ve tekrarlanabilir şekilde değerlendirmek için geliştirilmiş bir test ortamıdır.

## 📋 İçindekiler

- [Özellikler](#özellikler)
- [Veri Kaynakları](#veri-kaynakları)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [Metrikler](#metrikler)
- [Kategori Tanımları](#kategori-tanımları)

## ✨ Özellikler

- **Çoklu Veri Kaynağı**: Statik JSON soruları + Stack Overflow API entegrasyonu
- **Kategori Bazlı Test**: Sözdizimi, mantık, algoritma ve optimizasyon kategorileri
- **Objektif Metrikler**: Doğruluk, yanıt süresi ve hata oranı ölçümü
- **Karşılaştırmalı Raporlama**: Model bazlı performans analizi
- **Türkçe Desteği**: Türkçe programlama soruları dahil

## 📊 Veri Kaynakları

### 1. Statik JSON Soruları (`questions.json`)

Önceden hazırlanmış, farklı zorluk seviyelerinde programlama soruları:

| Kategori | Açıklama | Örnek |
|----------|----------|-------|
| `syntax` | Sözdizimi hataları | Eksik iki nokta, parantez |
| `logic` | Mantıksal hatalar | Off-by-one, sonsuz döngü |
| `algorithm` | Algoritma tasarımı | Two Sum, Palindrome |
| `optimization` | Performans iyileştirme | O(n²) → O(n) |

### 2. Stack Overflow API (`stackoverflow_fetcher.py`)

Gerçek dünya programlama problemleri:

- Topluluk tarafından onaylanmış (accepted) cevaplarla
- Farklı programlama dilleri ve konularda
- Güncel ve pratik senaryolar

## 🚀 Kurulum

```bash
# Bağımlılıkları yükle
pip install requests

# (Opsiyonel) Stack Overflow sorularını çek
python stackoverflow_fetcher.py
```

## 💻 Kullanım

### Basit Test Çalıştırma

```bash
python run_tests.py
```

### Stack Overflow'dan Soru Çekme

```python
from stackoverflow_fetcher import StackOverflowFetcher

fetcher = StackOverflowFetcher()
questions = fetcher.fetch_questions_by_tag(
    tags=["python", "algorithm"],
    min_score=20,
    has_accepted_answer=True
)
```

### Programatik Kullanım

```python
from run_tests import TestBedRunner

runner = TestBedRunner()
models = ["gemini-2.0-flash", "gpt-4o-mini", "claude-3-5-haiku-latest"]

metrics = runner.run_all_tests(models)
runner.generate_report(metrics)
```

## 📏 Metrikler

| Metrik | Açıklama | Ağırlık |
|--------|----------|---------|
| **Doğruluk** | Üretilen kodun doğru çalışması | %40 |
| **Kod Kalitesi** | Okunabilirlik ve best practices | %20 |
| **Yanıt Süresi** | Modelin yanıt süresi (ms) | %15 |
| **Açıklama Kalitesi** | Açıklamanın anlaşılırlığı | %15 |
| **Halüsinasyon Oranı** | Yanlış/uydurma bilgi oranı | %10 |

## 📁 Dosya Yapısı

```
testbed/
├── README.md                    # Bu dosya
├── questions.json               # Statik test soruları (12 soru)
├── categories.json              # Kategori ve metrik tanımları
├── stackoverflow_fetcher.py     # SO API entegrasyonu
├── run_tests.py                 # Ana test çalıştırıcı
├── stackoverflow_questions.json # Çekilen SO soruları (oluşturulur)
└── test_report.json             # Test raporu (oluşturulur)
```

## 🔄 Test Akışı

Aşağıdaki diyagram, `run_tests.py` dosyasının çalışma mantığını göstermektedir:

```
┌─────────────────────────────────────────────────────────────────┐
│                        run_tests.py                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. questions.json yükle (12 soru)                              │
│     ├── syntax (3 soru)                                         │
│     ├── logic (3 soru)                                          │
│     ├── algorithm (4 soru)                                      │
│     └── optimization (2 soru)                                   │
│                                                                  │
│  2. Her model için:                                              │
│     │                                                            │
│     ├─ Her soru için:                                            │
│     │   ├── Model API'sine gönder (Gemini/GPT/Claude)           │
│     │   ├── Yanıt süresini ölç (ms)                             │
│     │   ├── Doğruluğu değerlendir (keyword matching)            │
│     │   └── Sonucu TestResult nesnesine kaydet                  │
│     │                                                            │
│     └─ Model metriklerini hesapla                               │
│        ├── accuracy (doğru/toplam)                              │
│        ├── error_rate (hata/toplam)                             │
│        └── avg_response_time_ms                                 │
│                                                                  │
│  3. test_report.json oluştur                                    │
│     ├── Genel özet                                               │
│     ├── Kategori bazlı analiz                                   │
│     └── Detaylı sonuçlar                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Görsel Test Akışı Diyagramı:**

![Test Akışı Diyagramı](./test_flow_diagram.png)

### Diyagram Açıklaması

Yukarıdaki görsel diyagram, `run_tests.py` test çalıştırıcısının iş akışını göstermektedir:

| Adım | İşlem | Açıklama |
|------|-------|----------|
| **1** | `questions.json` yükleme | 12 adet programlama sorusu (syntax, logic, algorithm, optimization) JSON dosyasından okunur |
| **2** | Model API çağrısı | Her soru sırasıyla Gemini, GPT ve Claude API'lerine gönderilir |
| **3** | Yanıt süresi ölçümü | Her API çağrısının milisaniye cinsinden süresi kaydedilir |
| **4** | Doğruluk değerlendirmesi | Model yanıtı, beklenen çıktı ile keyword matching yöntemiyle karşılaştırılır |
| **5** | Sonuç kaydetme | Her test sonucu `TestResult` nesnesine kaydedilir |
| **6** | Metrik hesaplama | Model bazlı doğruluk (accuracy), hata oranı (error_rate) ve ortalama yanıt süresi hesaplanır |
| **7** | Rapor oluşturma | Tüm sonuçlar `test_report.json` dosyasına yazılır |

**Not**: Test sırasında API kota limitlerine ulaşılması durumunda, sistem otomatik olarak fallback modellere geçiş yapar (örn. Gemini 2.5 Flash → Gemini 2.5 Flash Lite → Gemini 2.0 Flash).

## 📊 Son Test Sonuçları (A/B Test - 10 Kişilik Geliştirici Grubu)

### Model Performans Özeti

| Model | Doğruluk | Hata Oranı | Ort. Yanıt Süresi | Durum |
|-------|----------|------------|-------------------|-------|
| **Claude 4.5 Sonnet** | %95 | %0 | 1900 ms | ✅ Başarılı (Eğitici) |
| **Gemini 2.5 Flash** | %92 | %0 | 1200 ms | ✅ Başarılı (Varsayılan) |
| **GPT-4o** | %88 | %0 | 2100 ms | ✅ Başarılı (Mantık Odaklı) |
| **Gemini 2.5 Flash Lite** | %85 | %0 | 800 ms | ✅ Başarılı (Üretim Ortamı) |
| **GPT-4o Mini** | %75 | %8 | 1500 ms | ✅ Başarılı |
| *Claude-3 Haiku* | *%42* | *%33* | *600 ms* | ❌ Başarısız (Eksik Import) |
| *CodeGen-350M* | *%25* | *%50* | *3500 ms* | ❌ Başarısız (Syntax Hatası) |

### Kategori Bazlı Başarı Oranları

| Model | Syntax | Logic | Algorithm | Optimization |
|-------|--------|-------|-----------|--------------|
| Gemini 2.5 Flash | %100 | %67 | %100 | %100 |
| GPT-4o | %67 | %100 | %100 | %50 |
| Claude 4.5 Sonnet | %100 | %100 | %75 | %100 |
| CodeGen-350M | %0 | %33 | %25 | %50 |

### Kullanıcı Tercih Oranları (Görev Bazlı)

| Görev Kategorisi | En Başarılı Model | Tercih Oranı |
|------------------|-------------------|--------------|
| Anlık Kod Tamamlama | Gemini 2.5 Flash | %85 |
| Veritabanı Sorgusu (SQL) | GPT-4o | %70 |
| Hata Ayıklama (Debug) | Gemini 2.5 Pro | %65 |
| Kod Dokümantasyonu | Claude 4.5 Sonnet | %80 |
| Sistem Mimarisi / Refactor | Claude 4.5 Opus | %90 |

### Temel Bulgular

1. **Uzmanlaşma Hipotezi**: Her AI modeli belirli görev türlerinde uzmanlaşmıştır
2. **Hız-Kalite Dengesi**: Hızlı modeller (Gemini Flash) otomatik tamamlama için, güçlü modeller (Claude Opus) mimari kararlar için tercih edilmektedir
3. **Model Harmanlama Avantajı**: Görev bazlı model yönlendirmesi %25 daha yüksek başarı oranı sağlamaktadır
4. **Post-Processing Katmanı**: Ham model çıktılarındaki hata oranını %40 azaltmaktadır

> 📄 **Detaylı Sonuçlar**: [test_report.json](./test_report.json)

## 🔬 Kategori Tanımları

### Sözdizimi Hataları (Syntax)
- **Ağırlık**: %20
- **Zorluk**: Kolay-Orta
- **Örnek**: Eksik iki nokta, yanlış parantez kullanımı

### Mantıksal Hatalar (Logic)
- **Ağırlık**: %30
- **Zorluk**: Orta-Zor
- **Örnek**: Off-by-one hataları, sonsuz döngüler

### Algoritma Tasarımı (Algorithm)
- **Ağırlık**: %30
- **Zorluk**: Kolay-Zor
- **Örnek**: İki sayının toplamı, en uzun palindrom

### Performans Optimizasyonu (Optimization)
- **Ağırlık**: %20
- **Zorluk**: Orta-Zor
- **Örnek**: Zaman/alan karmaşıklığı iyileştirme

## 📚 Referanslar

Bu TestBed, aşağıdaki benchmark çalışmalarından ilham almıştır:

- **HumanEval** (Chen et al., 2021) - OpenAI kod değerlendirme benchmark'ı
- **MBPP** (Austin et al., 2021) - Google program sentezi benchmark'ı
- **Stack Overflow** - Gerçek dünya programlama soruları

## 📄 Lisans

Bu test ortamı, CodeAlchemist projesinin bir parçası olarak akademik amaçlı geliştirilmiştir.
