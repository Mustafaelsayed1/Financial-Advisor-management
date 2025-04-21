from flask import Flask, request, jsonify
from flask_cors import CORS  # Importing CORS
import google.generativeai as genai
import json

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# ✅ Replace with your actual Gemini API key (keep secret in production!)
genai.configure(api_key=)

# ✅ Load Gemini model (you can change to gemini-pro if needed)
model = genai.GenerativeModel("gemini-1.5-flash")

@app.route("/generate", methods=["POST"])
def generate():
    try:
        # 🧠 Get user data from frontend
        user_input = request.get_json()

        # ✅ Extract fields safely
        income = user_input.get("income", "0")
        rent = user_input.get("rent", "0")
        utilities = user_input.get("utilities", "0")
        diet = user_input.get("dietPlan", "Not Provided")
        transport = user_input.get("transportCost", "0")
        recurring = user_input.get("otherRecurring", "None")
        savings = user_input.get("savingAmount", "0")
        custom_expenses = user_input.get("customExpenses", [])

        # ✅ Build clear, structured prompt
        prompt = (
            "You are a professional financial advisor AI.\n"
            "Analyze this user's financial data and provide:\n"
            "1. A short summary\n"
            "2. 6 personalized advice tips\n\n"

            "User Profile:\n"
            f"- Total Monthly Income: {income} EGP\n"
            f"- Rent or Mortgage: {rent} EGP\n"
            f"- Utilities: {utilities} EGP\n"
            f"- Diet Plan: {diet}\n"
            f"- Transportation Cost: {transport} EGP\n"
            f"- Other Recurring Expenses: {recurring}\n"
            f"- Monthly Savings: {savings} EGP\n"
            "Custom Expenses:\n" +
            "".join([f"  - {e.get('name', '')}: {e.get('amount', '')} EGP\n" for e in custom_expenses]) +

            "\n\nRespond ONLY in valid JSON using this format:\n"
            '{\n'
            '  "summary": "Short financial overview...",\n'
            '  "advice": [\n'
            '    "Tip 1 - ...",\n'
            '    "Tip 2 - ...",\n'
            '    "Tip 3 - ...",\n'
            '    "Tip 4 - ...",\n'
            '    "Tip 5 - ...",\n'
            '    "Tip 6 - ..."\n'
            '  ]\n'
            '}\n'
            "\nMake sure all numbers and suggestions are based on the input above. Use EGP currency."
        )

        # 🧠 Debug print (optional)
        print("📤 Prompt sent to Gemini:\n", prompt)

        # ✅ Generate response
        response = model.generate_content(prompt)
        result_text = response.text

        # ✅ Try parsing as JSON
        try:
            result_json = json.loads(result_text)
            return jsonify(result_json)
        except Exception:
            return jsonify({"output": result_text})  # fallback if model returns plain text

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Start Flask server
if __name__ == "__main__":
    app.run(port=5001)