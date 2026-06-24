import io

import pandas as pd

from schemas import AgentCall, AgentContext, CloudinaryFileAttachment, ExcelStructure

import integrations.chatbot.excel_agent as excel_agent
from integrations.chatbot.excel_agent import get_excel_agent_response


def _context(sql_result):
    return AgentContext(user_message="Export active alarms", conversation_history=[], sql_result=sql_result)


def _call():
    return AgentCall(agent="excel", instruction="Export the active alarms data to Excel")


def test_excel_agent_maps_columns_according_to_llm_structure(mocker):
    sql_result = [
        {"alarm_number": "ALM-1", "status": "Active"},
        {"alarm_number": "ALM-2", "status": "Active"},
    ]
    mocker.patch.object(
        excel_agent,
        "llm_request",
        return_value=ExcelStructure(
            filename="active_alarms.xlsx",
            sheet_name="Active Alarms",
            headers=["Alarm Number", "Status"],
            column_mapping=["alarm_number", "status"],
        ),
    )
    upload_mock = mocker.patch.object(
        excel_agent,
        "upload_file_to_cloudinary",
        return_value=CloudinaryFileAttachment(
            filename="active_alarms.xlsx",
            url="https://cdn/active_alarms.xlsx",
            public_id="abc",
            resource_type="raw",
            file_format="xlsx",
            file_size=123,
        ),
    )

    result = get_excel_agent_response(db=mocker.Mock(), context=_context(sql_result), call=_call())

    uploaded_file = upload_mock.call_args.kwargs["file"]
    df = pd.read_excel(io.BytesIO(uploaded_file.content))

    assert result.file_export.filename == "active_alarms.xlsx"
    assert uploaded_file.filename == "active_alarms.xlsx"
    assert uploaded_file.preserve is True
    assert list(df.columns) == ["Alarm Number", "Status"]
    assert df["Alarm Number"].tolist() == ["ALM-1", "ALM-2"]


def test_excel_agent_with_empty_sql_result_still_produces_a_file(mocker):
    mocker.patch.object(
        excel_agent,
        "llm_request",
        return_value=ExcelStructure(
            filename="empty.xlsx",
            sheet_name="Data",
            headers=["Alarm Number"],
            column_mapping=["alarm_number"],
        ),
    )
    upload_mock = mocker.patch.object(
        excel_agent,
        "upload_file_to_cloudinary",
        return_value=CloudinaryFileAttachment(
            filename="empty.xlsx",
            url="https://cdn/empty.xlsx",
            public_id="abc",
            resource_type="raw",
            file_format="xlsx",
            file_size=1,
        ),
    )

    result = get_excel_agent_response(db=mocker.Mock(), context=_context(sql_result=None), call=_call())

    upload_mock.assert_called_once()
    assert result.file_export.filename == "empty.xlsx"
