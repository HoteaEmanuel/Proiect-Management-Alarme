import uuid

from crud import get_library_files


def test_returns_only_files_belonging_to_the_given_user(db_session, darius_user_id):
    files = get_library_files(db_session, user_id=darius_user_id)

    assert files
    assert all(f.conversation_id for f in files)


def test_unknown_user_returns_empty_list(db_session):
    files = get_library_files(db_session, user_id=str(uuid.uuid4()))

    assert files == []


def test_results_are_ordered_by_created_at_descending(db_session, darius_user_id):
    files = get_library_files(db_session, user_id=darius_user_id)

    timestamps = [f.created_at for f in files]
    assert timestamps == sorted(timestamps, reverse=True)


def test_filter_by_file_format_returns_only_matching_files(db_session, darius_user_id):
    all_files = get_library_files(db_session, user_id=darius_user_id)
    available_formats = {f.file_format for f in all_files}
    assert available_formats  # sanity check: seed data has at least one file

    target_format = next(iter(available_formats))
    filtered = get_library_files(db_session, user_id=darius_user_id, file_format=target_format)

    assert filtered
    assert all(f.file_format == target_format for f in filtered)


def test_filter_by_unknown_file_format_returns_empty_list(db_session, darius_user_id):
    filtered = get_library_files(db_session, user_id=darius_user_id, file_format="no-such-format")

    assert filtered == []


def test_filter_by_conversation_id_returns_only_files_from_that_conversation(db_session, darius_user_id):
    all_files = get_library_files(db_session, user_id=darius_user_id)
    target_conversation_id = all_files[0].conversation_id

    filtered = get_library_files(db_session, user_id=darius_user_id, conversation_id=target_conversation_id)

    assert filtered
    assert all(f.conversation_id == target_conversation_id for f in filtered)


def test_filter_by_date_range_excludes_files_outside_the_range(db_session, darius_user_id):
    all_files = get_library_files(db_session, user_id=darius_user_id)
    timestamps = sorted(f.created_at for f in all_files)
    midpoint = timestamps[len(timestamps) // 2]

    filtered = get_library_files(db_session, user_id=darius_user_id, date_from=midpoint)

    assert filtered
    assert all(f.created_at >= midpoint for f in filtered)
    assert len(filtered) < len(all_files)


def test_each_file_includes_conversation_metadata(db_session, darius_user_id):
    files = get_library_files(db_session, user_id=darius_user_id)

    assert all(f.role in ("user", "assistant") for f in files)
    assert all(f.conversation_title for f in files)
