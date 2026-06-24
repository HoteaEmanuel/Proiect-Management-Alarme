import pytest

from integrations.chatbot.query_validator import is_query_safe


@pytest.mark.parametrize("query", [
    "SELECT * FROM Alarms",
    "select alarm_number from Alarms where status = 'Active'",
    "WITH cte AS (SELECT 1 AS x) SELECT * FROM cte",
    "EXEC dbo.CautareFiltrata",
    "exec dbo.GetDashboardKPIs",
])
def test_allowed_queries_pass(query):
    assert is_query_safe(query) is True


@pytest.mark.parametrize("query", [
    "",
    None,
])
def test_empty_query_is_rejected(query):
    assert is_query_safe(query) is False


@pytest.mark.parametrize("query", [
    "DELETE FROM Alarms",
    "UPDATE Alarms SET status = 'Closed'",
    "INSERT INTO Alarms VALUES (1)",
    "ALTER TABLE Alarms ADD COLUMN x INT",
    "TRUNCATE TABLE Alarms",
    "DROP TABLE Alarms",
    "SELECT * FROM Alarms; DROP TABLE Alarms",
])
def test_blacklisted_words_are_rejected(query):
    assert is_query_safe(query) is False


@pytest.mark.parametrize("query", [
    "UPDATE_LOG SELECT * FROM Alarms",
    "MERGE INTO Alarms USING Source ON 1=1",
])
def test_query_not_starting_with_allowed_word_is_rejected(query):
    assert is_query_safe(query) is False


def test_exec_with_disallowed_procedure_is_rejected():
    assert is_query_safe("EXEC dbo.SomeOtherProcedure") is False


def test_exec_with_allowed_procedure_and_args_passes():
    assert is_query_safe("EXEC dbo.CautareFiltrata @status='Active'") is True
