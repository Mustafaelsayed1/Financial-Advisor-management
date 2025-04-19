from huggingface_hub import upload_folder
import os

HF_TOKEN = "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"
repo_id = "karimm-74/phi2-finetuned-LM"
folder_path = "phi2-finetuned-LM/phi2-finetuned-LM"

# ✅ Confirm the folder exists
assert os.path.isdir(folder_path), f"❌ Path not found: {folder_path}"

# ✅ Upload
upload_folder(
    folder_path=folder_path,
    repo_id=repo_id,
    repo_type="model",
    token=HF_TOKEN
)
