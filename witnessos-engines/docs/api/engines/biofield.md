# 🌀 Biofield Engine API Documentation

## 1. Overview

The **Biofield Engine** performs advanced energetic-field analysis of images or video streams.  
It extracts spatial, temporal, colour, and composite metrics, producing actionable insights and recommendations.  
Key capabilities:

* Real-time or batch analysis of bio-energetic emissions  
* Fractal and non-linear dynamics estimation (entropy, Lyapunov, DFA, etc.)  
* Colour spectrum coherence and vital energy mapping  
* Multi-modal integration with Face Reading, Vedic Panchanga, and TCM Organ Clock  
* Automatic calibration, noise reduction, and quality scoring  

---

## 2. Endpoint Specification

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST   | `/engines/biofield/calculate` | Bearer JWT | Execute biofield analysis |

### Request Headers

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 3. Input Schema

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `input.birth_date` | string (YYYY-MM-DD) | ✖ | — | User birth date (for temporal correlations) |
| `input.image_data` | base64 string | conditional* | — | Single frame to analyse |
| `input.video_data` | base64 string | conditional* | — | Video for temporal analysis |
| `input.analysis_mode` | enum `single_frame \| temporal_sequence \| real_time` | ✖ | `single_frame` | Analysis workflow |
| `input.analysis_depth` | enum `basic \| detailed \| comprehensive` | ✖ | `detailed` | Metric density |
| `input.include_spatial_metrics` | boolean | ✖ | `true` | Physical geometry metrics |
| `input.include_temporal_metrics` | boolean | ✖ | `false` | Time-series metrics (video/real-time) |
| `input.include_color_analysis` | boolean | ✖ | `true` | Colour-spectrum metrics |
| `input.include_composite_scores` | boolean | ✖ | `true` | Aggregated indices |
| `input.integrate_with_face_reading` | boolean | ✖ | `false` | Merge with facial landmarks & constitutions |
| `input.integrate_with_vedic` | boolean | ✖ | `false` | Overlay Panchanga & cosmic timing |
| `input.integrate_with_tcm` | boolean | ✖ | `false` | Overlay TCM organ clock phases |
| `input.noise_reduction` | boolean | ✖ | `true` | Gaussian / wavelet filtering |
| `input.edge_enhancement` | boolean | ✖ | `true` | Sobel/LoG edge boost |
| `input.calibration_mode` | enum `auto \| manual \| reference` | ✖ | `auto` | Illumination & distance calibration |
| `input.biometric_consent` | boolean | **✔** | — | Explicit user consent for biometric processing |
| `input.store_analysis_only` | boolean | ✖ | `true` | Discard raw biometrics after processing |
| `options.useCache` | boolean | ✖ | `true` | KV-cache reuse |
| `options.userId` | string | ✖ | — | Associate result with user |
| `options.saveProfile` | boolean | ✖ | `false` | Persist to user history |

\* **At least one of** `image_data` or `video_data` **is required**.  

---

## 4. Output Schema (truncated for brevity)

```json
{
  "success": true,
  "data": {
    "biofield_metrics": { /* spatial metrics */ },
    "color_analysis":   { /* colour metrics */ },
    "composite_scores": { /* aggregate indices */ },
    "multi_modal_integration": { /* cross-domain correlations */ },
    "image_quality_score": 0.93,
    "processing_time": 1875,
    "calibration_status": "auto_success",
    "temporal_trends": { "energy": [ ... ] },
    "stability_assessment": 0.82,
    "biofield_optimization": [ "Alternate nostril breathing" ],
    "practice_suggestions": [ "Morning sun gazing" ],
    "data_retention_policy": "analysis_only",
    "biometric_protection_level": "encrypted_in_transit"
  },
  "timestamp": "2025-08-03T18:12:45Z",
  "processingTime": 1875,
  "cached": false,
  "requestId": "req_123abc"
}
```

### 4.1 Metric Groups

* **Spatial Metrics** – fractal dimension, body symmetry, pattern regularity, etc.  
* **Temporal Metrics** – recurrence, DFA, entropy flow, bifurcation analysis.  
* **Colour Analysis** – distribution histogram, coherence, dominant wavelength.  
* **Composite Scores** – energy, symmetry balance, coherence, complexity, regulation.  
* **Multi-Modal Integration** – correlations with Face, Vedic Panchanga, TCM organs.

---

## 5. Privacy & Consent

1. `biometric_consent=true` is mandatory—requests without it are rejected (`HTTP 400`).
2. Raw images/videos are **never stored** unless `store_analysis_only=false`.
3. All data is encrypted in transit (HTTPS) and at rest (KV-AES-256).
4. Users may request deletion via `/readings/{id}` `DELETE`.

---

## 6. Integration Options

| Flag | Description |
|------|-------------|
| `integrate_with_face_reading` | Align energetic hotspots with facial constitutional zones |
| `integrate_with_vedic` | Map biofield peaks to lunar day qualities & planetary hours |
| `integrate_with_tcm` | Compare electromagnetic peaks to TCM organ clock meridians |

If enabled, the `multi_modal_integration` block returns correlation coefficients and themed recommendations.

---

## 7. Example Requests & Responses

### 7.1 Single Frame (Basic)

```bash
curl -X POST https://api.witnessos.space/engines/biofield/calculate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "input": {
          "birth_date": "1992-03-05",
          "image_data": "<BASE64>",
          "analysis_mode": "single_frame",
          "biometric_consent": true
        }
      }'
```

### 7.2 Temporal Sequence (Video)

```bash
# video_data shortened for clarity
{
  "input": {
    "video_data": "<BASE64_MP4>",
    "analysis_mode": "temporal_sequence",
    "analysis_depth": "comprehensive",
    "include_temporal_metrics": true,
    "biometric_consent": true,
    "integrate_with_vedic": true
  }
}
```

### 7.3 Real-Time (WebSocket handshake pseudo)

```
wss://api.witnessos.space/engines/biofield/stream?token=JWT
```

---

## 8. Error Handling & Validation

| Code | Message | Cause |
|------|---------|-------|
| 400  | `biometric_consent_required` | consent flag missing |
| 400  | `no_media_supplied` | image_data & video_data absent |
| 413  | `payload_too_large` | >15 MB after base64 |
| 422  | `invalid_analysis_mode` | unsupported enum value |
| 429  | `rate_limited` | too many concurrent analyses |

Errors conform to the `ErrorResponse` schema defined in the OpenAPI spec.

---

## 9. Data Retention & Privacy Policy

* **Retention**: Default stores only derived metrics; raw media discarded immediately.  
* **Storage Duration**: Metrics retained 30 days (free tier) or 365 days (pro).  
* **Opt-Out**: Set `store_analysis_only=false` to retain images for future comparison.  
* **Compliance**: GDPR, CCPA, and PCI-DSS (no card data but infra compliant).

---

## 10. Performance Considerations

| Mode | Avg. Latency | Notes |
|------|--------------|-------|
| `single_frame` | 500-1500 ms | depends on resolution |
| `temporal_sequence` | 1-4 s | 5-15 s videos recommended |
| `real_time` | ≤250 ms / frame | WebSocket stream, GPU-accelerated |

Cache hit ratio ~85 % for repeated frames with identical hashes.

---

## 11. Usage Examples by Mode

* **single_frame** – Quick aura snapshot for onboarding.  
* **temporal_sequence** – 30-second meditation session analysis.  
* **real_time** – Continuous biofeedback during breath-work (requires WebSocket).

---

## 12. Metric Explanations

| Metric | Description |
|--------|-------------|
| `light_quanta_density` | Photon-capture estimate per cm² |
| `entropy_form_coefficient` | Spatial entropy vs ideal harmonic field |
| `hurst_exponent` | Long-range dependence of emission intensity |
| `dfa_analysis` | Detrended fluctuation for complexity |
| `fractal_dimension` | Self-similarity measure (0-3) |
| `lyapunov_exponent` | Sensitivity to initial conditions (chaos) |
| `color_coherence` | Phase alignment across RGB spectrum |
| _etc._ | Refer to output schema for full list |

---

## 13. Multi-Modal Integration

When any `integrate_with_*` flag is true the engine:

1. Retrieves correlated data (facial landmarks / Panchanga / TCM).
2. Produces **correlation coefficients** (0-1).  
3. Generates **unified_recommendations** list ordered by impact.

---

## 14. Calibration & Quality Assessment

* **Calibration Modes**  
  * `auto` – automatic distance, illumination, white-balance detection.  
  * `manual` – user supplies calibration JSON (see docs).  
  * `reference` – reference card detection inside frame.

* **Quality Scores**  
  * `image_quality_score` (0-1) – clarity & illumination.  
  * `calibration_status` – `auto_success`, `manual_loaded`, `needs_review`.

Low quality (<0.6) returns warning in `practice_suggestions`.

---

### 🔚 End of Biofield Engine API Documentation
