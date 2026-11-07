# EX-HIDS: Explainable Hybrid Intrusion Detection System

[![Live Demo](https://img.shields.io/badge/Live-SOC_Portal-emerald)](https://fancy-semolina-402425.netlify.app)
[![Architecture](https://img.shields.io/badge/Architecture-XGBoost_%2B_TreeSHAP-indigo)](#system-architecture)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

**EX-HIDS** is a next-generation Security Operations Center (SOC) telemetry framework designed to eliminate the black-box opacity of conventional machine learning in intrusion detection. By coupling high-throughput decision-tree inference with game-theoretic **TreeSHAP (SHapley Additive exPlanations)**, EX-HIDS provides real-time threat mitigation alongside feature-level mathematical accountability.

---

## 🚀 Live Demonstration
The interactive SOC portal and attack simulation interface is deployed at:  
👉 **[https://fancy-semolina-402425.netlify.app](https://fantastic-brioche-3418e6.netlify.app)**

---

## 📌 Problem Statement & Research Motivation
Conventional intrusion detection systems (IDS) operating with deep learning or ensemble classifiers suffer from the **"Black-Box Problem"**:
* Models generate anomalous/malicious flags without explaining the underlying statistical triggers.
* SOC analysts face high false-positive fatigue and lack granular justification for dynamic firewall rule generation.
* Auditing decisions in high-consequence enterprise infrastructure requires game-theoretic mathematical guarantees.

**EX-HIDS resolves this by providing real-time, per-packet Shapley attribution scores directly on the telemetry stream.**

---

## 🛠️ System Architecture

The pipeline consists of a continuous feedback loop:

```text
[ Live Network Traffic / Flow Telemetry ]
                   │
                   ▼
       [ Real-time Feature Extractor ]
       (syn_flag_ratio, dst_host_count, pkt_rate_1s, etc.)
                   │
                   ▼
         [ XGBoost Classifier ]
          /                 \
         /                   \
   [ Nominal Flow ]     [ Malicious Flow ]
         │                     │
      (Pass)                   ├─► Automated Firewall Rule (Drop Socket)
                               ├─► TreeSHAP Attribution Engine (Per-feature impact)
                               └─► WebSocket Broadcast to SOC Dashboard
