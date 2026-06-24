import pytest

from core import InvalidInputError
from crud import get_filtered_alarms, get_alarms_for_export
from schemas import RequestFilters


def _filters(**overrides):
    return RequestFilters(**overrides)


def test_default_filters_return_a_page_sized_to_page_size_or_less(db_session):
    total_pages, total_alarms, alarms = get_filtered_alarms(db_session, _filters())

    assert total_alarms >= 0
    assert total_pages == (total_alarms + 9) // 10
    assert len(alarms) == min(total_alarms, 10)  # default page_size is 10


def test_filter_by_status_returns_only_matching_alarms(db_session):
    _, total_alarms, alarms = get_filtered_alarms(db_session, _filters(status="Active", page_size=50))

    assert all(alarm["status"] == "Active" for alarm in alarms)
    assert len(alarms) == min(total_alarms, 50)


def test_filter_by_summary_search_returns_only_matching_alarms(db_session):
    # Derive a real search term from existing data instead of assuming specific seed content.
    _, _, sample = get_filtered_alarms(db_session, _filters(page_size=1))
    if not sample or not sample[0]["summary"]:
        pytest.skip("No alarm with a summary available to derive a search term from")

    search_term = sample[0]["summary"].split()[0]

    _, _, alarms = get_filtered_alarms(db_session, _filters(summary_like=search_term, page_size=50))

    assert alarms
    assert all(search_term.lower() in (alarm["summary"] or "").lower() for alarm in alarms)


def test_filter_with_no_matches_returns_empty_result(db_session):
    total_pages, total_alarms, alarms = get_filtered_alarms(
        db_session, _filters(server_name_like="no-such-server-xyz-does-not-exist")
    )

    assert (total_pages, total_alarms, alarms) == (0, 0, [])


def test_pagination_pages_are_disjoint_and_within_page_size(db_session):
    _, total_alarms, _ = get_filtered_alarms(db_session, _filters(page_size=1))
    if total_alarms < 2:
        pytest.skip("Not enough alarms in the database to test pagination across two pages")

    _, _, page_1 = get_filtered_alarms(db_session, _filters(current_page=1, page_size=1))
    _, _, page_2 = get_filtered_alarms(db_session, _filters(current_page=2, page_size=1))

    assert len(page_1) == 1
    assert len(page_2) == 1
    assert page_1[0]["alarm_number"] != page_2[0]["alarm_number"]


def test_total_pages_matches_total_alarms_and_page_size(db_session):
    page_size = 7
    total_pages, total_alarms, _ = get_filtered_alarms(db_session, _filters(page_size=page_size))

    expected_pages = (total_alarms + page_size - 1) // page_size if total_alarms else 0
    assert total_pages == expected_pages


def test_start_date_after_end_date_raises_invalid_input_error(db_session):
    with pytest.raises(InvalidInputError):
        get_filtered_alarms(
            db_session,
            _filters(
                date_column_to_filter="first_occurence_datetime",
                start_date="2026-12-31T00:00:00",
                end_date="2026-01-01T00:00:00",
            ),
        )


def test_export_ignores_pagination_and_returns_all_matching_alarms(db_session):
    _, total_alarms, _ = get_filtered_alarms(db_session, _filters(status="Active", page_size=1))
    alarms = get_alarms_for_export(db_session, _filters(status="Active", page_size=10))

    assert len(alarms) == total_alarms


def test_export_treats_all_status_as_no_filter(db_session):
    # get_alarms_for_export caps page_size at 1000 (no row limit handling yet - see de_facut.txt),
    # so the export can return fewer rows than total_alarms when the dataset exceeds that cap.
    _, total_alarms, _ = get_filtered_alarms(db_session, _filters(page_size=1))
    alarms = get_alarms_for_export(db_session, _filters(status="All"))

    assert len(alarms) == min(total_alarms, 1000)
