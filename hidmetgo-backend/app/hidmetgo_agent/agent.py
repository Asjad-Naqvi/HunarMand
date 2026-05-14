import os
import json
from google.adk.agents.llm_agent import Agent as BaseAgent
import google.generativeai as genai

# Initialize Gemini API
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

class OddJobsAgent(BaseAgent):
    """OddJobs AI Agent powered by Google Gemini"""
    
    def __init__(self, model='gemini-2.5-flash', name='root_agent', description='', instruction=''):
        super().__init__(model=model, name=name, description=description, instruction=instruction)
        self.model = genai.GenerativeModel(model)
    
    def generate_response(self, message):
        """
        Generate AI response using Google Gemini
        
        Args:
            message: User input message
            
        Returns:
            AI generated response
        """
        try:
            response = self.model.generate_content(message)
            return response.text
        except Exception as e:
            return f"Error generating response: {str(e)}"

# Initialize the agent
root_agent = OddJobsAgent(
    model='gemini-2.5-flash',
    name='root_agent',
    description='A helpful assistant for OddJobs service requests.',
    instruction='Answer user questions about hiring craftsmen or finding work opportunities. Be helpful and professional.',
)
