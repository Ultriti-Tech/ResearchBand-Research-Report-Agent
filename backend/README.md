(Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned) ; (& "e:\python\Generative AI\.venv\Scripts\Activate.ps1")

uvicorn main:app --reload