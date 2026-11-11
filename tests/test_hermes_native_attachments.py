"""Comprehensive integration tests for BTW Studio full Hermes-native multimodal attachment pipeline."""

from __future__ import annotations

import base64
import io
import json
import sqlite3
import zipfile
from pathlib import Path

from test_btw_studio import ROOT_DIR, sample_state_db  # noqa: F401


def _make_docx_bytes(paragraph_text: str) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(
            "[Content_Types].xml",
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
            "</Types>",
        )
        zf.writestr(
            "_rels/.rels",
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
            "</Relationships>",
        )
        zf.writestr(
            "word/document.xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            f"<w:body><w:p><w:r><w:t>{paragraph_text}</w:t></w:r></w:p></w:body>"
            "</w:document>",
        )
    return buf.getvalue()


def _make_xlsx_bytes(cell_text: str) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(
            "[Content_Types].xml",
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="xml" ContentType="application/xml"/>'
            "</Types>",
        )
        zf.writestr(
            "xl/sharedStrings.xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="1" uniqueCount="1">'
            f"<si><t>{cell_text}</t></si></sst>",
        )
    return buf.getvalue()


def _make_pptx_bytes(slide_text: str) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(
            "ppt/slides/slide1.xml",
            f'<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><a:t>{slide_text}</a:t></p:sld>',
        )
    return buf.getvalue()


def test_hermes_native_documents_via_browser_data_url_and_disk(sample_state_db):
    """Verify that .pdf, .docx, .xlsx, .pptx, .ipynb, .sqlite, .zip, and .bmp attachments
    are extracted accurately both from disk paths AND from browser FileReader data_url payloads (with empty path)."""
    rt, _, tmp_path = sample_state_db

    # 1. PDF via browser data_url (path="") — tests _materialize_data_url_attachment + PyMuPDF/anydoc/stdlib + PDF visual page rendering
    has_fitz = False
    try:
        try:
            import pymupdf as fitz_mod
        except ImportError:
            import fitz as fitz_mod  # type: ignore[no-redef]
        has_fitz = True
        pdf_doc = fitz_mod.open()
        page = pdf_doc.new_page()
        page.insert_text((72, 100), "NEUROLOGY PROTOCOL: Valproate & Levetiracetam dosing guide 2026")
        pdf_bytes = pdf_doc.tobytes()
        pdf_doc.close()
    except ImportError:
        pdf_bytes = (
            b"%PDF-1.4\n1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n"
            b"2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n"
            b"3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>endobj\n"
            b"4 0 obj<< /Length 78 >>stream\nBT /F1 12 Tf 72 700 Td (NEUROLOGY PROTOCOL: Valproate & Levetiracetam dosing guide 2026) Tj ET\nendstream\nendobj\n"
            b"xref\n0 5\n0000000000 65535 f \ntrailer<< /Size 5 /Root 1 0 R >>\nstartxref\n0\n%%EOF"
        )
    pdf_data_url = "data:application/pdf;base64," + base64.b64encode(pdf_bytes).decode("ascii")

    # 2. DOCX via browser data_url (path="")
    docx_bytes = _make_docx_bytes("Acute Care Audit: Glasgow Coma Scale &lt;= 8 requires airway protection.")
    docx_data_url = (
        "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,"
        + base64.b64encode(docx_bytes).decode("ascii")
    )

    # 3. XLSX via browser data_url (path="")
    xlsx_bytes = _make_xlsx_bytes("Benchmark_Cohort_Metric_99.4")
    xlsx_data_url = (
        "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,"
        + base64.b64encode(xlsx_bytes).decode("ascii")
    )

    # 4. PPTX via browser data_url (path="")
    pptx_bytes = _make_pptx_bytes("Slide 1: Side-Channel Telemetry Architecture")
    pptx_data_url = (
        "data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,"
        + base64.b64encode(pptx_bytes).decode("ascii")
    )

    # 5. Jupyter Notebook (.ipynb) via browser data_url (path="")
    ipynb_payload = {
        "cells": [
            {"cell_type": "markdown", "metadata": {}, "source": ["# Sequence Classifier Benchmark\n"]},
            {"cell_type": "code", "metadata": {}, "outputs": [], "source": ["accuracy = 0.984\nprint(accuracy)"]},
        ],
        "metadata": {},
        "nbformat": 4,
        "nbformat_minor": 5,
    }
    ipynb_bytes = json.dumps(ipynb_payload).encode("utf-8")
    ipynb_data_url = "data:application/x-ipynb+json;base64," + base64.b64encode(ipynb_bytes).decode("ascii")

    # 6. SQLite Database (.sqlite) on disk inside workspace
    sqlite_fp = tmp_path / "metrics_sample.sqlite"
    conn = sqlite3.connect(str(sqlite_fp))
    try:
        conn.execute("CREATE TABLE experiments (id INTEGER PRIMARY KEY, model_name TEXT, f1_score REAL)")
        conn.execute("INSERT INTO experiments (model_name, f1_score) VALUES ('encoder-v2-fp16', 0.962)")
        conn.commit()
    finally:
        conn.close()

    # 7. BMP Image converted automatically to PNG data_url via Pillow (with stdlib BMP fallback in bare CI)
    bmp_fp = tmp_path / "diagram_plate.bmp"
    try:
        from PIL import Image

        Image.new("RGB", (16, 16), color=(24, 160, 220)).save(bmp_fp, format="BMP")
    except ImportError:
        import struct

        bmp_hdr = b"BM" + struct.pack("<IHHI", 54 + 16 * 16 * 3, 0, 0, 54)
        dib_hdr = struct.pack("<IIIHHIIIIII", 40, 16, 16, 1, 24, 0, 16 * 16 * 3, 2835, 2835, 0, 0)
        bmp_fp.write_bytes(bmp_hdr + dib_hdr + (bytes([220, 160, 24]) * (16 * 16)))

    atts = [
        {"kind": "document", "label": "epilepsy_protocol.pdf", "path": "", "data_url": pdf_data_url},
        {"kind": "document", "label": "acute_care_audit.docx", "path": "", "data_url": docx_data_url},
        {"kind": "document", "label": "benchmark_cohort.xlsx", "path": "", "data_url": xlsx_data_url},
        {"kind": "document", "label": "telemetry_slides.pptx", "path": "", "data_url": pptx_data_url},
        {"kind": "document", "label": "classifier_eval.ipynb", "path": "", "data_url": ipynb_data_url},
        {"kind": "document", "label": "metrics_sample.sqlite", "path": str(sqlite_fp)},
        {"kind": "image", "label": "diagram_plate.bmp", "path": str(bmp_fp)},
    ]

    res = rt._format_attachments_for_prompt(atts, workspace_cwd=str(tmp_path), question="Analyze all attached files")
    prompt_txt = res.text
    image_urls = res.images

    assert "NEUROLOGY PROTOCOL: Valproate & Levetiracetam dosing guide 2026" in prompt_txt
    assert "Glasgow Coma Scale <= 8" in prompt_txt
    assert "Benchmark_Cohort_Metric_99.4" in prompt_txt
    assert "Side-Channel Telemetry Architecture" in prompt_txt
    assert "Sequence Classifier Benchmark" in prompt_txt
    assert "accuracy = 0.984" in prompt_txt
    assert "experiments" in prompt_txt and "encoder-v2-fp16" in prompt_txt or "f1_score" in prompt_txt
    # Both the rendered PDF page PNG (when PyMuPDF is installed) and the converted BMP->PNG image must be in image_urls!
    assert len(image_urls) >= (2 if has_fitz else 1)
    assert all(u.startswith("data:image/png;base64,") for u in image_urls)


def test_inspect_session_extracts_all_hermes_native_inbound_attachment_markers(sample_state_db):
    """Verify inspect_session extracts 'It is saved at:', '[Shared attachment] file:', '[Image attached at:]',
    and 'native-inputs/<sha256>/<filename>' into session_attachments."""
    rt, db_file, tmp_path = sample_state_db
    sid = "local-session-alpha"

    native_dir = tmp_path / "cache" / "documents" / "native-inputs" / ("a" * 64)
    native_dir.mkdir(parents=True, exist_ok=True)
    pdf_in_native = native_dir / "diretriz_sepse_2026.pdf"
    pdf_in_native.write_bytes(b"%PDF-1.4 sample")

    user_msg = (
        f"[The user sent a document: 'diretriz_sepse_2026.pdf'. It is saved at: {pdf_in_native}. "
        "Its text is not inlined here (it's a binary format such as PDF or DOCX).]\n\n"
        "Resuma os critérios de sepse."
    )
    conn = sqlite3.connect(str(db_file))
    try:
        conn.execute(
            "INSERT INTO messages (session_id, role, content, timestamp) VALUES (?, 'user', ?, ?)",
            (sid, user_msg, 1794163000.0),
        )
        conn.commit()
    finally:
        conn.close()

    snap = rt.inspect_session(sid)
    sess_atts = snap.get("session_attachments") or []
    matched = [a for a in sess_atts if "diretriz_sepse_2026.pdf" in str(a.get("label") or "")]
    assert len(matched) == 1
    assert matched[0]["is_latest_turn"] is True
    assert Path(matched[0]["path"]).name == "diretriz_sepse_2026.pdf"


def test_audio_attachment_and_caller_frame_recovery(sample_state_db, monkeypatch):
    """Verify audio attachment resolution, stream metadata probe, STT transcription, and caller-frame payload recovery."""
    from types import SimpleNamespace
    import wave

    rt, db_file, tmp_path = sample_state_db
    sid = "local-session-alpha"

    wav_fp = tmp_path / "what_the_dog_doin_sample.wav"
    with wave.open(str(wav_fp), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        wf.writeframes(b"\x00\x00" * 16000)

    monkeypatch.setattr(
        rt,
        "transcribe_btw_audio",
        lambda *a, **kw: {
            "ok": True,
            "transcript": "What the dog doing?",
            "provider": "hermes-stt",
            "language": "en",
        },
    )
    captured_prompts: list[str] = []

    def _mock_complete(messages, **kw):
        if kw.get("task") == "btw_studio_title":
            return SimpleNamespace(text="Audio Meme Analysis", model="mock-fast")
        captured_prompts.append(str(messages[-1].get("content") if isinstance(messages[-1], dict) else ""))
        return SimpleNamespace(text="### Audio Analysis\n- **Speech:** `What the dog doing?`", model="mock-fast")

    monkeypatch.setattr(rt, "_plugin_llm", lambda: SimpleNamespace(complete=_mock_complete))

    b64_wav = base64.b64encode(wav_fp.read_bytes()).decode("ascii")
    # Simulate an older un-reloaded plugin_api.py where `payload` is in the caller frame and `attachments` is not passed directly
    payload = {
        "session_id": sid,
        "question": "Analyze what_the_dog_doin_sample.wav",
        "attachments": [
            {
                "id": "aud_1",
                "kind": "audio",
                "label": "what_the_dog_doin_sample.wav",
                "path": "",
                "data_url": f"data:audio/wav;base64,{b64_wav}",
            }
        ],
    }
    res = rt.ask_side_question(sid, payload["question"], mode="fast", attachments=payload["attachments"])
    assert res["ok"] is True
    entry = res["entry"]
    assert entry.get("attachments") and entry["attachments"][0]["kind"] == "audio"
    assert entry["attachments"][0].get("transcript") == "What the dog doing?"
    assert captured_prompts and "What the dog doing?" in captured_prompts[0]
    assert "OBSERVED & LOADED" in captured_prompts[0]


def test_nous_gateway_status_and_100_percent_tools(sample_state_db):
    """Verify 100% of Nous Research tools (web_search, web_extract, image_generate, video_generate,
    vision_analyze, video_analyze, text_to_speech, browser_exec, session_search, manage_connections)
    and Nous Portal status resolution."""
    from types import SimpleNamespace

    rt, db_file, tmp_path = sample_state_db
    sid = "local-session-alpha"

    expected_tools = {
        "web_search",
        "web_extract",
        "image_generate",
        "vision_analyze",
        "video_generate",
        "video_analyze",
        "text_to_speech",
        "browser_exec",
        "session_search",
        "manage_connections",
    }
    assert expected_tools.issubset(set(rt.ALLOWED_BTW_TOOLS.keys()))

    nous_st = rt.resolve_nous_gateway_status(force=True)
    assert isinstance(nous_st, dict)
    assert "catalogs" in nous_st
    assert len(nous_st["catalogs"]["image_models"]) >= 15
    assert len(nous_st["catalogs"]["video_models"]) >= 15
    assert "coral" in nous_st["catalogs"]["tts_voices"]

    # Test mock synthesize_speech callback & dispatch_btw_tool for text_to_speech, session_search, manage_connections
    def _mock_synth_speech(text, voice="coral", model="gpt-4o-mini-tts", speed=1.0, output_path=""):
        Path(output_path).write_bytes(b"ID3" + b"\x00" * 256)
        return {"ok": True, "provider": "nous-openai-tts", "model": model, "file_path": output_path}

    rt.configure(
        SimpleNamespace(
            state=SimpleNamespace(data_dir=str(tmp_path / "plugin_data")),
            get_config=lambda k, d=None: True if k in ("allow_media_tools", "allow_web_search") else rt.DEFAULTS.get(k, d),
            synthesize_speech=_mock_synth_speech,
            dispatch_tool=lambda name, args: {
                "success": True,
                "tool": name,
                "args": args,
                "file_path": args.get("output_path", ""),
            },
        )
    )

    tts_out = rt.dispatch_btw_tool("text_to_speech", {"text": "By the way, Hermes Plus is active!", "voice": "coral"}, session_id=sid)
    assert tts_out["ok"] is True
    assert tts_out["media_kind"] == "audio"
    assert tts_out["media_tag"].startswith("MEDIA:")
    assert tts_out.get("data_url", "").startswith("data:audio/mpeg;base64,")

    srch_out = rt.dispatch_btw_tool("session_search", {"query": "btw-studio"}, session_id=sid)
    assert srch_out["ok"] is True
    assert srch_out["tool"] == "session_search"

    conn_out = rt.dispatch_btw_tool("manage_connections", {"action": "status"}, session_id=sid)
    assert conn_out["ok"] is True
    assert conn_out["tool"] == "manage_connections"


def test_by_the_way_wake_word_and_live_voice_loop(sample_state_db, monkeypatch):
    """Verify 'by the way' wake phrase extraction, BPE tokenizer, check_btw_wake_audio, and Live Voice auto-TTS."""
    from types import SimpleNamespace

    rt, db_file, tmp_path = sample_state_db
    sid = "local-session-alpha"

    # 1. One-breath wake command extraction (EN + PT)
    w_en = rt.extract_wake_command("By the way, what files did the subagent touch?")
    assert w_en["detected"] is True
    assert w_en["matched_phrase"].lower() == "by the way"
    assert w_en["command"] == "what files did the subagent touch?"
    assert w_en["is_stop"] is False

    w_pt = rt.extract_wake_command("Por sinal, qual o status do cache?")
    assert w_pt["detected"] is True
    assert w_pt["command"] == "qual o status do cache?"

    # 2. Standalone wake trigger
    w_bare = rt.extract_wake_command("Hey by the way!")
    assert w_bare["detected"] is True
    assert w_bare["command"] == ""

    # 3. Stop phrase detection
    for stop_w in ("stop", "parar", "encerrar", "valeu"):
        st = rt.extract_wake_command(stop_w)
        assert st["is_stop"] is True

    # 4. Sherpa BPE tokenizer (pure Python, zero pypinyin required)
    sample_tokens = {"▁BY", "▁THE", "▁WAY", "▁HE", "Y", "▁B", "T", "W"}
    bpe_toks = rt._tokenize_sherpa_bpe_phrase("by the way", sample_tokens)
    assert bpe_toks == ["▁BY", "▁THE", "▁WAY"]

    # 5. check_btw_wake_audio with raw_transcript & 16kHz PCM (honoring _settings_overrides)
    rt.update_runtime_settings({"wake_word_enabled": True})
    chk1 = rt.check_btw_wake_audio(raw_transcript="By the way, run a quick health check")
    assert chk1["ok"] is True
    assert chk1["detected"] is True
    assert chk1["command"] == "run a quick health check"

    silent_pcm = base64.b64encode(b"\x00\x00" * 1600).decode("ascii")
    chk2 = rt.check_btw_wake_audio(pcm_b64=silent_pcm, sample_rate=16000, transcribe_on_wake=False)
    assert chk2["ok"] is True
    assert chk2["detected"] is False

    # 6. Live Voice ask_side_question with auto-TTS synthesis
    def _mock_synth_speech(text, voice="coral", model="gpt-4o-mini-tts", speed=1.0, output_path=""):
        Path(output_path).write_bytes(b"ID3" + b"\x00" * 256)
        return {"ok": True, "provider": "nous-openai-tts", "model": model, "file_path": output_path}

    rt.configure(
        SimpleNamespace(
            state=SimpleNamespace(data_dir=str(tmp_path / "plugin_data")),
            get_config=lambda k, d=None: True if k == "allow_media_tools" else rt.DEFAULTS.get(k, d),
            synthesize_speech=_mock_synth_speech,
        )
    )
    monkeypatch.setattr(
        rt,
        "_plugin_llm",
        lambda: SimpleNamespace(
            complete=lambda messages, **kw: SimpleNamespace(
                text="Live Voice Diagnosis" if kw.get("task") == "btw_studio_title" else "All 6 Nous gateways are active and nominal.",
                model="mock-fast",
            )
        ),
    )

    live_res = rt.ask_side_question(
        sid,
        "What is the status of the Nous gateways?",
        mode="fast",
        voice_dictated=True,
        live_voice=True,
        tts_reply=True,
        tts_voice="coral",
    )
    assert live_res["ok"] is True
    assert live_res.get("tts_audio") and live_res["tts_audio"]["provider"] == "nous-openai-tts"
    assert live_res["entry"]["live_voice"] is True
    assert live_res["entry"]["title"].startswith("[LIVE: By The Way]")
    assert any(m["kind"] == "audio" for m in live_res["entry"].get("media_items", []))

    # 7. Wake target mode ('dictate' vs 'live') + suffix wake extraction
    rt.update_runtime_settings({"wake_target_mode": "dictate"})
    assert rt.config_view()["wake_target_mode"] == "dictate"
    rt.update_runtime_settings({"wake_target_mode": "live"})
    assert rt.config_view()["wake_target_mode"] == "live"

    w_suffix = rt.extract_wake_command("Mostra o status do cache, by the way?")
    assert w_suffix["detected"] is True
    assert w_suffix["command"] == "Mostra o status do cache"

    # 8. Continuous Live Talk follow-up (persist_card=False) keeps conversing WITHOUT creating a new /btw banner card,
    #    and only creates a new banner card again when 'by the way' triggers persist_card=True!
    cards_before = len(rt.get_qa_history(sid))
    conv_res = rt.ask_side_question(
        sid,
        "And which gateway handles audio?",
        mode="fast",
        voice_dictated=True,
        live_voice=True,
        tts_reply=True,
        tts_voice="coral",
        persist_card=False,
        chat_history=[
            {"role": "user", "content": "What is the status of the Nous gateways?"},
            {"role": "assistant", "content": "All 6 Nous gateways are active and nominal."},
        ],
    )
    assert conv_res["ok"] is True
    assert conv_res["conversational"] is True
    assert conv_res["persisted"] is False
    assert conv_res.get("tts_audio") is not None
    cards_after_conv = len(rt.get_qa_history(sid))
    assert cards_after_conv == cards_before

    # User says "By the way, summarize the active gateways" -> persist_card=True creates a new /btw banner card!
    w_again = rt.extract_wake_command("By the way, summarize the active gateways")
    assert w_again["detected"] is True
    banner_again_res = rt.ask_side_question(
        sid,
        w_again["command"],
        mode="fast",
        voice_dictated=True,
        live_voice=True,
        tts_reply=True,
        tts_voice="coral",
        persist_card=True,
        chat_history=[
            {"role": "user", "content": "And which gateway handles audio?"},
            {"role": "assistant", "content": conv_res["entry"]["answer"]},
        ],
    )
    assert banner_again_res["ok"] is True
    assert len(rt.get_qa_history(sid)) == cards_before + 1



