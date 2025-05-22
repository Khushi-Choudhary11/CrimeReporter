import google.generativeai as genai
import os
from dotenv import load_dotenv
import re
import json 

# Load environment variables
load_dotenv()

# Initialize Gemini with API key
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY environment variable is not set")

genai.configure(api_key=api_key)

model = genai.GenerativeModel('gemini-2.5-flash-preview-04-17')


def analyze_crime_text(description):
    """
    Analyze crime description using Gemini to extract structured information
    """
    prompt = f"""
You are an expert security analyst.
Analyze the following incident report and extract structured information:
1. Crime type (e.g., robbery, cybercrime, domestic violence, etc.)
2. Weapons used (if any)
3. People involved
4. Number of people injured
5. Urgency level (Low/Medium/High)
6. Authorities to contact (e.g., local police, cyber cell, women's cell)
Provide as a Python dictionary with keys: crime_type, weapons, people_involved, injured, urgency_level, authorities.
Text: {description}
"""
    try:
        response = model.generate_content(prompt)
        # The response text is now accessed directly from the response object
        response_text = response.text
        # Clean up the response text
        response_text = re.sub(r'```python|```json|```', '', response_text.strip())
        
        try:
            result = json.loads(response_text.replace("'", '"'))
            return result
        except json.JSONDecodeError:
            # Fallback default response if parsing fails
            return {
                "crime_type": "Unknown",
                "weapons": "None reported",
                "people_involved": "Unknown",
                "injured": 0,
                "urgency_level": "Medium",
                "authorities": ["Police"]
            }

    except Exception as e:
        print(f"Error in analyze_crime_text: {str(e)}")
        # Return default response on error
        return {
            "crime_type": "Unknown",
            "weapons": "None reported",
            "people_involved": "Unknown",
            "injured": 0,
            "urgency_level": "Medium",
            "authorities": ["Police"]
        }

def determine_severity(description):
    """
    Convert a text description to a severity score (1-5)
    1 = Very Low, 2 = Low, 3 = Medium, 4 = High, 5 = Very High
    """
    try:
        analysis = analyze_crime_text(description)
        
        # Extract urgency level and convert to severity score
        urgency = analysis.get("urgency_level", "Medium")
        
        if isinstance(urgency, str):
            if "High" in urgency:
                return 5 if "Very" in urgency or "Critical" in urgency else 4
            elif "Medium" in urgency:
                return 3
            elif "Low" in urgency:
                return 2 if "Very" in urgency else 1
            else:
                return 3  # Default to medium
        return 3  # Default medium severity
    except Exception as e:
        print(f"ML severity determination error: {e}")
        return 3  # Default medium severity

def combine_severity_scores(user_severity, model_severity, user_weight=0.3):
    """
    Combine user-provided and model-detected severity scores
    Args:
        user_severity (int): Severity score provided by user (1-5)
        model_severity (int): Severity score detected by model (1-5)
        user_weight (float): Weight given to user score (0.0 to 1.0)
    Returns:
        int: Final severity score (1-5)
    """
    model_weight = 1 - user_weight
    combined_score = (user_severity * user_weight) + (model_severity * model_weight)
    
    # Round to nearest integer and ensure it stays within 1-5 range
    final_score = min(max(round(combined_score), 1), 5)
    return final_score

