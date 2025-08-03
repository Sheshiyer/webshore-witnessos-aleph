# 👁️‍🗨️ Face Reading Engine API Documentation

## 1. Overview

The **Face Reading Engine** analyses facial structure, proportions, micro-features and skin tone to derive constitutional insights rooted in:

* **Traditional Chinese Medicine (TCM)** – five-element physiology, 12 meridian houses, organ health indicators.
* **Vedic/Jyotish Mapping** – lunar mansions & planetary correlations projected onto facial zones.

It returns health guidance, personality patterns and lifestyle recommendations while respecting strict biometric-privacy standards.

---

## 2. Endpoint Specification

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/engines/face_reading/calculate` | Bearer JWT | Execute facial analysis |

### Request Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 3. Input Schema

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `input.birth_date` | string (YYYY-MM-DD) | ✖ | — | Birth date, enables Vedic correlations |
| `input.birth_time` | string (HH:MM) | ✖ | — | Optional exact time |
| `input.birth_location` | string | ✖ | — | Geo location text or `"lat,lon"` |
| `input.image_data` | base64 string | **conditional\*** | — | JPEG/PNG selfie (front-facing, no glasses) |
| `input.video_data` | base64 string | conditional\* | — | Optional 10–30 s video for micro-expressions |
| `input.processing_consent` | boolean | **✔** | — | Explicit biometric-processing consent |
| `input.analysis_depth` | enum `basic | detailed | comprehensive` | ✖ | `detailed` | Metric density & runtime |
| `input.include_health_indicators` | boolean | ✖ | `true` | Append TCM-organ & vitality metrics |
| `input.integrate_with_vedic` | boolean | ✖ | `false` | Map zones to Nakshatras / Grahas |
| `input.integrate_with_tcm` | boolean | ✖ | `true` | Enable 12 houses & organ clock overlay |
| `input.store_biometric_data` | boolean | ✖ | `false` | Persist raw image (off by default) |
| `options.useCache` | boolean | ✖ | `true` | Re-use results for identical hashes |
| `options.userId` | string | ✖ | — | Attach to user history |
| `options.saveProfile` | boolean | ✖ | `false` | Persist analysis to `/readings` |

\* **At least one of** `image_data` or `video_data` **is required**.

---

## 4. Output Schema (Top-level)

```jsonc
{
  "success": true,
  "data": {
    "constitutional_analysis": { ... },
    "twelve_houses_analysis": { ... },
    "five_elements_assessment": { ... },
    "health_indicators": { ... },
    "personality_insights": { ... },
    "integration_recommendations": { ... }
  },
  "timestamp": "2025-08-03T18:22:00Z",
  "processingTime": 945,
  "cached": false,
  "requestId": "req_x7p3ad"
}
```

### 4.1 Constitutional Analysis
```jsonc
{
  "dominant_element": "Wood",
  "secondary_element": "Water",
  "constitutional_type": "Yang-Wood",
  "elemental_balance": { "Wood": 0.38, "Water": 0.27, "Fire": 0.14, "Earth": 0.12, "Metal": 0.09 },
  "constitutional_strength": 0.79
}
```

### 4.2 12 Houses Analysis (TCM)
Key–value map (`House I – XII`) each containing `reading`, `health_indicators`, `personality_traits`, `life_areas`.

### 4.3 Five-Elements Assessment
Element-indexed objects containing `strength`, `characteristics`, `health_correlations`, `recommendations`.

### 4.4 Health Indicators
* `vitality_score` 0–1  
* `stress_indicators` – list  
* `health_recommendations` – list  
* `constitutional_vulnerabilities` – list  
* `strengthening_practices` – list  

### 4.5 Personality Insights
* `core_traits` – list  
* `behavioral_patterns` – list  
* `communication_style` – string  
* `decision_making_style` – string  
* `relationship_patterns` – list  

### 4.6 Integration Recommendations
Optional `vedic_correlations`, `tcm_correlations`, plus `lifestyle_recommendations` & `optimal_practices`.

---

## 5. Privacy & Consent Requirements

1. `processing_consent=true` mandatory – otherwise **HTTP 400** `consent_required`.
2. Raw media discarded unless `store_biometric_data=true`.
3. Data encrypted in transit (TLS1.3) & at rest (AES-256 KV / R2).
4. Users may delete analyses via `DELETE /readings/{id}` (GDPR Art. 17).

---

## 6. Integration Options

| Flag | Effect |
|------|--------|
| `integrate_with_vedic` | Map facial zones to Nakshatra qualities & provide **Graha upāya** guidance. |
| `integrate_with_tcm` | Enable 12-house mapping & organ-clock recommendations. |

When enabled the `integration_recommendations` block contains correlation scores and timing advice.

---

## 7. Example Requests & Responses

### 7.1 Minimal (Basic Depth)
```bash
curl -X POST https://api.witnessos.space/engines/face_reading/calculate \
 -H "Authorization: Bearer $TOKEN" \
 -H "Content-Type: application/json" \
 -d '{
       "input": {
         "image_data": "<BASE64>",
         "processing_consent": true,
         "analysis_depth": "basic"
       }
     }'
```

### 7.2 Comprehensive with Integrations (truncated response)
```jsonc
{
  "success": true,
  "data": {
    "constitutional_analysis": { ... },
    "five_elements_assessment": { ... },
    "integration_recommendations": {
      "vedic_correlations": { "Nakshatra": "Rohini", "planetary_alignment": "Moon" },
      "lifestyle_recommendations": [ "Night-time moon meditation" ]
    }
  },
  "processingTime": 1870
}
```

---

## 8. Error Handling & Validation

| Code | Error | When |
|------|-------|------|
| 400 | `consent_required` | `processing_consent` false/missing |
| 400 | `no_media_supplied` | Neither `image_data` nor `video_data` present |
| 422 | `invalid_analysis_depth` | Wrong enum |
| 413 | `payload_too_large` | Media > 10 MB |
| 429 | `rate_limited` | Plan quota exceeded |
| 500 | `processing_error` | Internal ML/vision failure |

Errors follow the `ErrorResponse` schema.

---

## 9. Data Protection & Biometric Privacy

* **Default retention** – derived metrics only, 30 days (free) / 365 days (pro).  
* **Raw media** – stored only if `store_biometric_data=true`, auto-purged after 7 days.  
* **Access control** – per-user KV namespace keys; only token owner or admin can retrieve.  
* **Compliance** – GDPR (Art. 9 §2 a), CCPA, ISO 27001.  
* **Deletion** – immediate, irreversible KV purge + R2 object delete.

---

## 10. Performance Considerations

| Depth | Avg Latency | Notes |
|-------|------------|-------|
| `basic` | 300-600 ms | Landmark detection + elemental heuristics |
| `detailed` | 700-1200 ms | Adds texture & pigment maps |
| `comprehensive` | 1.5-3 s | Micro-expression detection + fusion models |

GPU acceleration used in Railway container; responses cached (SHA-256 media hash).

---

## 11. Analysis Depth Options

* **basic** – Landmark geometry → elemental snapshot.  
* **detailed** – Adds colour histograms, pore/texture metrics, health mapping.  
* **comprehensive** – Includes micro-expressions, time-series & cross-modal fusion.

---

## 12. Constitutional Analysis & Elemental Assessment

Facial regions correspond to **Wood, Fire, Earth, Metal, Water** zones.  
Relative prominence → dominance scores, generating a **constitutional type** (e.g., *Yang-Wood*).

---

## 13. Health Indicator Correlations

Each of the 12 TCM houses links to organ/meridian:

| House | Zone | Organ | Possible Indicators |
|-------|------|-------|---------------------|
| I | Forehead | **Heart/Small Intestine** | lines ↔ circulation |
| II | Between Brows | **Liver/Gall Bladder** | pigmentation ↔ stagnation |
| … | … | … | … |

Recommendations combine acupressure, nutrition & lifestyle remedies.

---

## 14. Personality Insights & Behavioural Patterns

Facial ratios & micro-muscular tone mapped to:

* **Core Traits** – e.g., visionary, analytical, nurturing.  
* **Behavioural Patterns** – habitual expression clusters.  
* **Communication Style** – directive vs. receptive.  
* **Decision-Making Style** – intuitive vs. logical.  
* **Relationship Patterns** – attachment & boundary tendencies.

---

> **Version:** `1.0.0` &nbsp;·&nbsp; **Last Updated:** 2025-08-03  
> For issues or feedback please email **api@witnessos.space**
