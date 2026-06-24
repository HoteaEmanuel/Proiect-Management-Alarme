from schemas import AgentContext, MessageRequest, OrchestratorResponse, RawFileAttachment

import integrations.chatbot.orchestrator as orchestrator
from integrations.chatbot.orchestrator import (
    build_orchestrator_system_prompt,
    build_output_blocks,
    get_orchestrator_response,
)


def test_build_output_blocks_includes_text_and_chart_when_present():
    context = AgentContext(
        user_message="msg",
        conversation_history=[],
        text_response="There are 42 active alarms",
        chart_config={"type": "bar"},
    )

    blocks = build_output_blocks(context)

    assert [block.type for block in blocks] == ["text", "chart"]
    assert blocks[0].content == "There are 42 active alarms"
    assert blocks[1].content == {"type": "bar"}


def test_build_output_blocks_is_empty_when_no_response_was_produced():
    context = AgentContext(user_message="msg", conversation_history=[])

    assert build_output_blocks(context) == []


def test_system_prompt_lists_all_available_agents():
    prompt = build_orchestrator_system_prompt()

    for agent_name in orchestrator.AVAILABLE_AGENTS:
        assert f"- {agent_name}:" in prompt


def test_system_prompt_includes_attached_file_names():
    files = [RawFileAttachment(filename="report.pdf", content=b"data")]

    prompt = build_orchestrator_system_prompt(files=files)

    assert "report.pdf" in prompt


def test_system_prompt_omits_file_section_when_no_files_attached():
    prompt = build_orchestrator_system_prompt(files=None)

    assert "attached the following files" not in prompt


def _message(request_id="req-1"):
    return MessageRequest(
        user_id="u1",
        conversation_id="c1",
        request_id=request_id,
        new_chat=False,
        message="How many active alarms are there?",
    )


def test_agent_chain_runs_in_order_and_threads_context(mocker):
    mocker.patch.object(
        orchestrator,
        "llm_request",
        return_value=OrchestratorResponse(
            conversation_title=None,
            agents=[
                {"agent": "sql", "instruction": "Count active alarms"},
                {"agent": "text", "instruction": "Describe the result"},
            ],
        ),
    )
    mocker.patch.object(orchestrator, "get_conversation_title", return_value="Existing title")
    mocker.patch.object(orchestrator.redis_client, "exists", return_value=False)

    call_order = []

    def fake_sql(db, context, call):
        call_order.append("sql")
        context.sql_result = [{"count": 5}]
        return context

    def fake_text(db, context, call):
        call_order.append("text")
        context.text_response = f"There are {len(context.sql_result)} rows"
        return context

    mocker.patch.dict(
        orchestrator.AVAILABLE_AGENTS,
        {
            "sql": {"run": fake_sql, "description": "sql"},
            "text": {"run": fake_text, "description": "text"},
        },
        clear=False,
    )

    output_blocks, agent_context = get_orchestrator_response(
        db=mocker.Mock(), request=_message(), context_history=[]
    )

    assert call_order == ["sql", "text"]
    assert agent_context.text_response == "There are 1 rows"
    assert output_blocks[0].content == "There are 1 rows"


def test_cancellation_flag_stops_remaining_agents(mocker):
    mocker.patch.object(
        orchestrator,
        "llm_request",
        return_value=OrchestratorResponse(
            conversation_title=None,
            agents=[
                {"agent": "sql", "instruction": "Count active alarms"},
                {"agent": "text", "instruction": "Describe the result"},
            ],
        ),
    )
    mocker.patch.object(orchestrator, "get_conversation_title", return_value="Existing title")
    mocker.patch.object(orchestrator.redis_client, "exists", return_value=True)

    sql_mock = mocker.Mock()
    text_mock = mocker.Mock()
    mocker.patch.dict(
        orchestrator.AVAILABLE_AGENTS,
        {
            "sql": {"run": sql_mock, "description": "sql"},
            "text": {"run": text_mock, "description": "text"},
        },
        clear=False,
    )

    _, agent_context = get_orchestrator_response(db=mocker.Mock(), request=_message(), context_history=[])

    sql_mock.assert_not_called()
    text_mock.assert_not_called()
    assert agent_context.is_stopped is True
    assert agent_context.text_response == "Response was canceled by the user"
