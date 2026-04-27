from .prompts import *

def get_system_prompt(
        new_conversation_prompt: bool = False,
        persona_prompt: bool = True,
        language_prompt: bool = True,
        conversation_context_prompt: bool = False,
        db_schema_prompt: bool = False,
        db_safety_prompt: bool = False,
        sql_output_prompt: bool = False,
        query_results_prompt: bool = False,
        error_handling_prompt: bool = False,
        file_analysis_prompt: bool = False

):
    system_prompt = ""

    if persona_prompt:
        system_prompt = system_prompt + PERSONA_PROMPT
    
    if language_prompt:
        system_prompt = system_prompt + LANGUAGE_PROMPT
    
    if conversation_context_prompt:
        system_prompt = system_prompt + CONVERSATION_CONTEXT_PROMPT
    
    if db_schema_prompt:
        system_prompt = system_prompt + DB_SCHEMA_PROMPT
    if db_safety_prompt:
        system_prompt = system_prompt + DB_SAFETY_PROMPT
    
    if sql_output_prompt:
        system_prompt = system_prompt + SQL_OUTPUT_PROMPT

    if query_results_prompt:
        system_prompt = system_prompt + QUERY_RESULT_PROMPT
    
    if error_handling_prompt:
        system_prompt = system_prompt + ERROR_HANDLING_PROMPT

    if new_conversation_prompt:
        system_prompt = system_prompt + NEW_CONVERSATION_PROMPT
        
    if file_analysis_prompt:
        system_prompt = system_prompt + FILE_ANALYSIS_PROMPT
    
    return system_prompt