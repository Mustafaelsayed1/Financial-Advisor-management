from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import openai

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful financial advisor."},
                {"role": "user", "content": message}
            ]
        )
        
        return jsonify({"response": response.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate', methods=['POST'])
def generate_life_goals():
    try:
        data = request.get_json()
        instruction = data.get('instruction', '')
        
        # Parse the instruction JSON string back to an object
        import json
        form_data = json.loads(instruction)
        
        # Create a prompt for the AI
        prompt = f"""Based on the following information, generate specific, actionable life goals:
        Financial Goals: {form_data.get('financialGoals', '')}
        Career Goals: {form_data.get('careerGoals', '')}
        Personal Goals: {form_data.get('personalGoals', '')}
        Timeline: {form_data.get('timeline', '')}
        
        Please provide a structured list of specific, measurable, achievable, relevant, and time-bound (SMART) goals.
        Format the response as a numbered list with clear, actionable items."""
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional life coach and financial advisor."},
                {"role": "user", "content": prompt}
            ]
        )
        
        return jsonify({"output": response.choices[0].message.content})
    except Exception as e:
        print(f"Error in generate_life_goals: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze_survey', methods=['POST'])
def analyze_survey():
    try:
        data = request.get_json()
        # Add survey analysis logic here
        return jsonify({"analysis": "Survey analysis results"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate_plan', methods=['POST'])
def generate_plan():
    try:
        data = request.get_json()
        # Add financial plan generation logic here
        return jsonify({"plan": "Generated financial plan"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True) 