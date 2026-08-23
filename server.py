from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import torch

app = Flask(__name__)
# Enable CORS so the browser can make requests to this backend
CORS(app)

print("Loading model and tokenizer... This might take a minute...")

base_model_name = "Qwen/Qwen2.5-1.5B-Instruct"
adapter_path = "./BorrowBot AI Model"

# Load the tokenizer from the adapter folder (which contains tokenizer configs)
tokenizer = AutoTokenizer.from_pretrained(adapter_path)

# Load the base model
model = AutoModelForCausalLM.from_pretrained(
    base_model_name,
    torch_dtype=torch.float16,  # Use float16 to save memory
    device_map="auto"           # Automatically map to GPU if available
)

# Apply your local LoRA adapter
model = PeftModel.from_pretrained(model, adapter_path)
print("Model loaded successfully! Server is ready.")


# Serve the main HTML page
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Serve other static files (css, js)
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_msg = data.get('message', '')
    
    # We use the Qwen chat template structure
    messages = [
        {"role": "system", "content": "You are BorrowBot, an AI customer support assistant for BorrowLoop—a peer-to-peer community sharing marketplace. Keep answers short and concise."},
        {"role": "user", "content": user_msg}
    ]
    
    # Apply chat template
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer([text], return_tensors="pt").to(model.device)
    
    # Generate the response
    with torch.no_grad():
        outputs = model.generate(
            **inputs, 
            max_new_tokens=150, 
            temperature=0.7,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )
    
    # Extract only the newly generated text (ignoring the input prompt)
    generated_ids = outputs[0][len(inputs.input_ids[0]):]
    reply = tokenizer.decode(generated_ids, skip_special_tokens=True)
    
    return jsonify({"reply": reply.strip()})

if __name__ == '__main__':
    # Run the server on port 5000
    app.run(host='0.0.0.0', port=5000)
