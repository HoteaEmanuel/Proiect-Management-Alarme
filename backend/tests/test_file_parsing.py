import io

import docx
import fitz
import pandas as pd
import pytest

from core import EmptyContentError, FileProcessingError, InvalidFilenameError, UnsupportedFileFormatError
from crud.chatbot import parse_docx, parse_file, parse_pdf


def _make_pdf_bytes(text: str | None) -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    if text:
        page.insert_text((72, 72), text)
    return doc.tobytes()


def _make_docx_bytes(paragraphs: list[str]) -> bytes:
    document = docx.Document()
    for paragraph in paragraphs:
        document.add_paragraph(paragraph)
    buffer = io.BytesIO()
    document.save(buffer)
    return buffer.getvalue()


def _make_csv_bytes(rows: list[dict]) -> bytes:
    return pd.DataFrame(rows).to_csv(index=False).encode("utf-8")


def test_parse_file_without_extension_raises_invalid_filename_error():
    with pytest.raises(InvalidFilenameError):
        parse_file("no_extension", b"irrelevant")


def test_parse_file_with_unsupported_extension_raises_unsupported_format_error():
    with pytest.raises(UnsupportedFileFormatError):
        parse_file("archive.zip", b"irrelevant")


def test_parse_file_csv_returns_records_as_json():
    content = _make_csv_bytes([{"alarm_number": "ALM-1", "status": "Active"}])

    result = parse_file("alarms.csv", content)

    assert "ALM-1" in result
    assert "Active" in result


def test_parse_file_xlsx_returns_markdown_table():
    buffer = io.BytesIO()
    pd.DataFrame([{"alarm_number": "ALM-1", "status": "Active"}]).to_excel(buffer, index=False)

    result = parse_file("alarms.xlsx", buffer.getvalue())

    assert "ALM-1" in result
    assert "Active" in result


def test_parse_file_csv_with_corrupted_content_raises_file_processing_error():
    with pytest.raises(FileProcessingError):
        parse_file("alarms.xlsx", b"this is not a real xlsx file")


def test_parse_pdf_extracts_text_with_page_marker():
    content = _make_pdf_bytes("Critical alarm on SRV-APP-01")

    result = parse_pdf(content)

    assert "Critical alarm on SRV-APP-01" in result
    assert "[Page 1]" in result


def test_parse_pdf_with_no_text_raises_empty_content_error():
    content = _make_pdf_bytes(text=None)

    with pytest.raises(EmptyContentError):
        parse_pdf(content)


def test_parse_pdf_with_corrupted_content_raises_file_processing_error():
    with pytest.raises(FileProcessingError):
        parse_pdf(b"not a real pdf")


def test_parse_docx_extracts_paragraph_text():
    content = _make_docx_bytes(["First line", "Second line"])

    result = parse_docx(content)

    assert "First line" in result
    assert "Second line" in result


def test_parse_docx_with_no_text_raises_empty_content_error():
    content = _make_docx_bytes([])

    with pytest.raises(EmptyContentError):
        parse_docx(content)


def test_parse_docx_with_corrupted_content_raises_file_processing_error():
    with pytest.raises(FileProcessingError):
        parse_docx(b"not a real docx")


def test_parse_file_dispatches_by_extension_case_insensitively():
    content = _make_csv_bytes([{"a": 1}])

    result = parse_file("DATA.CSV", content)

    assert result
