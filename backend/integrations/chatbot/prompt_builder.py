from .prompts import *

def get_system_prompt(
        persona_prompt: bool = True,
        language_prompt: bool = True,
        conversation_context_prompt: bool = False,
        db_schema_prompt: bool = False,
        db_safety_prompt: bool = False,
        sql_output_prompt: bool = False,
        error_handling_prompt: bool = False
):
    system_prompt = ""
    if persona_prompt:
        system_prompt = system_prompt + persona_prompt
    
    if language_prompt:
        system_prompt = system_prompt + language_prompt
    
    if conversation_context_prompt:
        system_prompt = system_prompt + conversation_context_prompt
    
    if db_schema_prompt:
        system_prompt = system_prompt + db_schema_prompt
    
    if db_safety_prompt:
        system_prompt = system_prompt + db_safety_prompt
    
    if sql_output_prompt:
        system_prompt = system_prompt + sql_output_prompt
    
    if error_handling_prompt:
        system_prompt = system_prompt + error_handling_prompt
    
    return system_prompt