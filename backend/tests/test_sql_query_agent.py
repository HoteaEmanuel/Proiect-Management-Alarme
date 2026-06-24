from schemas import AgentCall, AgentContext, LLMSQLResponse

import integrations.chatbot.sql_query_agent as sql_query_agent
from integrations.chatbot.sql_query_agent import get_sql_agent_response


def _context():
    return AgentContext(user_message="How many active alarms are there?", conversation_history=[])


def _call():
    return AgentCall(agent="sql", instruction="Count active alarms")


def test_safe_query_is_executed_and_stored_in_context(mocker):
    mocker.patch.object(
        sql_query_agent,
        "llm_request",
        return_value=LLMSQLResponse(has_sql_query=True, sql_query="SELECT COUNT(*) FROM Alarms", text_response=None),
    )
    run_query_mock = mocker.patch.object(sql_query_agent, "run_llm_query", return_value=[{"count": 42}])

    result = get_sql_agent_response(db=mocker.Mock(), context=_context(), call=_call())

    run_query_mock.assert_called_once()
    assert result.sql_query_text == "SELECT COUNT(*) FROM Alarms"
    assert result.sql_result == [{"count": 42}]


def test_unsafe_query_is_blocked_and_never_executed(mocker):
    mocker.patch.object(
        sql_query_agent,
        "llm_request",
        return_value=LLMSQLResponse(has_sql_query=True, sql_query="DROP TABLE Alarms", text_response=None),
    )
    run_query_mock = mocker.patch.object(sql_query_agent, "run_llm_query")

    result = get_sql_agent_response(db=mocker.Mock(), context=_context(), call=_call())

    run_query_mock.assert_not_called()
    assert result.sql_query_text is None
    assert result.sql_result is None


def test_no_sql_query_generated_leaves_context_untouched(mocker):
    mocker.patch.object(
        sql_query_agent,
        "llm_request",
        return_value=LLMSQLResponse(has_sql_query=False, sql_query=None, text_response="I need more details"),
    )
    run_query_mock = mocker.patch.object(sql_query_agent, "run_llm_query")

    result = get_sql_agent_response(db=mocker.Mock(), context=_context(), call=_call())

    run_query_mock.assert_not_called()
    assert result.sql_result is None
