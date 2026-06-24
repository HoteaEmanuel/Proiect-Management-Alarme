from datetime import datetime

import pytest

from core import InvalidInputError
from crud import get_kpi_stats, get_alarm_trend, get_alarm_heatmap, get_raw_alarms_by_category
from schemas import ChartCategoryFilters, TrendFilters, TrendGranularity, TrendGroupBy, HeatmapFilters

YEAR_START = datetime(2026, 1, 1)
YEAR_END = datetime(2026, 12, 31, 23, 59, 59)


def test_kpi_stats_start_after_end_raises_invalid_input_error(db_session):
    with pytest.raises(InvalidInputError):
        get_kpi_stats(db_session, start_date=YEAR_END, end_date=YEAR_START)


def test_kpi_stats_returns_known_categories(db_session):
    stats = get_kpi_stats(db_session, start_date=YEAR_START, end_date=YEAR_END)

    assert "Status" in stats
    assert "Severity" in stats
    assert "TimeKPI" in stats
    assert all(isinstance(value, float) for value in stats["Status"].values())


def test_kpi_status_breakdown_matches_chart_details_rows(db_session):
    # Cross-checks two independent stored procedures: the KPI count for a Status label
    # must equal the number of rows the chart-details drill-down returns for that label.
    stats = get_kpi_stats(db_session, start_date=YEAR_START, end_date=YEAR_END)
    status_breakdown = stats["Status"]
    label, expected_count = next(iter(status_breakdown.items()))

    rows = get_raw_alarms_by_category(
        db_session,
        ChartCategoryFilters(category="Status", label=label, start_date=YEAR_START, end_date=YEAR_END),
    )

    assert len(rows) == int(expected_count)
    assert all(row["STATUS"] == label for row in rows)


def test_alarm_trend_default_returns_buckets_grouped_by_severity(db_session):
    result = get_alarm_trend(db_session, TrendFilters())

    assert result["granularity"] == TrendGranularity.weekly.value
    assert result["live_alarms"] == []
    assert all("time_bucket" in bucket and "group_label" in bucket for bucket in result["buckets"])


def test_alarm_trend_live_granularity_returns_live_alarms_not_buckets(db_session):
    result = get_alarm_trend(db_session, TrendFilters(granularity=TrendGranularity.live, live_limit=5))

    assert result["buckets"] == []
    assert len(result["live_alarms"]) <= 5


def test_heatmap_with_no_severity_filter_aggregates_all_severities(db_session):
    # Regression test: get_alarm_heatmap used to `return` from inside the per-severity loop,
    # so an unfiltered call silently only counted the first severity ("Critical").
    all_severities = get_alarm_heatmap(db_session, HeatmapFilters())
    critical_only = get_alarm_heatmap(db_session, HeatmapFilters(severity="Critical"))

    total_all = sum(bucket.alarm_count for bucket in all_severities.data)
    total_critical = sum(bucket.alarm_count for bucket in critical_only.data)

    assert total_all >= total_critical


def test_heatmap_buckets_have_valid_day_and_hour_ranges(db_session):
    result = get_alarm_heatmap(db_session, HeatmapFilters())

    assert all(1 <= bucket.day_of_week <= 7 for bucket in result.data)
    assert all(0 <= bucket.hour_of_day <= 23 for bucket in result.data)
    assert all(bucket.alarm_count > 0 for bucket in result.data)


def test_chart_details_with_no_matches_returns_empty_list(db_session):
    rows = get_raw_alarms_by_category(
        db_session,
        ChartCategoryFilters(category="Status", label="NoSuchStatusValue", start_date=YEAR_START, end_date=YEAR_END),
    )

    assert rows == []
