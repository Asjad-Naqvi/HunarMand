import os
import shutil
import re

# Base paths
ROOT_DIR = r"d:\oddconnector\hidmetgo"
COMPONENTS_DIR = os.path.join(ROOT_DIR, "components")
HAAZIR_DIR = os.path.join(COMPONENTS_DIR, "haazir")
HUNARZ_DIR = os.path.join(COMPONENTS_DIR, "hunarz")
HUNARMAND_DIR = os.path.join(COMPONENTS_DIR, "hunarmand")
APP_DIR = os.path.join(ROOT_DIR, "app")
BACKEND_DIR = os.path.join(ROOT_DIR, "hidmetgo-backend")

def replace_content(content):
    # Temporarily mask database passwords
    placeholder1 = "___DB_PASSWORD_RAW___"
    placeholder2 = "___DB_PASSWORD_ENCODED___"
    content = content.replace("haazir!23!@!#", placeholder1)
    content = content.replace("haazir%2123%21%40%21%23", placeholder2)
    
    # Specific agent phrases (replaces Haazir with Hunar for the agent)
    content = content.replace("Show Haazir's Thinking", "Show Hunar's Thinking")
    content = content.replace("Show Haazir’s Thinking", "Show Hunar's Thinking")
    content = content.replace("Haazir's Thinking", "Hunar's Thinking")
    content = content.replace("Haazir’s Thinking", "Hunar's Thinking")
    content = content.replace("Main Haazir hoon", "Main Hunar hoon")
    content = content.replace("Ask Haazir", "Ask Hunar")
    content = content.replace("Haazir Agent", "Hunar Agent")
    content = content.replace("Haazir agent", "Hunar agent")
    content = content.replace("Haazir consumer agent", "Hunar consumer agent")
    content = content.replace("Haazir provider agent", "Hunar provider agent")
    content = content.replace("Haazir Consumer Agent", "Hunar Consumer Agent")
    content = content.replace("Haazir Provider Agent", "Hunar Provider Agent")
    
    # Platform / Brand renames
    content = content.replace("Haazir Verified", "HunarMand Verified")
    content = content.replace("Haazir verified", "HunarMand verified")
    content = content.replace("Haazir Subsidy", "HunarMand Subsidy")
    content = content.replace("Haazir subsidy", "HunarMand subsidy")
    content = content.replace("Haazir-registered", "HunarMand-registered")
    content = content.replace("Haazir-subsidised", "HunarMand-subsidised")
    content = content.replace("Haazir-subsidized", "HunarMand-subsidized")
    content = content.replace("Haazir dispute system", "HunarMand dispute system")
    content = content.replace("Haazir loyalty", "HunarMand loyalty")
    content = content.replace("Haazir mobile platform", "HunarMand mobile platform")
    content = content.replace("Haazir platform", "HunarMand platform")
    
    # General brand replacements
    content = content.replace("Haazir", "HunarMand")
    content = content.replace("haazir", "hunarmand")
    content = content.replace("HAAZIR", "HUNARMAND")
    
    # Clean up previous attempts "HunarZ / hunarz"
    content = content.replace("HunarZ", "HunarMand")
    content = content.replace("hunarz", "hunarmand")
    
    # Restore passwords
    content = content.replace(placeholder1, "haazir!23!@!#")
    content = content.replace(placeholder2, "haazir%2123%21%40%21%23")
    return content

def cleanup_leftovers():
    print("--- 1. Cleaning up leftover directories ---")
    if os.path.exists(HUNARZ_DIR):
        print(f"Deleting leftover folder: {HUNARZ_DIR}")
        shutil.rmtree(HUNARZ_DIR)
    if os.path.exists(HUNARMAND_DIR):
        print(f"Deleting existing folder (for clean start): {HUNARMAND_DIR}")
        shutil.rmtree(HUNARMAND_DIR)

def migrate_components():
    print("\n--- 2. Creating Hunarmand component directories ---")
    os.makedirs(HUNARMAND_DIR, exist_ok=True)
    for sub in ["auth", "consumer", "provider", "shared"]:
        os.makedirs(os.path.join(HUNARMAND_DIR, sub), exist_ok=True)
        
    print("Copying and renaming files from haazir to hunarmand...")
    for root, dirs, files in os.walk(HAAZIR_DIR):
        for file in files:
            src_path = os.path.join(root, file)
            # Find relative subpath under haazir
            rel_sub = os.path.relpath(root, HAAZIR_DIR)
            dest_folder = os.path.join(HUNARMAND_DIR, rel_sub) if rel_sub != "." else HUNARMAND_DIR
            dest_path = os.path.join(dest_folder, file)
            
            print(f"Migrating: {src_path} -> {dest_path}")
            # Read and replace content in-transit
            try:
                with open(src_path, "r", encoding="utf-8") as f:
                    content = f.read()
                new_content = replace_content(content)
                with open(dest_path, "w", encoding="utf-8") as f:
                    f.write(new_content)
            except Exception as e:
                print(f"Error migrating {file}: {e}")

def update_routing():
    print("\n--- 3. Updating routing files in app/ ---")
    for root, dirs, files in os.walk(APP_DIR):
        for file in files:
            if file.endswith((".tsx", ".ts", ".js", ".json")):
                filepath = os.path.join(root, file)
                print(f"Updating routing file: {filepath}")
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read()
                    new_content = replace_content(content)
                    if new_content != content:
                        with open(filepath, "w", encoding="utf-8") as f:
                            f.write(new_content)
                        print(f"Updated: {file}")
                except Exception as e:
                    print(f"Error updating routing file {file}: {e}")

def update_metadata():
    print("\n--- 4. Updating root metadata configuration ---")
    # app.json
    app_json_path = os.path.join(ROOT_DIR, "app.json")
    if os.path.exists(app_json_path):
        print(f"Updating app.json: {app_json_path}")
        try:
            with open(app_json_path, "r", encoding="utf-8") as f:
                content = f.read()
            new_content = replace_content(content)
            with open(app_json_path, "w", encoding="utf-8") as f:
                f.write(new_content)
        except Exception as e:
            print(f"Error updating app.json: {e}")
            
    # PROJECT_CONTEXT.md
    proj_ctx_path = os.path.join(ROOT_DIR, "PROJECT_CONTEXT.md")
    if os.path.exists(proj_ctx_path):
        print(f"Updating PROJECT_CONTEXT.md: {proj_ctx_path}")
        try:
            with open(proj_ctx_path, "r", encoding="utf-8") as f:
                content = f.read()
            new_content = replace_content(content)
            with open(proj_ctx_path, "w", encoding="utf-8") as f:
                f.write(new_content)
        except Exception as e:
            print(f"Error updating PROJECT_CONTEXT.md: {e}")

    # Rename APK file
    apk_old = os.path.join(ROOT_DIR, "haazir.apk")
    apk_new = os.path.join(ROOT_DIR, "hunarmand.apk")
    if os.path.exists(apk_old):
        print(f"Renaming APK: {apk_old} -> {apk_new}")
        if os.path.exists(apk_new):
            os.remove(apk_new)
        os.rename(apk_old, apk_new)

def update_backend():
    print("\n--- 5. Updating backend python and schema files ---")
    for root, dirs, files in os.walk(BACKEND_DIR):
        # Skip pycache, venv, .git, etc.
        if any(ignored in root for ignored in ["__pycache__", "venv", ".git", "node_modules"]):
            continue
        for file in files:
            if file.endswith((".py", ".sql", ".sh", ".md", ".json")):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                    new_content = replace_content(content)
                    if new_content != content:
                        with open(filepath, "w", encoding="utf-8") as f:
                            f.write(new_content)
                        print(f"Updated backend file: {os.path.relpath(filepath, BACKEND_DIR)}")
                except Exception as e:
                    print(f"Error updating backend file {file}: {e}")

def delete_old_haazir():
    print("\n--- 6. Deleting old components/haazir directory ---")
    if os.path.exists(HAAZIR_DIR):
        print(f"Deleting: {HAAZIR_DIR}")
        shutil.rmtree(HAAZIR_DIR)
        print("Old haazir folder successfully deleted!")

if __name__ == "__main__":
    print("=== STARTING BRAND RECODE: HAAZIR -> HUNARMAND (APP) & HUNAR (AGENT) ===")
    cleanup_leftovers()
    migrate_components()
    update_routing()
    update_metadata()
    update_backend()
    delete_old_haazir()
    print("=== REBRAND COMPLETED SUCCESSFULLY ===")
