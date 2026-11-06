from pathlib import Path

from pydantic import BaseModel, Field, field_validator


MAX_FILE_BYTES = 1024 * 1024
SUPPORTED_EXTENSIONS = {".py", ".js", ".ts", ".txt", ".md"}


class Change(BaseModel):
    old_text: str
    new_text: str
    before_context: str | None = None
    after_context: str | None = None
    reason: str


class Patch(BaseModel):
    changes: list[Change]
    explanation: str


class EditRequest(BaseModel):
    code: str = Field(max_length=MAX_FILE_BYTES)
    instruction: str = Field(min_length=1, max_length=4000)
    file_name: str = Field(min_length=1, max_length=255)

    @field_validator("code")
    @classmethod
    def check_code_size(cls, code: str) -> str:
        if len(code.encode("utf-8")) > MAX_FILE_BYTES:
            raise ValueError("File content must be 1 MB or smaller")
        return code

    @field_validator("instruction")
    @classmethod
    def check_instruction_not_blank(cls, instruction: str) -> str:
        if not instruction.strip():
            raise ValueError("Instruction cannot be blank")
        return instruction

    @field_validator("file_name")
    @classmethod
    def check_file_name(cls, file_name: str) -> str:
        if (
            Path(file_name).name != file_name
            or "/" in file_name
            or "\\" in file_name
            or any(ord(char) < 32 for char in file_name)
            or file_name in {".", ".."}
        ):
            raise ValueError("File name must not contain a path")
        if Path(file_name).suffix.lower() not in SUPPORTED_EXTENSIONS:
            raise ValueError("Unsupported file type")
        return file_name