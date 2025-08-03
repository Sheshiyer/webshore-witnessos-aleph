# 🕰️ VedicClock-TCM Engine API Documentation

## 1. Overview

The **VedicClock-TCM Engine** is a multi-dimensional consciousness-optimization engine that **synchronises Vedic time cycles** (Panchanga, Nakshatras, Dashas, Planetary Hours) with **Traditional Chinese Medicine (TCM) organ rhythms** (24-hour organ clock & Five-Element theory).  
By blending these two temporal wisdom systems the engine produces:

* **Chrono-biological schedules** for health, productivity and spiritual practice  
* **Constitutional analysis** mapping Doshas ↔ Five Elements ↔ Organ vitality  
* **Dynamic recommendations** for meditation, diet, exercise, business, relationships  
* **Forecast timelines** highlighting auspicious / caution periods

---

## 2. Endpoint Specification

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/engines/vedicclock_tcm/calculate` | Bearer JWT | Execute VedicClock-TCM analysis |

### Request Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 3. Input Schema

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `input.birth_date` | string (YYYY-MM-DD) | ✔ | — | Date of birth |
| `input.birth_time` | string (HH:MM) | ✔ | — | Local time (24-hr) |
| `input.birth_location` | `[lat, lon]` | ✔ | — | Decimal degrees |
| `input.timezone` | string | ✔ | — | IANA TZ, e.g. `Asia/Kolkata` |
| `input.target_date` | string (YYYY-MM-DD) | ✖ | today | Date for which to compute organ clock & Panchanga |
| `input.days_ahead` | integer | ✖ | `7` | Forecast window (1-30) |
| `input.dasha_depth` | enum `mahadasha \| antardasha \| pratyantardasha` | ✖ | `antardasha` | Vimshottari detail depth |
| `input.include_five_elements` | boolean | ✖ | `true` | Return element balances |
| `input.include_organ_clock` | boolean | ✖ | `true` | Include 24-h organ timeline |
| `input.include_panchanga` | boolean | ✖ | `true` | Tithi, Nakshatra, Karana, Yoga |
| `input.include_personal_cycles` | boolean | ✖ | `true` | Personal lunar day & hora table |
| `input.optimization_focus` | enum `health \| career \| relationships \| spiritual` | ✖ | `spiritual` | Tailor recommendations |
| `options.useCache` | boolean | ✖ | `true` | KV-cache reuse |
| `options.userId` | string | ✖ | — | Attach result to user |
| `options.saveProfile` | boolean | ✖ | `false` | Persist to reading history |

---

## 4. Output Schema (top-level)

```jsonc
{
  "success": true,
  "data": {
    "vedic": { /* Panchanga, Nakshatras, Dashas */ },
    "tcm": { /* Organ clock, Five elements */ },
    "constitution": { /* Dosha + Element analysis */ },
    "optimization": { /* Timing & practice advice */ },
    "timeline": [ /* Day-by-day forecast */ ]
  },
  "timestamp": "2025-08-03T18:45:00Z",
  "processingTime": 640,
  "cached": false,
  "requestId": "req_9q4mx"
}
```

### 4.1 Vedic Component

| Key | Description |
|-----|-------------|
| `panchanga` | `tithi`, `nakshatra`, `yoga`, `karana`, `vara` for `target_date` |
| `nakshatra_lord` | Planet ruling current lunar mansion |
| `mahadasha` / `antardasha` / `pratyantardasha` | Current Vimshottari periods |
| `planetary_hours` | 24-hour list of `hora` rulers |
| `auspicious_windows` | ISO ranges for `abhijit` & personal good horas |

### 4.2 TCM Component

| Key | Description |
|-----|-------------|
| `organ_clock` | Array of 24 entries (`organ`, `start`, `end`, `element`) |
| `five_elements_balance` | Percentage distribution `Wood-Fire-Earth-Metal-Water` |
| `peak_organs` | Organs in high vitality for `target_date` |
| `vulnerability_organs` | Organs needing attention |

### 4.3 Constitution

Blended analysis:

```json
{
  "dosha_profile": "Pitta-Kapha",
  "elemental_dominance": { "Fire": 0.34, "Earth": 0.28, "Air": 0.18, "Water": 0.14, "Ether": 0.06 },
  "organ_strength": { "Liver": 0.82, "Heart": 0.76, "Kidney": 0.52 },
  "constitutional_score": 0.78
}
```

### 4.4 Optimization

* `optimal_practices` – ordered list (e.g., *7-9 am Pranayama, 11-1 pm business meetings*)  
* `dietary_guidance` – foods by element & current dasha  
* `timing_recommendations` – JSON of `activity → best_time_range`  
* `caution_periods` – ISO ranges with lower energy / conflicting cycles

### 4.5 Timeline (array length `days_ahead`)

Each day object:

```jsonc
{
  "date": "2025-08-04",
  "peak_organ": "Lungs",
  "tithi": "Shukla Tritiya",
  "nakshatra": "Rohini",
  "favourability": 0.87,
  "recommended_focus": "Networking & breath-work"
}
```

---

## 5. Integration Options & Multi-Modal Analysis

| Flag | Effect |
|------|--------|
| `include_panchanga` | Merge daily lunar parameters with organ vitality |
| `include_personal_cycles` | Adds personalised planetary hours & lunar day analysis |
| `include_five_elements` | Returns unified element balance & remedies |
| `optimization_focus` | Weights recommendations (e.g., `career` boosts business horas) |

---

## 6. Example Requests & Responses

### 6.1 Basic (Spiritual Focus, 7-day)

```bash
curl -X POST https://api.witnessos.space/engines/vedicclock_tcm/calculate \
 -H "Authorization: Bearer $TOKEN" \
 -H "Content-Type: application/json" \
 -d '{
       "input": {
         "birth_date": "1992-12-10",
         "birth_time": "06:45",
         "birth_location": [28.6139, 77.2090],
         "timezone": "Asia/Kolkata"
       }
     }'
```

### 6.2 Advanced (Career Focus, 30-day, Full Detail)

```bash
curl -X POST https://api.witnessos.space/engines/vedicclock_tcm/calculate \
 -H "Authorization: Bearer $TOKEN" \
 -H "Content-Type: application/json" \
 -d '{
       "input": {
         "birth_date": "1985-05-21",
         "birth_time": "14:22",
         "birth_location": [40.7128, -74.0060],
         "timezone": "America/New_York",
         "target_date": "2025-09-01",
         "days_ahead": 30,
         "dasha_depth": "mahadasha",
         "optimization_focus": "career",
         "include_personal_cycles": true
       },
       "options": { "saveProfile": true }
     }'
```

**Truncated Response Highlights**

```jsonc
{
  "data": {
    "optimization": {
      "optimal_practices": [
        "07:00-09:00 – Strategic planning (Kapha-Earth stability)",
        "11:00-13:00 – Deal negotiations (Pitta-Fire clarity)"
      ],
      "timing_recommendations": {
        "important_meetings": "2025-09-03T11:15/13:00",
        "deep_work": "2025-09-05T05:00/07:30"
      }
    }
  }
}
```

---

## 7. Error Handling & Validation

| Code | Error | Description |
|------|-------|-------------|
| 400 | `invalid_birth_data` | Missing/incorrect date, time or location |
| 400 | `days_ahead_out_of_range` | Must be 1-30 |
| 422 | `invalid_timezone` | IANA TZ not recognised |
| 429 | `rate_limited` | Quota exceeded |
| 500 | `calculation_failure` | Swiss Ephemeris / organ-clock kernel error |

All errors comply with the global `ErrorResponse` schema.

---

## 8. Performance Considerations

| Factor | Avg. Latency |
|--------|--------------|
| **7-day, antardasha** | 400-700 ms |
| **30-day, mahadasha** | 1.2-2.0 s |
| **+personal_cycles** | +120 ms |
| **Cache hit** | <100 ms |

Optimised via KV-cache keyed on SHA-256 of input JSON.

---

## 9. Timing Optimisation Recommendations

* **Brahma Muhurta** (96 min before sunrise) – universal meditation window  
* **Organ-Peak Windows** – schedule related activities (e.g., *Heart 11-13 h → social connection*)  
* **Planetary Hours** – align business or creative tasks with benefic horas (Jupiter, Venus)  
* **Daily Panchanga** – avoid important launches on `Krishna Chaturdashi`, favour `Shukla Dashami` etc.

---

## 10. Constitutional Analysis (Vedic + TCM)

The engine cross-maps:

| Vedic Dosha | Predominant Elements | TCM Elements/Organs |
|-------------|---------------------|---------------------|
| Vata | Air + Ether | Metal (Lungs), Water (Kidneys) |
| Pitta | Fire + Water | Wood (Liver), Fire (Heart) |
| Kapha | Earth + Water | Earth (Spleen), Water (Kidneys) |

Scores are normalised 0-1 and merged into the `constitutional_score`.

---

## 11. Consciousness Timing Recommendations

* **Meditation** – Sunrise + Brahma Muhurta + personal `Ishta Devata` hora  
* **Study / Deep Work** – *Sattvic* hours (Moon hora, pre-dawn)  
* **Physical Exercise** – Kapha hours (07-09 h) favour strength building  
* **Detox / Fasting** – Waning Moon + Large Intestine hour (05-07 h)  
* **Relationship Dialogues** – Venus hora or `Shukra vara` (Friday)  

---

## 12. Usage Examples by Life Area

| Life Area | Recommended Input Settings | Expected Insights |
|-----------|---------------------------|-------------------|
| **Health** | `optimization_focus="health"`, `include_five_elements=true` | Organ vitality forecast, diet & herbal suggestions |
| **Career** | `optimization_focus="career"`, `days_ahead=30`, `dasha_depth="mahadasha"` | Auspicious launch windows, negotiation hours |
| **Relationships** | `optimization_focus="relationships"`, `include_personal_cycles=true` | Best communication times, empathy boosters |
| **Spiritual Practice** | default (spiritual) | Strong meditation & mantra timings, eclipse alerts |

---

> **Version:** `1.0.0`   ·   **Last Updated:** 2025-08-03   ·   **Contact:** api@witnessos.space
